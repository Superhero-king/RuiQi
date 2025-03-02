package haproxy

import "github.com/HUAHUAI23/simple-waf/server/internal/model"

type HAProxyService interface {
	RemoveConfig() error
	InitConfig() error
	Start() error
	Reload() error
	Stop() error
	AddSiteConfig(site model.Site) error
}

type HAProxyServiceImpl struct {
	ConfigBaseDir string
	HaproxyBin    string
}

func (s *HAProxyServiceImpl) AddSiteConfig(site model.Site) error {
	return nil
}
