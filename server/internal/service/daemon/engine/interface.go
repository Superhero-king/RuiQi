package engine

type EngineService interface {
	Start() error
	Restart() error
	Stop() error
}
