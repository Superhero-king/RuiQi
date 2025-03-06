package engine

type EngineService interface {
	Start() error
	Stop() error
}
