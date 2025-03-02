package haproxy

import (
	"time"

	"github.com/HUAHUAI23/simple-waf/server/internal/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetTestSites returns test site data for development/testing
func GetTestSites() []model.Site {
	return []model.Site{
		{
			ID:           primitive.NewObjectID(),
			Name:         "测试站点1",
			Domain:       "test1.example.com",
			ListenPort:   80,
			EnableHTTPS:  false,
			WAFEnabled:   true,
			WAFMode:      model.WAFModeObservation,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
			ActiveStatus: true,
			Backend: model.Backend{
				Name: "be_test1_servers",
				Servers: []model.Server{
					{
						Name:   "srv1",
						Host:   "192.168.1.101",
						Port:   8080,
						Weight: 10,
					},
					{
						Name:   "srv2",
						Host:   "192.168.1.102",
						Port:   8080,
						Weight: 5,
					},
				},
			},
		},
		{
			ID:           primitive.NewObjectID(),
			Name:         "测试站点2",
			Domain:       "secure.example.org",
			ListenPort:   443,
			EnableHTTPS:  true,
			WAFEnabled:   true,
			WAFMode:      model.WAFModeProtection,
			CreatedAt:    time.Now().Add(-48 * time.Hour),
			UpdatedAt:    time.Now().Add(-24 * time.Hour),
			ActiveStatus: true,
			Certificate: model.Certificate{
				CertName:    "secure-cert",
				PublicKey:   "-----BEGIN CERTIFICATE-----\nMIIDazCCAlOgAwIBAgIUJlq+zz4mAgXVm9nMvS5A5G3OUfowDQYJKoZIhvcNAQEL\nBQAwRTELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoM\nGEludGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yMzA0MTYwMDAwMDBaFw0yNDA0\nMTUyMzU5NTlaMEUxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEw\nHwYDVQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEB\nAQUAA4IBDwAwggEKAoIBAQCrUaJ5R0dPlsq4XJh8HRRmVhZ9FQlV9hsgLP4dpBGk\nCXUYSqsjrcqBrPsFzhRHC4DcGFpUlc9T5mXKA/nOBVeYMk+TuimUVFcouwDFm2pt\n1G8/reY5zk/WL0QCvi4fPnP5J4YIirD/u3QhH1jCl4NUYlBIj3FHk2HSewTYvBKk\nUCDYS5uOBPv6VVJpXRG4QQy3jw5XPJzM5j0JVDFJezkc6qm6qKC6ZFQXZXDqrw4c\nyVP+/XLVBA9E+u+zXTBPNBjonMDmnXt90qc0BuFOdj+DUtGMJJ49kqM5SFoEKgPK\nrmt/YVgPWLQTYVBpDcG9kHBQzZJyVePAI4A4AOPHAgMBAAGjUzBRMB0GA1UdDgQW\nBBTg8IbhYyWsYH1rkWjwYClKUXo8YjAfBgNVHSMEGDAWgBTg8IbhYyWsYH1rkWjw\nYClKUXo8YjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQBRITJl\nBrUPxC1I7ywCgTbZ+Ar+JqGaz3znLiGLTu87UhZ2h0jsMWpfDXVygVTOQ5y0nVtW\nQCAcn/DTWqEsOg2mSMSKdK1rvzLdr3QmTszpOooQQpIZ+/nBNMjkpfaoz44Fmh78\n2eQCBljCUlvkimfNWxZVMXeoq/NG7BUJmGwyQpUggLYB2g09/gMnF6edWo3bHnRx\nwBQNFRtBKUP8Kk5GQoO/TNdYq5ppsvDRpKJA2JRzSRcNZRtJAWrGLBllx4HYlb6Y\n7kG+SmOk2bX2bxkW8oqmxJfEn5uu0Z3tzFKFp3DyQnMH9XSVIu6ICqNO0qR7aocL\nytRtOZJPJXICj7hL\n-----END CERTIFICATE-----",
				PrivateKey:  "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCrUaJ5R0dPlsq4\nXJh8HRRmVhZ9FQlV9hsgLP4dpBGkCXUYSqsjrcqBrPsFzhRHC4DcGFpUlc9T5mXK\nA/nOBVeYMk+TuimUVFcouwDFm2pt1G8/reY5zk/WL0QCvi4fPnP5J4YIirD/u3Qh\nH1jCl4NUYlBIj3FHk2HSewTYvBKkUCDYS5uOBPv6VVJpXRG4QQy3jw5XPJzM5j0J\nVDFJezkc6qm6qKC6ZFQXZXDqrw4cyVP+/XLVBA9E+u+zXTBPNBjonMDmnXt90qc0\nBuFOdj+DUtGMJJ49kqM5SFoEKgPKrmt/YVgPWLQTYVBpDcG9kHBQzZJyVePAI4A4\nAOPHAgMBAAECggEBAIvLAl4SJbF+LtFihpudBUVXPB8w1JDU3uvXgWRcJu3Svt7F\nTgXQI1JcYbYLxVbQTsUDvtJcWbPunaBXk0JONjkB95RkKQSEvuppofOYUQf9ZYnv\neDdXvZo+H/IElJtAdEXGzaagoDBCwkDKMD8L3ZrMkmGQBKvRDSwOt6iqYG54aJVB\nv8+bWxZKgj1eCfV/RdZlDPmixiSJNMfgkJ9J6/nXnITUAolXxlmE3JV0IXKfDBq9\nKtgIFM1UrFZQTuYJKnQR/w31dUILli9h0dUOq3ZDbHErUQQIfGXXyEC9OZiTPKhw\nIuTXWQ4rajw2/+rRWd0EZ6ZukutRCKPV+o4ItqECgYEA3N9S0YvA0Sjvb9YrDar8\nVDFGXe89GBvAkS7feT915g9XbJlS/Ik8aJByzTbVWjP0jLAlPpet4jCHsESwvv5T\nFgfW9Krj5pY5A3a1pbRCo0GqXTOKsUGrUYqvbRYxGv2bIjvDDPiZDSp7TdpT8vCt\nXOEfAb+q/5s/8QVqzA/G9lECgYEAxiP/L9WZhkwZYJvkA0D2/bwJST33OEJPMRtR\nkCjkDfJaS3HYXgV9AdEBUbTYDaIFzDvOCdK3TVH2GmOFvz0Mx0vEDWlFpUhfmpcP\nfKHXr3TMHzNNdOWX5p7o7sfrHLObAARHZlrRQMFd5N9KH0YJwE/9LVeVlzMkYkXs\nrNnXNDcCgYAjnTqQDsqQiMTRJVXE94cjEm2Y2zcPBWnN6Sng1yreHLTZU+3vYgfR\nXGoYBxUIUxIKTXyLIUjESTNQY5Frst2xi0SFv9hbMIdtlGTj3KRUGVLkxQASO14g\n5g7cky/A2+8sKKXWLWYHwXG+4lYRZRLOQ9fOaEzNz343XJ4d+TgRIQKBgQCbSNVS\nwT9laQV/rZ/8eyOxzJmW3KJ1rmgRi58M9vNmWxPiZ8PQjAIiSTV2y2iLGFdbAErX\nXetn8wcMFj3Lm8tlUr5SHKkl9wYYjXEFwpLsFFoJr9erpUeHn0q0yHqx5Orx2BzP\nFje7BU59cvWqwcP9h7QZO6/2MStR3BY04p8/DQKBgDYZRgWWLis1DpGZA5XHERes\nORG/XKVZHbYgCDNr+iGUxKUkxGuxjqNBjqWYDx6UeeXUJ5Y0BUbDKMuyCJIYZJZj\nwKBNAHvbJIGWaR3ByFzwkWxF3XJqG5GHKfgSlnLR8D17mqXlC4XJOAmjaVTzA3LD\nPe6H1aoJI2yPbKd+2UBF\n-----END PRIVATE KEY-----",
				ExpireDate:  time.Now().AddDate(1, 0, 0),
				IssuerName:  "Internet Widgets Pty Ltd",
				FingerPrint: "5E:FF:56:A2:AF:15:88:25:AE:E2:2B:B5:11:64:63:F8:8E:7C:D2:2E",
			},
			Backend: model.Backend{
				Name: "be_secure_servers",
				Servers: []model.Server{
					{
						Name:   "web1",
						Host:   "10.0.1.10",
						Port:   8443,
						Weight: 10,
					},
					{
						Name:   "web2",
						Host:   "10.0.1.11",
						Port:   8443,
						Weight: 10,
					},
					{
						Name:   "web3",
						Host:   "10.0.1.12",
						Port:   8443,
						Weight: 5,
					},
				},
			},
		},
		{
			ID:           primitive.NewObjectID(),
			Name:         "测试站点3（未激活）",
			Domain:       "dev.example.net",
			ListenPort:   8080,
			EnableHTTPS:  false,
			WAFEnabled:   false,
			WAFMode:      model.WAFModeObservation,
			CreatedAt:    time.Now().Add(-7 * 24 * time.Hour),
			UpdatedAt:    time.Now().Add(-7 * 24 * time.Hour),
			ActiveStatus: false,
			Backend: model.Backend{
				Name: "be_dev_servers",
				Servers: []model.Server{
					{
						Name:   "dev-srv",
						Host:   "172.16.0.50",
						Port:   9000,
						Weight: 1,
					},
				},
			},
		},
	}
}
