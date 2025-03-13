package model

import (
	"time"
)

// CertificateStore 代表证书库表
type CertificateStore struct {
	Name        string    `bson:"name" json:"name"`               // 证书名称/别名
	Description string    `bson:"description" json:"description"` // 证书描述
	PublicKey   string    `bson:"publicKey" json:"publicKey"`     // 公钥内容（PEM格式）
	PrivateKey  string    `bson:"privateKey" json:"privateKey"`   // 私钥内容（PEM格式）
	ExpireDate  time.Time `bson:"expireDate" json:"expireDate"`   // 证书过期日期
	IssuerName  string    `bson:"issuerName" json:"issuerName"`   // 颁发机构
	FingerPrint string    `bson:"fingerPrint" json:"fingerPrint"` // 证书指纹
	Domains     []string  `bson:"domains" json:"domains"`         // 证书绑定的域名列表
	CreatedAt   time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time `bson:"updatedAt" json:"updatedAt"`
}
