package config

import (
	"encoding/json"
	"os"
	"path/filepath"
)

// Config holds the application configuration
type Config struct {
	// Server configuration
	ServerAddress string `json:"server_address"`
	Debug         bool   `json:"debug"`

	// HAProxy configuration
	HAProxy struct {
		ConfigPath    string `json:"config_path"`
		BinaryPath    string `json:"binary_path"`
		TemplatesPath string `json:"templates_path"`
	} `json:"haproxy"`

	// Engine configuration
	Engine struct {
		ConfigPath    string `json:"config_path"`
		BinaryPath    string `json:"binary_path"`
		TemplatesPath string `json:"templates_path"`
	} `json:"engine"`
}

// DefaultConfig returns a configuration with default values
func DefaultConfig() *Config {
	return &Config{
		ServerAddress: ":8080",
		Debug:         true,
		HAProxy: struct {
			ConfigPath    string `json:"config_path"`
			BinaryPath    string `json:"binary_path"`
			TemplatesPath string `json:"templates_path"`
		}{
			ConfigPath:    "/etc/haproxy",
			BinaryPath:    "/usr/sbin/haproxy",
			TemplatesPath: "templates/haproxy",
		},
		Engine: struct {
			ConfigPath    string `json:"config_path"`
			BinaryPath    string `json:"binary_path"`
			TemplatesPath string `json:"templates_path"`
		}{
			ConfigPath:    "/etc/corazawaf",
			BinaryPath:    "/usr/sbin/coraza-spoe",
			TemplatesPath: "templates/engine",
		},
	}
}

// Load reads configuration from the config file, or returns default configuration if the file doesn't exist
func Load() (*Config, error) {
	config := DefaultConfig()

	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		configPath = "config.json"
	}

	// Create config directory if it doesn't exist
	configDir := filepath.Dir(configPath)
	if _, err := os.Stat(configDir); os.IsNotExist(err) {
		if err := os.MkdirAll(configDir, 0755); err != nil {
			return nil, err
		}
	}

	// Check if config file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// Create default config file
		data, err := json.MarshalIndent(config, "", "  ")
		if err != nil {
			return nil, err
		}

		if err := os.WriteFile(configPath, data, 0644); err != nil {
			return nil, err
		}

		return config, nil
	}

	// Read config file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(data, config); err != nil {
		return nil, err
	}

	return config, nil
}

// Save writes the configuration to the config file
func (c *Config) Save() error {
	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		configPath = "config.json"
	}

	data, err := json.MarshalIndent(c, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(configPath, data, 0644)
}
