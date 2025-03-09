package daemon

import (
	"context"
	"sync"

	"github.com/HUAHUAI23/simple-waf/server/internal/config"
	"github.com/HUAHUAI23/simple-waf/server/internal/service/daemon/engine"
	"github.com/HUAHUAI23/simple-waf/server/internal/service/daemon/haproxy"
	"github.com/rs/zerolog"
)

// ServiceRunner 负责管理和协调所有后台服务
type ServiceRunner struct {
	haproxyService haproxy.HAProxyService
	engineService  engine.EngineService
	wg             sync.WaitGroup
	ctx            context.Context
	cancel         context.CancelFunc
	logger         *zerolog.Logger
}

// NewServiceRunner 创建一个新的服务运行器
func NewServiceRunner() *ServiceRunner {
	ctx, cancel := context.WithCancel(context.Background())
	logger := config.GetLogger().With().Str("component", "runner").Logger()
	haproxyService, err := haproxy.NewHAProxyService("", "", ctx)
	if err != nil {
		config.Logger.Error().Err(err).Msg("初始化 HAProxy 服务失败")
		// 可以返回 nil 或使用默认配置继续
	}

	// 创建 Engine 服务
	engineService, err := engine.NewEngineService(logger, config.Global.DBConfig.URI)
	if err != nil {
		config.Logger.Error().Err(err).Msg("初始化 Engine 服务失败")
		// 可以返回 nil 或使用默认配置继续
	}

	return &ServiceRunner{
		haproxyService: haproxyService,
		engineService:  engineService,
		ctx:            ctx,
		cancel:         cancel,
		logger:         &logger,
	}
}

// StartServices 启动所有服务
func (r *ServiceRunner) StartServices() {
	// 启动HAProxy服务
	r.wg.Add(1)
	go func() {
		defer r.wg.Done()

		siteList := GetTestSites()

		config.Logger.Info().Msg("开始启动HAProxy服务...")

		err := r.haproxyService.RemoveConfig()
		if err != nil {
			r.logger.Error().Err(err).Msg("删除HAProxy配置失败")
		}

		err = r.haproxyService.InitSpoeConfig()
		if err != nil {
			r.logger.Error().Err(err).Msg("初始化HAProxy配置失败")
		}

		err = r.haproxyService.InitHAProxyConfig()
		if err != nil {
			r.logger.Error().Err(err).Msg("初始化HAProxy配置失败")
		}

		err = r.haproxyService.AddCorazaBackend()
		if err != nil {
			r.logger.Error().Err(err).Msg("添加Coraza后端失败")
		}

		err = r.haproxyService.CreateHAProxyCrtStore()
		if err != nil {
			r.logger.Error().Err(err).Msg("创建HAProxy证书存储失败")
		}

		for i, site := range siteList {
			err := r.haproxyService.AddSiteConfig(site)
			if err != nil {
				r.logger.Error().Err(err).Msgf("添加站点配置失败 %d", i)
			}
		}

		if err := r.haproxyService.Start(); err != nil {
			r.logger.Error().Err(err).Msg("HAProxy服务失败")
		}
	}()

	// 启动Engine服务
	r.wg.Add(1)
	go func() {
		defer r.wg.Done()
		config.Logger.Info().Msg("启动Engine服务...")
		if err := r.engineService.Start(); err != nil {
			config.Logger.Error().Err(err).Msg("Engine服务失败")
		}
	}()
}

// StopServices 停止所有服务
func (r *ServiceRunner) StopServices() {
	config.Logger.Info().Msg("停止所有服务...")

	// 1. 首先取消上下文，通知所有使用该上下文的操作
	r.cancel()

	// 2. 显式调用各服务的 Stop 方法
	if r.haproxyService != nil {
		config.Logger.Info().Msg("正在停止 HAProxy 服务...")
		if err := r.haproxyService.Stop(); err != nil {
			config.Logger.Error().Err(err).Msg("停止 HAProxy 服务时出错")
		}
	}

	if r.engineService != nil {
		config.Logger.Info().Msg("正在停止 Engine 服务...")
		if err := r.engineService.Stop(); err != nil {
			config.Logger.Error().Err(err).Msg("停止 Engine 服务时出错")
		}
	}

	// 3. 等待所有 goroutine 完成
	r.wg.Wait()
	config.Logger.Info().Msg("所有服务已停止")
}
