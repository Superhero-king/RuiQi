package main

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	client_native "github.com/haproxytech/client-native/v6"
	"github.com/haproxytech/client-native/v6/configuration"
	cfg_opt "github.com/haproxytech/client-native/v6/configuration/options"
	"github.com/haproxytech/client-native/v6/models"
	"github.com/haproxytech/client-native/v6/options"
	runtime_api "github.com/haproxytech/client-native/v6/runtime"
	runtime_options "github.com/haproxytech/client-native/v6/runtime/options"
	spoe "github.com/haproxytech/client-native/v6/spoe"
)

type haproxyOptions struct {
	ConfigBaseDir      string
	ConfigFile         string
	HAProxyBin         string
	BackupsNumber      int
	TransactionDir     string
	SpoeDir            string
	SpoeTransactionDir string
	SocketDir          string
	PidFile            string
}

func main() {
	// 创建上下文
	ctx := context.Background()

	// 获取用户主目录，以解决权限问题
	homeDir, err := os.UserHomeDir()
	if err != nil {
		log.Fatalf("无法获取用户主目录: %v", err)
	}

	// 设置HAProxy选项，使用用户自己的目录
	haproxyOpts := &haproxyOptions{
		ConfigBaseDir:      filepath.Join(homeDir, "haproxy"),
		ConfigFile:         filepath.Join(homeDir, "haproxy/conf/haproxy.cfg"),
		HAProxyBin:         "haproxy", // 根据实际路径调整
		BackupsNumber:      0,
		TransactionDir:     filepath.Join(homeDir, "haproxy/conf/transactions"),
		SocketDir:          filepath.Join(homeDir, "haproxy/conf/sock"),
		PidFile:            filepath.Join(homeDir, "haproxy/conf/haproxy.pid"),
		SpoeDir:            filepath.Join(homeDir, "haproxy/spoe"),
		SpoeTransactionDir: filepath.Join(homeDir, "haproxy/spoe/transaction"),
	}

	// 确保所需目录存在并创建基本配置
	createDirsIfNotExist(haproxyOpts)

	// 1. 先创建一个配置客户端，准备HAProxy配置
	confClient, err := configuration.New(ctx,
		cfg_opt.ConfigurationFile(haproxyOpts.ConfigFile),
		cfg_opt.HAProxyBin(haproxyOpts.HAProxyBin),
		cfg_opt.Backups(haproxyOpts.BackupsNumber),
		cfg_opt.UsePersistentTransactions,
		cfg_opt.TransactionsDir(haproxyOpts.TransactionDir),
		cfg_opt.MasterWorker,
		cfg_opt.UseMd5Hash,
	)
	if err != nil {
		log.Fatalf("设置配置客户端错误: %s", err.Error())
	}

	//spoe
	prms := spoe.Params{
		SpoeDir:        haproxyOpts.SpoeDir,
		TransactionDir: haproxyOpts.SpoeTransactionDir,
	}
	spoeClient, err := spoe.NewSpoe(prms)
	if err != nil {
		log.Fatalf("error setting up spoe: %v", err)
	}

	// 检查 SPOE 配置文件，如果存在则删除，然后创建新的配置文件
	spoeFilePath := filepath.Join(haproxyOpts.SpoeDir, "coraza-spoa.yaml")
	if _, err := os.Stat(spoeFilePath); err == nil {
		// 文件存在，删除它
		fmt.Println("SPOE 配置文件已存在，正在删除...")
		if err := os.Remove(spoeFilePath); err != nil {
			log.Fatalf("删除现有 SPOE 配置文件失败: %v", err)
		}
		fmt.Println("已成功删除现有 SPOE 配置文件")
	} else if !os.IsNotExist(err) {
		// 发生了除"文件不存在"之外的错误
		log.Fatalf("检查 SPOE 配置文件状态失败: %v", err)
	}

	// 创建新的配置文件
	fmt.Println("正在创建新的 SPOE 配置文件...")
	emptyReader := bytes.NewReader([]byte{})
	readCloser := io.NopCloser(emptyReader)
	_, err = spoeClient.Create("coraza-spoa.yaml", readCloser)
	if err != nil {
		log.Fatalf("创建 SPOE 配置文件失败: %v", err)
	}
	fmt.Println("已成功创建 SPOE 配置文件")

	// 设置 SPOE 配置
	setupSPOE(spoeClient)

	// 配置HAProxy
	setupHAProxyConfig(confClient, haproxyOpts)

	// 2. 启动HAProxy进程
	haproxyCmd, err := startHAProxy(haproxyOpts)
	if err != nil {
		log.Fatalf("启动HAProxy失败: %v", err)
	}

	// 确保在程序退出时停止HAProxy
	defer func() {
		stopHAProxy(haproxyCmd, haproxyOpts)
	}()

	// 等待HAProxy启动并创建套接字
	masterSocketPath := filepath.Join(haproxyOpts.SocketDir, "haproxy-master.sock")
	fmt.Println("等待HAProxy启动并创建套接字...")
	waitForSocket(masterSocketPath)

	// 3. 现在创建运行时客户端连接到已启动的HAProxy
	ms := runtime_options.MasterSocket(masterSocketPath)
	runtimeClient, err := runtime_api.New(ctx, ms)
	if err != nil {
		log.Fatalf("设置运行时客户端错误: %s", err.Error())
	}

	rawResult, err := runtimeClient.ExecuteRaw("show info")
	if err != nil {
		log.Printf("测试套接字通信失败: %v", err)
	} else {
		fmt.Println("套接字通信测试成功，帮助信息前100个字符:", rawResult)
	}

	// 4. 组合配置和运行时客户端
	clientOpts := []options.Option{
		options.Configuration(confClient),
		options.Runtime(runtimeClient),
		options.Spoe(spoeClient),
	}

	// 创建完整客户端
	client, err := client_native.New(ctx, clientOpts...)
	if err != nil {
		log.Fatalf("初始化客户端错误: %v", err)
	}

	// 测试运行时操作 - 获取统计信息
	runtimeCli, err := client.Runtime()
	if err != nil {
		log.Fatalf("获取运行时客户端错误: %v", err)
	}

	ProcessInfo, err := runtimeCli.GetInfo()
	if err != nil {
		log.Printf("获取HAProxy信息失败: %v", err)
	} else {
		fmt.Println("\nHAProxy 信息:")
		if ProcessInfo.Info != nil {
			if ProcessInfo.Info.Version != "" {
				fmt.Printf("版本: %s\n", ProcessInfo.Info.Version)
			}
			if ProcessInfo.Info.Uptime != nil {
				fmt.Printf("运行时间: %d秒\n", *ProcessInfo.Info.Uptime)
			}
			if ProcessInfo.Info.Pid != nil {
				fmt.Printf("PID: %d\n", *ProcessInfo.Info.Pid)
			}
		} else if ProcessInfo.Error != "" {
			fmt.Printf("错误: %s\n", ProcessInfo.Error)
		}
	}

	// 使用客户端进行一些配置调整的示例 - 添加一个新的后端
	fmt.Println("\n使用API添加新的后端...")
	addNewBackend(client)

	// 让程序保持运行，等待用户输入来终止
	fmt.Println("\nHAProxy 正在运行中，监听 *:9000，请在浏览器访问 http://localhost:9000")
	fmt.Println("按回车键终止程序并关闭HAProxy...")
	fmt.Scanln()
}

func setupHAProxyConfig(confClient configuration.Configuration, haproxyOpts *haproxyOptions) {
	version, err := confClient.GetVersion("")
	if err != nil {
		log.Fatalf("setupHAProxyConfig 获取版本错误: %v", err)
	}
	transaction, err := confClient.StartTransaction(version)
	if err != nil {
		log.Fatalf("setupHAProxyConfig 启动事务错误: %v", err)
	}

	// 创建证书存储
	crtStore := &models.CrtStore{
		Name:    "sites",
		CrtBase: "/home/ubuntu/pro/golang/go-waf/simple-waf/engine/dev/haproxy/cert", // 证书目录
		KeyBase: "/home/ubuntu/pro/golang/go-waf/simple-waf/engine/dev/haproxy/cert", // 私钥目录
	}
	err = confClient.CreateCrtStore(crtStore, transaction.ID, 0)
	if err != nil {
		log.Printf("创建证书存储错误: %v", err)
		confClient.DeleteTransaction(transaction.ID)
	}

	// 加载第一个证书
	crtLoad1 := &models.CrtLoad{
		Certificate: "a.com.crt",
		Key:         "a.com.key",
		Alias:       "a_com_cert",
	}
	err = confClient.CreateCrtLoad("sites", crtLoad1, transaction.ID, 0)
	if err != nil {
		log.Printf("加载证书 a.com.crt 错误: %v", err)
		confClient.DeleteTransaction(transaction.ID)
	}

	// 加载第二个证书
	crtLoad2 := &models.CrtLoad{
		Certificate: "b.com.crt",
		Key:         "b.com.key",
		Alias:       "b_com_cert",
	}
	err = confClient.CreateCrtLoad("sites", crtLoad2, transaction.ID, 0)
	if err != nil {
		log.Printf("加载证书 b.com.crt 错误: %v", err)
		confClient.DeleteTransaction(transaction.ID)
	}

	// 创建 fe_9000_combined
	fe_9000_combined := &models.Frontend{
		FrontendBase: models.FrontendBase{
			Name:           "fe_9000_combined",
			Mode:           "tcp",
			DefaultBackend: "be_9000_https", // 设置默认后端
			Enabled:        true,
		},
	}

	err = confClient.CreateFrontend(fe_9000_combined, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 创建前端错误: %v", err)
		return // 添加return，避免继续执行
	} else {
		fmt.Println("已成功创建前端")
	}

	// 添加绑定到前端
	bind_9000 := &models.Bind{
		BindParams: models.BindParams{
			Name: "public_9000",
		},
		Address: "*",
		Port:    Int64P(9000), // 使用9000端口
	}
	err = confClient.CreateBind("frontend", "fe_9000_combined", bind_9000, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加绑定错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加绑定")
	}

	// 添加 tcp-request inspect-delay 规则
	tcpInspectDelay := &models.TCPRequestRule{
		Type:    "inspect-delay",
		Timeout: Int64P(2),
	}
	err = confClient.CreateTCPRequestRule(0, "frontend", "fe_9000_combined", tcpInspectDelay, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加TCP请求规则错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加TCP inspect-delay规则")
	}

	// 添加 tcp-request content accept if HTTP
	tcpAcceptHTTP := &models.TCPRequestRule{
		Action:   "accept",
		Type:     "content",
		Cond:     "if",
		CondTest: "HTTP",
	}
	err = confClient.CreateTCPRequestRule(1, "frontend", "fe_9000_combined", tcpAcceptHTTP, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加TCP请求规则错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加TCP accept HTTP规则")
	}

	// 添加 tcp-request content accept if { req.ssl_hello_type 1 }
	tcpAcceptSSL := &models.TCPRequestRule{
		Action:   "accept",
		Type:     "content",
		Cond:     "if",
		CondTest: "{ req.ssl_hello_type 1 }",
	}
	err = confClient.CreateTCPRequestRule(2, "frontend", "fe_9000_combined", tcpAcceptSSL, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加TCP请求规则错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加TCP accept SSL规则")
	}

	// 添加 use_backend 规则
	useBackendRule := &models.BackendSwitchingRule{
		Name:     "be_9000_http",
		Cond:     "if",
		CondTest: "HTTP",
	}
	err = confClient.CreateBackendSwitchingRule(0, "fe_9000_combined", useBackendRule, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加后端切换规则错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加后端切换规则")
	}

	// 创建 be_9000_http 后端
	be_9000_http := &models.Backend{
		BackendBase: models.BackendBase{
			Name:    "be_9000_http",
			Mode:    "tcp",
			Enabled: true,
		},
	}

	err = confClient.CreateBackend(be_9000_http, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 创建HTTP后端错误: %v", err)
		return
	} else {
		fmt.Println("已成功创建HTTP后端")
	}

	// 为 be_9000_http 添加服务器
	serverHTTP := &models.Server{
		ServerParams: models.ServerParams{
			SendProxyV2: "enabled", // 启用代理协议v2
		},
		Name:    "loopback-for-http",
		Address: "abns@haproxy-9000-http",
	}

	err = confClient.CreateServer("backend", "be_9000_http", serverHTTP, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加HTTP服务器错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加HTTP服务器")
	}

	// 创建 be_9000_https 后端
	be_9000_https := &models.Backend{
		BackendBase: models.BackendBase{
			Name:    "be_9000_https",
			Mode:    "tcp",
			Enabled: true,
		},
	}

	err = confClient.CreateBackend(be_9000_https, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 创建HTTPS后端错误: %v", err)
		return
	} else {
		fmt.Println("已成功创建HTTPS后端")
	}

	// 为 be_9000_https 添加服务器
	serverHTTPS := &models.Server{
		ServerParams: models.ServerParams{
			SendProxyV2: "enabled", // 启用代理协议v2
		},
		Name:    "loopback-for-https",
		Address: "abns@haproxy-9000-https",
	}

	err = confClient.CreateServer("backend", "be_9000_https", serverHTTPS, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加HTTPS服务器错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加HTTPS服务器")
	}

	// -----------
	// 创建 fe_9000_http 前端，并设置日志格式
	fe_9000_http := &models.Frontend{
		FrontendBase: models.FrontendBase{
			Name:           "fe_9000_http",
			Mode:           "http",
			DefaultBackend: "p9000_backend",
			Enabled:        true,
			// 日志格式使用反斜杠转义空格和特殊字符
			LogFormat: "\"%ci:%cp\\ [%t]\\ %ft\\ %b/%s\\ %Th/%Ti/%TR/%Tq/%Tw/%Tc/%Tr/%Tt\\ %ST\\ %B\\ %CC\\ %CS\\ %tsc\\ %ac/%fc/%bc/%sc/%rc\\ %sq/%bq\\ %hr\\ %hs\\ %{+Q}r\\ %[var(txn.coraza.id)]\\ spoa-error:\\ %[var(txn.coraza.error)]\\ waf-hit:\\ %[var(txn.coraza.fail)]\"",
		},
	}

	err = confClient.CreateFrontend(fe_9000_http, transaction.ID, 0)
	if err != nil {
		log.Printf("创建HTTP前端错误: %v", err)
		return // 添加return，避免继续执行
	} else {
		fmt.Println("已成功创建HTTP前端，并设置了日志格式")
	}

	// 添加到 fe_9000_http 的绑定
	bind_http := &models.Bind{
		BindParams: models.BindParams{
			Name:        "internal_http",
			AcceptProxy: true,
		},
		Address: "abns@haproxy-9000-http",
	}
	err = confClient.CreateBind("frontend", "fe_9000_http", bind_http, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加HTTP绑定错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加HTTP绑定")
	}

	// 创建 ACL - 确保ACL结构正确
	acl_a_com := &models.ACL{
		ACLName:   "host_a_com",   // 使用ACLName字段
		Criterion: "hdr(host) -i", // 使用Criterion字段
		Value:     "a.com",        // 使用Value字段
	}

	err = confClient.CreateACL(0, "frontend", "fe_9000_http", acl_a_com, transaction.ID, 0)
	if err != nil {
		log.Printf("添加ACL错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加host_a_com ACL")
	}

	acl_b_com := &models.ACL{
		ACLName:   "host_b_com",
		Criterion: "hdr(host) -i",
		Value:     "b.com",
	}

	err = confClient.CreateACL(1, "frontend", "fe_9000_http", acl_b_com, transaction.ID, 0)
	if err != nil {
		log.Printf("添加ACL错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加host_b_com ACL")
	}

	// 添加 SPOE 过滤器 - 简化路径并确保Filter结构正确
	spoeFilter := &models.Filter{
		Type:       "spoe",                                    // 过滤器类型
		SpoeEngine: "coraza",                                  // SPOE引擎名称
		SpoeConfig: haproxyOpts.SpoeDir + "/coraza-spoa.yaml", // 使用配置文件的标准路径
	}
	err = confClient.CreateFilter(0, "frontend", "fe_9000_http", spoeFilter, transaction.ID, 0)
	if err != nil {
		log.Printf("添加SPOE过滤器错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加SPOE过滤器")
	}

	// 添加HTTP请求规则 - 确保HTTP请求规则结构正确
	httpReqRules := []struct {
		index int64
		rule  *models.HTTPRequestRule
	}{
		{0, &models.HTTPRequestRule{
			Type:       "redirect",
			RedirCode:  Int64P(302),
			RedirType:  "location", // 指定重定向类型
			RedirValue: "%[var(txn.coraza.data)]",
			Cond:       "if",
			CondTest:   "{ var(txn.coraza.action) -m str redirect }",
		}},
		{1, &models.HTTPRequestRule{
			Type:       "deny",
			DenyStatus: Int64P(403),
			HdrName:    "waf-block", // 设置头部名称
			HdrFormat:  "request",   // 设置头部值
			Cond:       "if",
			CondTest:   "{ var(txn.coraza.action) -m str deny }",
		}},
		{2, &models.HTTPRequestRule{
			Type:     "silent-drop",
			Cond:     "if",
			CondTest: "{ var(txn.coraza.action) -m str drop }",
		}},
		{3, &models.HTTPRequestRule{
			Type:       "deny",
			DenyStatus: Int64P(500),
			Cond:       "if",
			CondTest:   "{ var(txn.coraza.error) -m int gt 0 }",
		}},
	}

	for i, item := range httpReqRules {
		err = confClient.CreateHTTPRequestRule(item.index, "frontend", "fe_9000_http", item.rule, transaction.ID, 0)
		if err != nil {
			log.Printf("setupHAProxyConfig 添加HTTP请求规则 #%d 错误: %v", i, err)
			return
		} else {
			fmt.Printf("已成功添加HTTP请求规则 #%d\n", i)
		}
	}

	// 添加HTTP响应规则 - 确保HTTP响应规则结构正确
	httpRespRules := []struct {
		index int64
		rule  *models.HTTPResponseRule
	}{
		{0, &models.HTTPResponseRule{
			Type:       "redirect",
			RedirCode:  Int64P(302),
			RedirType:  "location", // 指定重定向类型
			RedirValue: "%[var(txn.coraza.data)]",
			Cond:       "if",
			CondTest:   "{ var(txn.coraza.action) -m str redirect }",
		}},
		{1, &models.HTTPResponseRule{
			Type:       "deny",
			DenyStatus: Int64P(403),
			HdrName:    "waf-block", // 设置头部名称
			HdrFormat:  "response",  // 设置头部值
			Cond:       "if",
			CondTest:   "{ var(txn.coraza.action) -m str deny }",
		}},
		{2, &models.HTTPResponseRule{
			Type:     "silent-drop",
			Cond:     "if",
			CondTest: "{ var(txn.coraza.action) -m str drop }",
		}},
		{3, &models.HTTPResponseRule{
			Type:       "deny",
			DenyStatus: Int64P(500),
			Cond:       "if",
			CondTest:   "{ var(txn.coraza.error) -m int gt 0 }",
		}},
	}

	for i, item := range httpRespRules {
		err = confClient.CreateHTTPResponseRule(item.index, "frontend", "fe_9000_http", item.rule, transaction.ID, 0)
		if err != nil {
			log.Printf("添加HTTP响应规则 #%d 错误: %v", i, err)
			return
		} else {
			fmt.Printf("已成功添加HTTP响应规则 #%d\n", i)
		}
	}

	// 添加后端切换规则
	backendRules := []struct {
		index int64
		rule  *models.BackendSwitchingRule
	}{
		{0, &models.BackendSwitchingRule{
			Name:     "be_a_com",
			Cond:     "if",
			CondTest: "host_a_com",
		}},
		{1, &models.BackendSwitchingRule{
			Name:     "be_b_com",
			Cond:     "if",
			CondTest: "host_b_com",
		}},
	}

	for i, item := range backendRules {
		err = confClient.CreateBackendSwitchingRule(item.index, "fe_9000_http", item.rule, transaction.ID, 0)
		if err != nil {
			log.Printf("setupHAProxyConfig 添加后端切换规则 #%d 错误: %v", i, err)
			return
		} else {
			fmt.Printf("已成功添加后端切换规则 #%d\n", i)
		}
	}

	// 创建所有需要的后端
	backends := []struct {
		name    string
		mode    string
		comment string
	}{
		{"p9000_backend", "http", "默认HTTP后端"},
		{"be_a_com", "http", "a.com域名后端"},
		{"be_b_com", "http", "b.com域名后端"},
		{"coraza-spoa", "tcp", "SPOE代理后端"},
	}

	for _, be := range backends {
		backend := &models.Backend{
			BackendBase: models.BackendBase{
				Name:    be.name,
				Mode:    be.mode,
				Enabled: true,
			},
		}

		err = confClient.CreateBackend(backend, transaction.ID, 0)
		if err != nil {
			log.Printf("创建后端 %s (%s) 错误: %v", be.name, be.comment, err)
			return
		} else {
			fmt.Printf("已成功创建后端 %s (%s)\n", be.name, be.comment)
		}
	}

	// 为 coraza-spoa 后端添加服务器
	spoaServer := &models.Server{
		Name:    "coraza-agent",
		Address: "127.0.0.1",  // 使用实际运行 SPOE 代理的地址
		Port:    Int64P(2342), // 使用实际的 SPOE 代理端口
	}

	err = confClient.CreateServer("backend", "coraza-spoa", spoaServer, transaction.ID, 0)
	if err != nil {
		log.Printf("添加 SPOE 服务器错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加 SPOE 服务器")
	}

	p9000_server := &models.Server{
		Name:    "p9000_server",
		Address: "httpbin.org",
		Port:    Int64P(443),
		ServerParams: models.ServerParams{
			Ssl:    "enabled",
			Verify: "none",
		},
	}

	err = confClient.CreateServer("backend", "p9000_backend", p9000_server, transaction.ID, 0)
	if err != nil {
		log.Printf("添加 p9000_server 服务器错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加 p9000_server 服务器")
	}

	p9000_server1 := &models.Server{
		Name:    "p9000_server1",
		Address: "httpbin.org",
		Port:    Int64P(443),
		ServerParams: models.ServerParams{
			Ssl:    "enabled",
			Verify: "none",
		},
	}

	err = confClient.CreateServer("backend", "p9000_backend", p9000_server1, transaction.ID, 0)
	if err != nil {
		log.Printf("添加 p9000_server 服务器错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加 p9000_server 服务器")
	}

	// 创建 fe_9000_https 前端，并设置日志格式
	fe_9000_https := &models.Frontend{
		FrontendBase: models.FrontendBase{
			Name:           "fe_9000_https",
			Mode:           "http",
			DefaultBackend: "p9000_backend",
			Enabled:        true,
			// 日志格式使用反斜杠转义空格和特殊字符
			LogFormat: "\"%ci:%cp\\ [%t]\\ %ft\\ %b/%s\\ %Th/%Ti/%TR/%Tq/%Tw/%Tc/%Tr/%Tt\\ %ST\\ %B\\ %CC\\ %CS\\ %tsc\\ %ac/%fc/%bc/%sc/%rc\\ %sq/%bq\\ %hr\\ %hs\\ %{+Q}r\\ %[var(txn.coraza.id)]\\ spoa-error:\\ %[var(txn.coraza.error)]\\ waf-hit:\\ %[var(txn.coraza.fail)]\"",
		},
	}

	err = confClient.CreateFrontend(fe_9000_https, transaction.ID, 0)
	if err != nil {
		log.Printf("创建HTTP前端错误: %v", err)
		return // 添加return，避免继续执行
	} else {
		fmt.Println("已成功创建HTTP前端，并设置了日志格式")
	}

	// 添加到 fe_9000_http 的绑定
	bind_https := &models.Bind{
		BindParams: models.BindParams{
			Name:        "internal_https",
			AcceptProxy: true,
			Ssl:         true,
			DefaultCrtList: []string{
				"@sites/a_com_cert",
				"@sites/b_com_cert",
			},
		},
		Address: "abns@haproxy-9000-https",
		Port:    Int64P(2222),
	}
	err = confClient.CreateBind("frontend", "fe_9000_https", bind_https, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加HTTPS绑定错误: %v", err)
		return
	} else {
		fmt.Println("已成功添加HTTPS绑定")
	}

	// BUG
	_, http_binds, err := confClient.GetBinds("frontend", "fe_9000_https", transaction.ID)
	if err != nil {
		log.Printf("setupHAProxyConfig 获取绑定失败: %v", err)
		return
	}
	fmt.Printf("http_binds: %+v\n", http_binds)

	bind_https1 := &models.Bind{
		BindParams: models.BindParams{
			Name:        "internal",
			AcceptProxy: true,
			Ssl:         true,
			DefaultCrtList: []string{
				"@sites/a_com_cert",
			},
		},
		Address: "abns@haproxy-9000-https",
	}
	err = confClient.EditBind("internal_https", "frontend", "fe_9000_https", bind_https1, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 编辑绑定失败: %v", err)
		return
	}

	// 提交事务
	transaction, err = confClient.CommitTransaction(transaction.ID)
	if err != nil {
		log.Fatalf("setupHAProxyConfig 提交事务错误: %v", err)
	} else {
		fmt.Println("setupHAProxyConfig 提交事务:", transaction)
		fmt.Println("setupHAProxyConfig 已成功提交配置")
	}
}

func setupSPOE(spoeClient spoe.Spoe) error {
	// 获取 coraza SPOE 配置
	corazaSpoe, err := spoeClient.GetSingleSpoe("coraza-spoa.yaml")
	if err != nil {
		return fmt.Errorf("获取 SPOE 配置错误: %v", err)
	}

	fmt.Printf("SPOE 配置: %+v\n", corazaSpoe)

	// 获取版本并启动事务
	version, err := corazaSpoe.Transaction.TransactionClient.GetVersion("")
	fmt.Printf("版本: %+v\n", version)
	if err != nil {
		return fmt.Errorf("获取 SPOE 版本错误: %v", err)
	}

	transaction, err := corazaSpoe.Transaction.StartTransaction(version)
	fmt.Printf("事务: %+v\n", transaction)
	if err != nil {
		return fmt.Errorf("启动 SPOE 事务错误: %v", err)
	}

	// 创建 SPOE 作用域 - 这里应该使用 [coraza] 作为 section 名称
	scopeName := models.SpoeScope("[coraza]")
	fmt.Printf("scopeName: %+v\n", scopeName)
	scopeNameStr := string(scopeName)
	fmt.Printf("scopeNameStr: %+v\n", scopeNameStr)
	err = corazaSpoe.CreateScope(&scopeName, transaction.ID, 0)
	if err != nil {
		corazaSpoe.Transaction.DeleteTransaction(transaction.ID)
		return fmt.Errorf("创建 SPOE 作用域错误: %v", err)
	}
	fmt.Println("已成功创建 SPOE 作用域 coraza")

	// 创建 coraza-agent - 注意这里应该在 coraza section 下创建
	agentName := "coraza-agent"
	agent := &models.SpoeAgent{
		Name: &agentName,
		// Messages: "coraza-req", // 只处理请求，如需处理响应，改为 "coraza-req coraza-res"
		Messages:          "coraza-req coraza-res",
		OptionVarPrefix:   "coraza",
		OptionSetOnError:  "error",
		HelloTimeout:      2000,   // 2s (毫秒)
		IdleTimeout:       120000, // 2m (毫秒)
		ProcessingTimeout: 500,    // 500ms
		UseBackend:        "coraza-spoa",
		Log:               models.LogTargets{&models.LogTarget{Global: true}},
	}

	// 在 coraza section 下创建 agent
	err = corazaSpoe.CreateAgent(scopeNameStr, agent, transaction.ID, 0)
	if err != nil {
		corazaSpoe.Transaction.DeleteTransaction(transaction.ID)
		return fmt.Errorf("创建 SPOE 代理错误: %v", err)
	}
	fmt.Println("已成功创建 SPOE 代理 coraza-agent")

	// 创建 coraza-req 消息
	reqMsgName := "coraza-req"
	eventName := "on-frontend-http-request"
	reqEvent := &models.SpoeMessageEvent{
		Name: &eventName,
	}
	reqMsg := &models.SpoeMessage{
		Name:  &reqMsgName,
		Event: reqEvent,
		Args:  "app=str(sample_app) src-ip=src src-port=src_port dst-ip=dst dst-port=dst_port method=method path=path query=query version=req.ver headers=req.hdrs body=req.body",
	}

	// 在 coraza section 下创建 message
	err = corazaSpoe.CreateMessage(scopeNameStr, reqMsg, transaction.ID, 0)
	if err != nil {
		corazaSpoe.Transaction.DeleteTransaction(transaction.ID)
		return fmt.Errorf("创建 SPOE 请求消息错误: %v", err)
	}
	fmt.Println("已成功创建 SPOE 请求消息 coraza-req")

	// 如果需要处理响应，取消下面的注释
	// 创建 coraza-res 消息
	resMsgName := "coraza-res"
	resEventName := "on-http-response"
	resEvent := &models.SpoeMessageEvent{
		Name: &resEventName,
	}
	resMsg := &models.SpoeMessage{
		Name:  &resMsgName,
		Event: resEvent,
		Args:  "app=str(sample_app) id=var(txn.coraza.id) version=res.ver status=status headers=res.hdrs body=res.body",
	}

	err = corazaSpoe.CreateMessage(scopeNameStr, resMsg, transaction.ID, 0)
	if err != nil {
		corazaSpoe.Transaction.DeleteTransaction(transaction.ID)
		return fmt.Errorf("创建 SPOE 响应消息错误: %v", err)
	}
	fmt.Println("已成功创建 SPOE 响应消息 coraza-res")

	// 提交事务
	_, err = corazaSpoe.Transaction.CommitTransaction(transaction.ID)
	if err != nil {
		return fmt.Errorf("提交 SPOE 事务错误: %v", err)
	}
	fmt.Println("已成功提交 SPOE 配置")

	return nil
}

// 使用Go启动HAProxy进程
func startHAProxy(opts *haproxyOptions) (*exec.Cmd, error) {
	fmt.Println("正在启动HAProxy...")

	cmd := exec.Command(
		opts.HAProxyBin,
		"-f", opts.ConfigFile,
		"-p", opts.PidFile,
		"-Ws",                                                                              // 启用master-worker模式
		"-S", fmt.Sprintf("unix@%s", filepath.Join(opts.SocketDir, "haproxy-master.sock")), // 使用unix@格式
		"-d", // 调试模式
	)
	// 将标准输出和错误输出设置为我们可以查看的内容
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	// 启动HAProxy
	if err := cmd.Start(); err != nil {
		return nil, fmt.Errorf("启动HAProxy失败: %v", err)
	}

	fmt.Printf("HAProxy已启动，PID: %d\n", cmd.Process.Pid)
	return cmd, nil
}

// 停止HAProxy进程
func stopHAProxy(cmd *exec.Cmd, opts *haproxyOptions) {
	if cmd != nil && cmd.Process != nil {
		fmt.Println("正在停止HAProxy...")

		// 尝试优雅地终止进程
		if err := cmd.Process.Signal(os.Interrupt); err != nil {
			log.Printf("发送中断信号失败: %v", err)
			// 强制终止
			if err := cmd.Process.Kill(); err != nil {
				log.Printf("强制终止进程失败: %v", err)
			}
		}

		// 等待进程完全退出
		cmd.Wait()
		fmt.Println("HAProxy已停止")
	}
}

// 等待套接字文件创建完成
func waitForSocket(socketPath string) {
	maxAttempts := 10
	for i := 0; i < maxAttempts; i++ {
		if _, err := os.Stat(socketPath); err == nil {
			fmt.Printf("套接字文件已创建: %s\n", socketPath)
			// 再等一小段时间确保HAProxy完全就绪
			time.Sleep(500 * time.Millisecond)
			return
		}
		fmt.Printf("等待套接字文件创建 (%d/%d)...\n", i+1, maxAttempts)
		time.Sleep(500 * time.Millisecond)
	}
	log.Printf("警告: 套接字文件可能未创建: %s", socketPath)
}

// 添加新的后端作为API调用示例
func addNewBackend(client client_native.HAProxyClient) {
	configClient, err := client.Configuration()
	if err != nil {
		log.Printf("addNewBackend 获取配置客户端错误: %v", err)
		return
	}
	version, err := configClient.GetVersion("")
	if err != nil {
		log.Printf("addNewBackend 获取版本错误: %v", err)
		return
	}
	fmt.Println("addNewBackend 版本:", version)
	// 启动事务
	transaction, err := configClient.StartTransaction(version)
	if err != nil {
		log.Printf("addNewBackend 启动事务错误: %v", err)
		return
	}

	// 创建一个新的后端
	newBackend := &models.Backend{
		BackendBase: models.BackendBase{
			Name:    "api_added_backend",
			Mode:    "http",
			Enabled: true,
		},
	}

	err = configClient.CreateBackend(newBackend, transaction.ID, 0)
	if err != nil {
		log.Printf("addNewBackend 创建新后端错误: %v", err)
		// 中止事务
		configClient.DeleteTransaction(transaction.ID)
		return
	}

	// 向新后端添加服务器
	newServer := &models.Server{
		Name:    "example",
		Address: "httpbin.org",
		Port:    Int64P(80),
		ServerParams: models.ServerParams{
			Weight: Int64P(100),
			Check:  "enabled",
		},
	}

	err = configClient.CreateServer("backend", "api_added_backend", newServer, transaction.ID, 0)
	if err != nil {
		log.Printf("addNewBackend 添加服务器错误: %v", err)
		// 中止事务
		configClient.DeleteTransaction(transaction.ID)
		return
	}

	// 提交事务
	_, err = configClient.CommitTransaction(transaction.ID)
	if err != nil {
		log.Printf("addNewBackend 提交事务错误: %v", err)
		return
	}

	// 重新加载HAProxy使配置生效
	runtimeClient, err := client.Runtime()
	if err != nil {
		log.Printf("addNewBackend 获取运行时客户端错误: %v", err)
		return
	}

	output, err := runtimeClient.Reload()
	if err != nil {
		log.Printf("addNewBackend 重新加载HAProxy错误: %v", err)
		return
	}

	fmt.Printf("addNewBackend HAProxy已成功重新加载，添加了新后端 'api_added_backend'\n输出: %s\n", output)
}

// 创建所需的目录
func createDirsIfNotExist(opts *haproxyOptions) {
	// 先删除 ConfigBaseDir 目录
	if err := os.RemoveAll(opts.ConfigBaseDir); err != nil {
		log.Printf("警告：无法删除目录 %s: %v", opts.ConfigBaseDir, err)
		// 继续执行，不要因为删除失败而中断程序
	} else {
		log.Printf("已成功删除目录: %s", opts.ConfigBaseDir)
	}

	// 确保所有目录都存在
	dirs := []string{
		filepath.Dir(opts.ConfigFile),
		opts.TransactionDir,
		opts.SocketDir,
		filepath.Dir(opts.PidFile),
		opts.SpoeDir,
		opts.SpoeTransactionDir,
	}
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Fatalf("无法创建目录 %s: %v", dir, err)
		}
	}
	// 如果配置文件不存在，创建一个基本配置
	if _, err := os.Stat(opts.ConfigFile); os.IsNotExist(err) {
		basicConfig := fmt.Sprintf(`# _version = 1
global
    log stdout format raw local0
    # stats socket %s mode 600 level admin
    maxconn 4000
    # 在非root用户下运行时可能需要删除以下两行
    # user %s
    # group %s
defaults
    log global
    mode http
    option httplog
    timeout client 1m
    timeout server 1m
    timeout connect 10s
# 以下部分将由程序动态配置
`, filepath.Join(opts.SocketDir, "haproxy-master.sock"), os.Getenv("USER"), os.Getenv("USER"))
		err = os.WriteFile(opts.ConfigFile, []byte(basicConfig), 0644)
		if err != nil {
			log.Fatalf("无法创建基本配置文件: %v", err)
		}
		fmt.Printf("已创建基本配置文件: %s\n", opts.ConfigFile)
	}
}

// Int64P 返回一个指向提供的 int64 值的指针
func Int64P(v int64) *int64 {
	return &v
}
