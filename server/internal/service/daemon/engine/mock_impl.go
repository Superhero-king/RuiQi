package engine

import (
	"fmt"
	"log"
	"sync"
	"time"
)

// MockEngineService 是一个简单的 EngineService 实现，用于测试目的
type MockEngineService struct {
	isRunning bool
	startTime time.Time
	mutex     sync.Mutex
	config    MockConfig
}

// MockConfig 包含引擎的配置选项
type MockConfig struct {
	Name           string
	StartupDelay   time.Duration // 模拟启动延迟
	ShutdownDelay  time.Duration // 模拟关闭延迟
	SimulateErrors bool          // 是否模拟错误情况
}

// NewMockEngineService 创建一个新的模拟引擎服务实例
func NewMockEngineService(config MockConfig) *MockEngineService {
	if config.Name == "" {
		config.Name = "MockEngine"
	}
	return &MockEngineService{
		isRunning: false,
		config:    config,
	}
}

// Start 启动引擎服务
func (e *MockEngineService) Start() error {
	e.mutex.Lock()
	defer e.mutex.Unlock()

	log.Printf("[%s] 正在启动引擎...", e.config.Name)

	// 检查是否已经在运行
	if e.isRunning {
		return fmt.Errorf("引擎已经在运行中")
	}

	// 模拟启动延迟
	if e.config.StartupDelay > 0 {
		log.Printf("[%s] 启动需要 %v 时间", e.config.Name, e.config.StartupDelay)
		time.Sleep(e.config.StartupDelay)
	}

	// 模拟启动错误
	if e.config.SimulateErrors {
		return fmt.Errorf("模拟的启动错误")
	}

	// 标记为运行状态
	e.isRunning = true
	e.startTime = time.Now()
	log.Printf("[%s] 引擎已成功启动", e.config.Name)
	return nil
}

// Stop 停止引擎服务
func (e *MockEngineService) Stop() error {
	e.mutex.Lock()
	defer e.mutex.Unlock()

	log.Printf("[%s] 正在停止引擎...", e.config.Name)

	// 检查是否正在运行
	if !e.isRunning {
		return fmt.Errorf("引擎未在运行中")
	}

	// 模拟关闭延迟
	if e.config.ShutdownDelay > 0 {
		log.Printf("[%s] 关闭需要 %v 时间", e.config.Name, e.config.ShutdownDelay)
		time.Sleep(e.config.ShutdownDelay)
	}

	// 模拟关闭错误
	if e.config.SimulateErrors {
		return fmt.Errorf("模拟的关闭错误")
	}

	// 计算运行时间
	runningTime := time.Since(e.startTime)
	log.Printf("[%s] 引擎已成功停止，运行时间: %v", e.config.Name, runningTime)

	// 标记为非运行状态
	e.isRunning = false
	return nil
}

// IsRunning 返回引擎当前是否在运行
func (e *MockEngineService) IsRunning() bool {
	e.mutex.Lock()
	defer e.mutex.Unlock()
	return e.isRunning
}

// GetUptime 返回引擎的运行时间
func (e *MockEngineService) GetUptime() time.Duration {
	e.mutex.Lock()
	defer e.mutex.Unlock()

	if !e.isRunning {
		return 0
	}
	return time.Since(e.startTime)
}
