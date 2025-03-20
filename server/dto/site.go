package dto

import (
	"time"

	"github.com/HUAHUAI23/simple-waf/server/model"
)

// CreateSiteRequest 创建站点请求
// @Description 创建站点的请求参数
type CreateSiteRequest struct {
	Name        string          `json:"name" binding:"required" example:"my-site"`       // 站点名称
	Domain      string          `json:"domain" binding:"required" example:"example.com"` // 域名
	ListenPort  int             `json:"listenPort" binding:"required" example:"8080"`    // 监听端口
	EnableHTTPS bool            `json:"enableHTTPS" example:"false"`                     // 是否启用HTTPS
	Certificate *CertificateDTO `json:"certificate,omitempty"`                           // 证书信息
	Backend     BackendDTO      `json:"backend" binding:"required"`                      // 后端服务器配置
	WAFEnabled  bool            `json:"wafEnabled" example:"false"`                      // 是否启用WAF
	WAFMode     string          `json:"wafMode" example:"observation"`                   // WAF模式
}

// UpdateSiteRequest 更新站点请求
// @Description 更新站点的请求参数
type UpdateSiteRequest struct {
	Name         string          `json:"name,omitempty" example:"my-site"`       // 站点名称
	Domain       string          `json:"domain,omitempty" example:"example.com"` // 域名
	ListenPort   int             `json:"listenPort,omitempty" example:"8080"`    // 监听端口
	EnableHTTPS  bool            `json:"enableHTTPS" example:"false"`            // 是否启用HTTPS
	Certificate  *CertificateDTO `json:"certificate,omitempty"`                  // 证书信息
	Backend      *BackendDTO     `json:"backend,omitempty"`                      // 后端服务器配置
	WAFEnabled   bool            `json:"wafEnabled" example:"false"`             // 是否启用WAF
	WAFMode      string          `json:"wafMode" example:"observation"`          // WAF模式
	ActiveStatus bool            `json:"activeStatus" example:"true"`            // 站点状态
}

// CertificateDTO 证书DTO
type CertificateDTO struct {
	CertName    string    `json:"certName" binding:"required" example:"my-cert"`         // 证书名称
	PublicKey   string    `json:"publicKey" binding:"required"`                          // 公钥内容
	PrivateKey  string    `json:"privateKey" binding:"required"`                         // 私钥内容
	ExpireDate  time.Time `json:"expireDate" binding:"required"`                         // 过期时间
	IssuerName  string    `json:"issuerName" binding:"required" example:"Let's Encrypt"` // 颁发机构
	FingerPrint string    `json:"fingerPrint" binding:"required"`                        // 证书指纹
}

// BackendDTO 后端服务器配置DTO
type BackendDTO struct {
	Servers []ServerDTO `json:"servers" binding:"required,dive"` // 服务器列表
}

// ServerDTO 服务器DTO
type ServerDTO struct {
	Host  string `json:"host" binding:"required" example:"backend.example.com"` // 主机地址
	Port  int    `json:"port" binding:"required" example:"80"`                  // 端口
	IsSSL bool   `json:"isSSL" example:"false"`                                 // 是否启用SSL
}

// SiteResponse 站点响应
// @Description 站点信息响应
type SiteResponse struct {
	model.Site
}

// SiteListResponse 站点列表响应
// @Description 站点列表响应
type SiteListResponse struct {
	Total int64        `json:"total"` // 总数
	Items []model.Site `json:"items"` // 站点列表
}
