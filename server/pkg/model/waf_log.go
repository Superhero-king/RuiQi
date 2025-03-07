package model

import "time"

// FirewallLog represents a security event log
type FirewallLog struct {
	RuleID          int       `json:"ruleId"`          // ID of the triggered rule
	SecLangRaw      string    `json:"secLangRaw"`      // Raw security language definition
	Severity        int       `json:"severity"`        // Severity level of the event
	Phase           int       `json:"phase"`           // Phase of the request processing
	SecMark         string    `json:"secMark"`         // Security mark of the rule
	Accuracy        int       `json:"accuracy"`        // Accuracy level of the rule match
	Payload         string    `json:"payload"`         // Attack payload
	URI             string    `json:"uri"`             // Request URI
	ClientIPAddress string    `json:"clientIpAddress"` // Source IP address
	ServerIPAddress string    `json:"serverIpAddress"` // Destination IP address
	Domain          string    `json:"domain"`          // Target domain
	Logs            []Log     `json:"logs"`            // Associated log entries
	Message         string    `json:"message"`         // Event message or description
	Request         string    `json:"request"`         // Raw HTTP request
	Response        string    `json:"response"`        // Raw HTTP response
	CreatedAt       time.Time `json:"createdAt"`       // Timestamp of the event
}

// Log represents individual log entries
type Log struct {
	Message    string `json:"message"`    // Log message
	Payload    string `json:"payload"`    // Attack payload
	RuleID     int    `json:"ruleId"`     // Rule identifier
	Severity   int    `json:"severity"`   // Severity level
	Phase      int    `json:"phase"`      // Phase of the request processing
	SecMark    string `json:"secMark"`    // Security mark of the rule
	Accuracy   int    `json:"accuracy"`   // Accuracy level of the rule match
	SecLangRaw string `json:"secLangRaw"` // Raw security language
	LogRaw     string `json:"logRaw"`     // Raw log data
}
