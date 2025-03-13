package model

import (
	"time"
)

// WAFMode 定义WAF工作模式类型
type WAFMode string

const (
	WAFModeProtection  WAFMode = "protection"  // 防护模式
	WAFModeObservation WAFMode = "observation" // 观察模式
)

// Site 代表一个站点配置
type Site struct {
	Name         string      `bson:"name" json:"name"`                                   // 站点名称
	Domain       string      `bson:"domain" json:"domain"`                               // 域名，如 a.com
	ListenPort   int         `bson:"listenPort" json:"listenPort"`                       // 监听端口，如 9000
	EnableHTTPS  bool        `bson:"enableHTTPS" json:"enableHTTPS"`                     // 是否启用HTTPS
	Certificate  Certificate `bson:"certificate,omitempty" json:"certificate,omitempty"` // 证书信息
	Backend      Backend     `bson:"backend" json:"backend"`                             // 后端服务器配置
	WAFEnabled   bool        `bson:"wafEnabled" json:"wafEnabled"`                       // 是否启用WAF
	WAFMode      WAFMode     `bson:"wafMode" json:"wafMode"`                             // WAF防护模式
	CreatedAt    time.Time   `bson:"createdAt" json:"createdAt"`
	UpdatedAt    time.Time   `bson:"updatedAt" json:"updatedAt"`
	ActiveStatus bool        `bson:"activeStatus" json:"activeStatus"` // 站点是否激活
}

// Certificate 代表证书信息
type Certificate struct {
	CertName    string    `bson:"certName" json:"certName"`       // 证书名称/别名
	PublicKey   string    `bson:"publicKey" json:"publicKey"`     // 公钥内容（PEM格式）
	PrivateKey  string    `bson:"privateKey" json:"privateKey"`   // 私钥内容（PEM格式）
	ExpireDate  time.Time `bson:"expireDate" json:"expireDate"`   // 证书过期日期
	IssuerName  string    `bson:"issuerName" json:"issuerName"`   // 颁发机构
	FingerPrint string    `bson:"fingerPrint" json:"fingerPrint"` // 证书指纹
}

// Backend 代表后端服务器配置
type Backend struct {
	Name    string   `bson:"name" json:"name"`       // 后端名称，如 be_a_servers
	Servers []Server `bson:"servers" json:"servers"` // 服务器列表
}

// Server 代表单个后端服务器
type Server struct {
	Name   string `bson:"name" json:"name"`     // 服务器名称，如 a1
	Host   string `bson:"host" json:"host"`     // 主机地址，如 IP 或域名
	Port   int    `bson:"port" json:"port"`     // 端口
	Weight int    `bson:"weight" json:"weight"` // 权重
	IsSSL  bool   `bson:"isSSL" json:"isSSL"`   // 是否启用SSL
}

// IsValidWAFMode 检查WAF模式是否有效
func IsValidWAFMode(mode WAFMode) bool {
	return mode == WAFModeProtection || mode == WAFModeObservation
}

// DefaultWAFMode 返回默认的WAF模式
func DefaultWAFMode() WAFMode {
	return WAFModeObservation
}

// GetAllWAFModes 返回所有可用的WAF模式
func GetAllWAFModes() []WAFMode {
	return []WAFMode{WAFModeProtection, WAFModeObservation}
}

// NewSite 创建一个新站点，设置默认值
func NewSite() *Site {
	return &Site{
		WAFMode:   DefaultWAFMode(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
}

// ValidateSite 验证站点配置有效性
func ValidateSite(site *Site) error {
	if !IsValidWAFMode(site.WAFMode) {
		site.WAFMode = DefaultWAFMode()
	}
	return nil
}

// WAFModeFromString 从字符串转换为WAFMode
func WAFModeFromString(s string) WAFMode {
	mode := WAFMode(s)
	if !IsValidWAFMode(mode) {
		return DefaultWAFMode()
	}
	return mode
}
