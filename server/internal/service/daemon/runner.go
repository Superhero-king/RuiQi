package daemon

import (
	"context"
	"sync"

	"github.com/HUAHUAI23/simple-waf/server/internal/config"
	"github.com/HUAHUAI23/simple-waf/server/internal/service/daemon/engine"
	"github.com/HUAHUAI23/simple-waf/server/internal/service/daemon/haproxy"
)

// ServiceRunner 负责管理和协调所有后台服务
type ServiceRunner struct {
	haproxyService haproxy.Service
	engineService  engine.Service
	wg             sync.WaitGroup
	ctx            context.Context
	cancel         context.CancelFunc
}

// NewServiceRunner 创建一个新的服务运行器
func NewServiceRunner() *ServiceRunner {
	ctx, cancel := context.WithCancel(context.Background())
	return &ServiceRunner{
		haproxyService: haproxy.NewService(),
		engineService:  engine.NewService(),
		ctx:            ctx,
		cancel:         cancel,
	}
}

// StartServices 启动所有服务
func (r *ServiceRunner) StartServices() {
	// 启动HAProxy服务
	r.wg.Add(1)
	go func() {
		defer r.wg.Done()
		config.Logger.Info().Msg("启动HAProxy服务...")
		if err := r.haproxyService.Start(r.ctx); err != nil {
			config.Logger.Error().Err(err).Msg("HAProxy服务失败")
		}
	}()

	// 启动Engine服务
	r.wg.Add(1)
	go func() {
		defer r.wg.Done()
		config.Logger.Info().Msg("启动Engine服务...")
		if err := r.engineService.Start(r.ctx); err != nil {
			config.Logger.Error().Err(err).Msg("Engine服务失败")
		}
	}()
}

// StopServices 停止所有服务
func (r *ServiceRunner) StopServices() {
	config.Logger.Info().Msg("停止所有服务...")
	r.cancel()
	r.wg.Wait()
	config.Logger.Info().Msg("所有服务已停止")
}
