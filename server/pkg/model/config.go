package model

import (
	"time"
)

type Config struct {
	Engine          EngineConfig  `bson:"engine" json:"engine"`
	Haproxy         HaproxyConfig `bson:"haproxy" json:"haproxy"`
	CreatedAt       time.Time     `bson:"createdAt" json:"createdAt"`
	UpdatedAt       time.Time     `bson:"updatedAt" json:"updatedAt"`
	IsResponseCheck bool          `bson:"isResponseCheck" json:"isResponseCheck"`
}

type EngineConfig struct {
	Name             string `bson:"name" json:"name"`
	Bind             string `bson:"bind" json:"bind"`
	UseBuiltinRules  bool   `bson:"useBuiltinRules" json:"useBuiltinRules"`
	Directives       string `bson:"directives" json:"directives"`
	ResponseCheck    bool   `bson:"responseCheck" json:"responseCheck"`
	TransactionTTLMs int    `bson:"transactionTtlMs" json:"transactionTtlMs"`
	LogLevel         string `bson:"logLevel" json:"logLevel"`
	LogFile          string `bson:"logFile" json:"logFile"`
	LogFormat        string `bson:"logFormat" json:"logFormat"`
}

type HaproxyConfig struct {
	ConfigBaseDir string `bson:"configBaseDir" json:"configBaseDir"`
	HaproxyBin    string `bson:"haproxyBin" json:"haproxyBin"`
	BackupsNumber int    `bson:"backupsNumber" json:"backupsNumber"`
	SpoeAgentAddr string `bson:"spoeAgentAddr" json:"spoeAgentAddr"`
	SpoeAgentPort int    `bson:"spoeAgentPort" json:"spoeAgentPort"`
}

func (c *Config) GetCollectionName() string {
	return "configs"
}
