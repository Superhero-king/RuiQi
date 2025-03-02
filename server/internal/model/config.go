package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Config struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Engine    EngineConfig       `bson:"engine" json:"engine"`
	Haproxy   HaproxyConfig      `bson:"haproxy" json:"haproxy"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
	Version   int                `bson:"version" json:"version"`
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
}
