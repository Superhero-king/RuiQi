// server/agent_server.go
package server

import (
	"context"
	"errors"
	"net"
	"os"
	"sync"

	"github.com/rs/zerolog"

	cfg "github.com/HUAHUAI23/simple-waf/coraza-spoa/config"
	"github.com/HUAHUAI23/simple-waf/coraza-spoa/internal"
	mongodb "github.com/HUAHUAI23/simple-waf/pkg/database/mongo"
	"github.com/HUAHUAI23/simple-waf/pkg/model"
	"github.com/HUAHUAI23/simple-waf/pkg/utils/network"
)

var globalLogger = zerolog.New(os.Stderr).With().Timestamp().Logger()

// ServerState 表示服务器的运行状态
type ServerState int

const (
	ServerStopped ServerState = iota // 服务已停止
	ServerRunning                    // 服务正在运行
	ServerError                      // 服务出错
)

// AgentServer 管理Agent服务的生命周期
type AgentServer struct {
	mu           sync.Mutex
	ctx          context.Context
	cancelFunc   context.CancelFunc
	agent        *internal.Agent
	listener     net.Listener
	network      string
	address      string
	applications map[string]*internal.Application
	logger       zerolog.Logger
	state        ServerState
	lastError    error
	mongoURI     string
}

func NewAgentServer(logger zerolog.Logger, mongoURI string, bind string, config model.Config) *AgentServer {
	mongoClient, err := mongodb.Connect(mongoURI)
	if err != nil {
		globalLogger.Fatal().Err(err).Msg("Failed creating MongoDB client")
	}

	// 创建上下文
	ctx, cancelFunc := context.WithCancel(context.Background())
	var wafLog model.WAFLog
	mongoConfig := &internal.MongoConfig{
		Client:     mongoClient,
		Database:   "waf",
		Collection: wafLog.GetCollectionName(),
	}

	// 从 Config 中提取 AppConfig 列表
	appConfigs := config.Engine.AppConfig

	// Convert model.AppConfig to internal.AppConfig and create applications
	allApps := make(map[string]*internal.Application)
	for _, modelAppConfig := range appConfigs {
		// 创建日志配置
		logConfig := cfg.LogConfig{
			Level:  modelAppConfig.LogLevel,
			File:   modelAppConfig.LogFile,
			Format: modelAppConfig.LogFormat,
		}

		// 创建日志记录器
		appLogger, err := logConfig.NewLogger()
		if err != nil {
			globalLogger.Warn().Err(err).Str("app", modelAppConfig.Name).Msg("使用默认日志记录器")
			appLogger = globalLogger
		}

		// 创建内部 AppConfig
		internalAppConfig := internal.AppConfig{
			Directives:     modelAppConfig.Directives,
			ResponseCheck:  config.IsResponseCheck, // 使用全局响应检查设置
			Logger:         appLogger,
			TransactionTTL: modelAppConfig.TransactionTTL,
		}

		// 创建应用
		application, err := internalAppConfig.NewApplicationWithContext(ctx, mongoConfig)
		if err != nil {
			globalLogger.Fatal().Err(err).Msg("Failed creating application: " + modelAppConfig.Name)
		}

		allApps[modelAppConfig.Name] = application
	}
	network, address := network.NetworkAddressFromBind(bind)

	return &AgentServer{
		network:      network,
		address:      address,
		applications: allApps,
		logger:       logger,
		state:        ServerStopped,
		ctx:          ctx,
		cancelFunc:   cancelFunc,
		mongoURI:     mongoURI,
	}
}

// Start 启动服务
func (s *AgentServer) Start() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.state == ServerRunning {
		return errors.New("服务已经在运行中")
	}

	// 创建监听器
	l, err := (&net.ListenConfig{}).Listen(s.ctx, s.network, s.address)
	if err != nil {
		s.logger.Error().Err(err).Msg("创建套接字失败")
		s.state = ServerError
		s.lastError = err
		return err
	}
	s.listener = l

	// 创建Agent实例
	s.agent = &internal.Agent{
		Context:      s.ctx,
		Applications: s.applications,
		Logger:       s.logger,
	}

	// 在后台goroutine中启动服务
	go func() {
		s.logger.Info().Msg("启动 coraza-spoa 服务, 监听地址: " + s.address + " " + s.network)
		if err := s.agent.Serve(l); err != nil {
			s.mu.Lock()
			s.state = ServerError
			s.lastError = err
			s.mu.Unlock()
			s.logger.Error().Err(err).Msg("监听器已关闭")
		}
	}()

	s.state = ServerRunning
	return nil
}

// Stop 停止服务
func (s *AgentServer) Stop() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.state == ServerStopped {
		return errors.New("服务未运行")
	}

	// 取消上下文
	if s.cancelFunc != nil {
		s.cancelFunc()
	}

	// 关闭监听器
	if s.listener != nil {
		if err := s.listener.Close(); err != nil {
			s.logger.Error().Err(err).Msg("关闭监听器失败")
			return err
		}
	}

	s.state = ServerStopped
	s.logger.Info().Msg("服务已停止")
	return nil
}

// Restart 重启服务
func (s *AgentServer) Restart() error {
	if err := s.Stop(); err != nil && !errors.Is(err, errors.New("服务未运行")) {
		return err
	}
	return s.Start()
}

// UpdateApplications 更新应用配置 support hot reload
func (s *AgentServer) UpdateApplications(config model.Config) {
	s.mu.Lock()
	defer s.mu.Unlock()

	mongoClient, err := mongodb.Connect(s.mongoURI)
	if err != nil {
		s.logger.Fatal().Err(err).Msg("Failed creating MongoDB client")
	}

	var wafLog model.WAFLog
	mongoConfig := &internal.MongoConfig{
		Client:     mongoClient,
		Database:   "waf",
		Collection: wafLog.GetCollectionName(),
	}

	// 从 Config 中提取 AppConfig 列表
	appConfigs := config.Engine.AppConfig

	// Convert model.AppConfig to internal.AppConfig and create applications
	allApps := make(map[string]*internal.Application)
	for _, modelAppConfig := range appConfigs {
		// 创建日志配置
		logConfig := cfg.LogConfig{
			Level:  modelAppConfig.LogLevel,
			File:   modelAppConfig.LogFile,
			Format: modelAppConfig.LogFormat,
		}

		// 创建日志记录器
		appLogger, err := logConfig.NewLogger()
		if err != nil {
			s.logger.Warn().Err(err).Str("app", modelAppConfig.Name).Msg("使用默认日志记录器")
			appLogger = globalLogger
		}

		// 创建内部 AppConfig
		internalAppConfig := internal.AppConfig{
			Directives:     modelAppConfig.Directives,
			ResponseCheck:  config.IsResponseCheck, // 使用全局响应检查设置
			Logger:         appLogger,
			TransactionTTL: modelAppConfig.TransactionTTL,
		}

		// 创建应用
		application, err := internalAppConfig.NewApplicationWithContext(s.ctx, mongoConfig)
		if err != nil {
			s.logger.Fatal().Err(err).Msg("Failed creating application: " + modelAppConfig.Name)
		}

		allApps[modelAppConfig.Name] = application
	}

	s.applications = allApps

	// 如果服务正在运行，热更新Agent的应用
	if s.state == ServerRunning && s.agent != nil {
		s.agent.ReplaceApplications(allApps)
		s.logger.Info().Msg("应用配置已更新")
	}
}

// UpdateNetworkAddress 更新网络地址 not support hot reload
func (s *AgentServer) UpdateNetworkAddress(network, address string) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.network = network
	s.address = address
}

// UpdateLogger 更新日志记录器 support hot reload
func (s *AgentServer) UpdateLogger(logger zerolog.Logger) {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.logger = logger
	if s.agent != nil {
		s.agent.Logger = logger
	}
}

// GetState 获取当前服务状态
func (s *AgentServer) GetState() ServerState {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.state
}

// GetLastError 获取最后一次错误
func (s *AgentServer) GetLastError() error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.lastError
}
