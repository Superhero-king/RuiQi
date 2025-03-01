package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Site 代表一个站点配置
type Site struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name           string             `bson:"name" json:"name"`                                   // 站点名称
	Domain         string             `bson:"domain" json:"domain"`                               // 域名，如 a.com
	ListenPort     int                `bson:"listen_port" json:"listen_port"`                     // 监听端口，如 9000
	EnableHTTPS    bool               `bson:"enable_https" json:"enable_https"`                   // 是否启用HTTPS
	Certificate    Certificate        `bson:"certificate,omitempty" json:"certificate,omitempty"` // 证书信息
	Backend        Backend            `bson:"backend" json:"backend"`                             // 后端服务器配置
	WAFEnabled     bool               `bson:"waf_enabled" json:"waf_enabled"`                     // 是否启用WAF
	WAFProtectMode string             `bson:"waf_protect_mode" json:"waf_protect_mode"`           // WAF防护模式
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt      time.Time          `bson:"updated_at" json:"updated_at"`
	ActiveStatus   bool               `bson:"active_status" json:"active_status"` // 站点是否激活
}

// Certificate 代表证书信息
type Certificate struct {
	CertName    string    `bson:"cert_name" json:"cert_name"`       // 证书名称/别名
	PublicKey   string    `bson:"public_key" json:"public_key"`     // 公钥内容（PEM格式）
	PrivateKey  string    `bson:"private_key" json:"private_key"`   // 私钥内容（PEM格式）
	ExpireDate  time.Time `bson:"expire_date" json:"expire_date"`   // 证书过期日期
	IssuerName  string    `bson:"issuer_name" json:"issuer_name"`   // 颁发机构
	FingerPrint string    `bson:"finger_print" json:"finger_print"` // 证书指纹
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
}

// CertificateStore 代表证书库表
type CertificateStore struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Name        string             `bson:"name" json:"name"`                 // 证书名称/别名
	Description string             `bson:"description" json:"description"`   // 证书描述
	PublicKey   string             `bson:"public_key" json:"public_key"`     // 公钥内容（PEM格式）
	PrivateKey  string             `bson:"private_key" json:"private_key"`   // 私钥内容（PEM格式）
	ExpireDate  time.Time          `bson:"expire_date" json:"expire_date"`   // 证书过期日期
	IssuerName  string             `bson:"issuer_name" json:"issuer_name"`   // 颁发机构
	FingerPrint string             `bson:"finger_print" json:"finger_print"` // 证书指纹
	Domains     []string           `bson:"domains" json:"domains"`           // 证书绑定的域名列表
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}
