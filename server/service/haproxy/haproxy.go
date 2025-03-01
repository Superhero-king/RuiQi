package haproxy

import (
	"fmt"
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"

	"server/config"
)

// Status represents the current status of HAProxy
type Status struct {
	Running    bool      `json:"running"`
	PID        int       `json:"pid,omitempty"`
	Uptime     string    `json:"uptime,omitempty"`
	StartTime  time.Time `json:"start_time,omitempty"`
	ConfigPath string    `json:"config_path"`
}

// GetStatus returns the current status of HAProxy
func GetStatus() (*Status, error) {
	cfg, err := config.Load()
	if err != nil {
		return nil, err
	}

	status := &Status{
		Running:    false,
		ConfigPath: cfg.HAProxy.ConfigPath,
	}

	// Check if HAProxy is running
	cmd := exec.Command("pgrep", "haproxy")
	output, err := cmd.Output()
	if err == nil {
		// HAProxy is running
		status.Running = true

		// Get PID
		pid := strings.TrimSpace(string(output))
		fmt.Sscanf(pid, "%d", &status.PID)

		// Get process start time
		cmd = exec.Command("ps", "-p", pid, "-o", "lstart=")
		output, err = cmd.Output()
		if err == nil {
			startTimeStr := strings.TrimSpace(string(output))
			startTime, err := time.Parse("Mon Jan 2 15:04:05 2006", startTimeStr)
			if err == nil {
				status.StartTime = startTime
				status.Uptime = time.Since(startTime).String()
			}
		}
	}

	return status, nil
}

// GetConfig retrieves the current HAProxy configuration
func GetConfig() (string, error) {
	cfg, err := config.Load()
	if err != nil {
		return "", err
	}

	configPath := filepath.Join(cfg.HAProxy.ConfigPath, "haproxy.cfg")
	data, err := ioutil.ReadFile(configPath)
	if err != nil {
		return "", err
	}

	return string(data), nil
}

// UpdateConfig updates the HAProxy configuration
func UpdateConfig(configContent string) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	configPath := filepath.Join(cfg.HAProxy.ConfigPath, "haproxy.cfg")

	// Backup the existing configuration
	if _, err := os.Stat(configPath); err == nil {
		backupPath := configPath + ".bak." + time.Now().Format("20060102150405")
		data, err := ioutil.ReadFile(configPath)
		if err != nil {
			return err
		}

		if err := ioutil.WriteFile(backupPath, data, 0644); err != nil {
			return err
		}
	}

	// Write the new configuration
	if err := ioutil.WriteFile(configPath, []byte(configContent), 0644); err != nil {
		return err
	}

	// Validate the configuration
	cmd := exec.Command(cfg.HAProxy.BinaryPath, "-c", "-f", configPath)
	if output, err := cmd.CombinedOutput(); err != nil {
		// If validation fails, restore the backup
		backups, err := filepath.Glob(configPath + ".bak.*")
		if err == nil && len(backups) > 0 {
			latestBackup := backups[len(backups)-1]
			data, err := ioutil.ReadFile(latestBackup)
			if err == nil {
				ioutil.WriteFile(configPath, data, 0644)
			}
		}

		return fmt.Errorf("configuration validation failed: %s", string(output))
	}

	return nil
}

// Restart restarts the HAProxy service
func Restart() error {
	if err := Stop(); err != nil {
		return err
	}

	time.Sleep(time.Second) // Wait a moment for the process to fully terminate

	return Start()
}

// Start starts the HAProxy service
func Start() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	configPath := filepath.Join(cfg.HAProxy.ConfigPath, "haproxy.cfg")

	// Validate the configuration
	cmd := exec.Command(cfg.HAProxy.BinaryPath, "-c", "-f", configPath)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("configuration validation failed: %s", string(output))
	}

	// Start HAProxy
	cmd = exec.Command(cfg.HAProxy.BinaryPath, "-f", configPath)
	if err := cmd.Start(); err != nil {
		return err
	}

	return nil
}

// Stop stops the HAProxy service
func Stop() error {
	cmd := exec.Command("pkill", "haproxy")
	return cmd.Run()
}
