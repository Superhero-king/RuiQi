package main

import (
	"context"
	"fmt"
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
)

type haproxyOptions struct {
	ConfigFile     string
	HAProxyBin     string
	BackupsNumber  int
	TransactionDir string
	SocketDir      string
	PidFile        string
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
		ConfigFile:     filepath.Join(homeDir, "haproxy/haproxy.cfg"),
		HAProxyBin:     "/home/ubuntu/tools/haproxy/haproxy-linux_x86_64", // 根据实际路径调整
		BackupsNumber:  1,
		TransactionDir: filepath.Join(homeDir, "haproxy/transactions"),
		SocketDir:      filepath.Join(homeDir, "haproxy/sock"),
		PidFile:        filepath.Join(homeDir, "haproxy/haproxy.pid"),
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

	// 配置HAProxy
	setupHAProxyConfig(confClient)

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
	fmt.Println("\nHAProxy 正在运行中，监听 *:8000，请在浏览器访问 http://localhost:8000")
	fmt.Println("按回车键终止程序并关闭HAProxy...")
	fmt.Scanln()
}

// 使用配置客户端设置初始HAProxy配置
func setupHAProxyConfig(confClient configuration.Configuration) {
	version, err := confClient.GetVersion("")
	if err != nil {
		log.Fatalf("setupHAProxyConfig 获取版本错误: %v", err)
	}
	fmt.Println("configuration 版本:", version)
	transaction, err := confClient.StartTransaction(version)
	if err != nil {
		log.Fatalf("setupHAProxyConfig 启动事务错误: %v", err)
	}
	fmt.Println("setupHAProxyConfig 已启动事务")
	fmt.Println("setupHAProxyConfig 事务ID:", transaction.ID)
	fmt.Println("setupHAProxyConfig 事务版本:", transaction.Version)
	fmt.Println("setupHAProxyConfig 事务状态:", transaction.Status)

	// 创建一个后端
	backend := &models.Backend{
		BackendBase: models.BackendBase{
			Name:    "httpbin_backend",
			Mode:    "http",
			Enabled: true,
		},
	}

	err = confClient.CreateBackend(backend, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 创建后端错误: %v", err)
	} else {
		fmt.Println("已成功创建后端")
	}

	// 添加服务器到后端
	server := &models.Server{
		Name:    "server1",
		Address: "httpbin.org",
		Port:    Int64P(80),
		ServerParams: models.ServerParams{
			Weight: Int64P(100),
			Check:  "enabled",
		},
	}

	err = confClient.CreateServer("backend", "httpbin_backend", server, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加服务器错误: %v", err)
	} else {
		fmt.Println("已成功添加服务器")
	}

	// 创建一个前端
	frontend := &models.Frontend{
		FrontendBase: models.FrontendBase{
			Name:           "default",
			Mode:           "http",
			DefaultBackend: "httpbin_backend",
			Enabled:        true,
		},
	}

	err = confClient.CreateFrontend(frontend, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 创建前端错误: %v", err)
	} else {
		fmt.Println("已成功创建前端")
	}

	// 添加绑定到前端
	bind := &models.Bind{
		BindParams: models.BindParams{
			Name: "public",
		},
		Address: "*",
		Port:    Int64P(8000),
	}

	err = confClient.CreateBind("frontend", "default", bind, transaction.ID, 0)
	if err != nil {
		log.Printf("setupHAProxyConfig 添加绑定错误: %v", err)
	} else {
		fmt.Println("已成功添加绑定")
	}

	// 提交事务
	transaction, err = confClient.CommitTransaction(transaction.ID)
	fmt.Println("setupHAProxyConfig 提交事务:", transaction)
	if err != nil {
		log.Fatalf("setupHAProxyConfig 提交事务错误: %v", err)
	}
	fmt.Println("setupHAProxyConfig 已成功提交初始配置")
}

// 使用Go启动HAProxy进程
func startHAProxy(opts *haproxyOptions) (*exec.Cmd, error) {
	fmt.Println("正在启动HAProxy...")

	// 构建HAProxy命令行
	// cmd := exec.Command(
	// 	opts.HAProxyBin,
	// 	"-f", opts.ConfigFile,
	// 	"-p", opts.PidFile,
	// 	"-W", // 启用master-worker模式
	// 	"-d", // 调试模式
	// )

	cmd := exec.Command(
		opts.HAProxyBin,
		"-f", opts.ConfigFile,
		"-p", opts.PidFile,
		"-W",                                                                               // 启用master-worker模式
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
		Address: "example.com",
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
	// 确保所有目录都存在
	dirs := []string{
		filepath.Dir(opts.ConfigFile),
		opts.TransactionDir,
		opts.SocketDir,
		filepath.Dir(opts.PidFile),
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
