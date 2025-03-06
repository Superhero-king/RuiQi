package daemon

import (
	"time"

	"github.com/HUAHUAI23/simple-waf/server/internal/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetTestSites 返回用于开发/测试的模拟站点数据
func GetTestSites() []model.Site {
	// 创建当前时间的引用，以确保所有时间戳的一致性
	now := time.Now()

	return []model.Site{
		{
			ID:           primitive.NewObjectID(),
			Name:         "测试站点-ip",
			Domain:       "10.214.210.183",
			ListenPort:   8080,
			EnableHTTPS:  false,
			WAFEnabled:   true,
			WAFMode:      model.WAFModeObservation,
			CreatedAt:    now,
			UpdatedAt:    now,
			ActiveStatus: true,
			Backend: model.Backend{
				Name: "be_test1_servers",
				Servers: []model.Server{
					{
						Name:   "srv1",
						Host:   "httpbin.org",
						Port:   80,
						Weight: 10,
						IsSSL:  false,
					},
					{
						Name:   "srv2",
						Host:   "httpbin.org",
						Port:   80,
						Weight: 5,
						IsSSL:  false,
					},
				},
			},
		},
		{
			ID:           primitive.NewObjectID(),
			Name:         "测试站点2-http",
			Domain:       "b.com",
			ListenPort:   8080,
			EnableHTTPS:  false,
			WAFEnabled:   true,
			WAFMode:      model.WAFModeObservation,
			CreatedAt:    now.Add(-7 * 24 * time.Hour),
			UpdatedAt:    now.Add(-7 * 24 * time.Hour),
			ActiveStatus: true,
			Backend: model.Backend{
				Name: "be_dev_servers",
				Servers: []model.Server{
					{
						Name:   "dev-srv",
						Host:   "httpbin.org",
						Port:   80,
						Weight: 1,
						IsSSL:  false,
					},
				},
			},
		},
		{
			ID:           primitive.NewObjectID(),
			Name:         "测试站点2-https",
			Domain:       "a.com",
			ListenPort:   9443,
			EnableHTTPS:  true,
			WAFEnabled:   true,
			WAFMode:      model.WAFModeProtection,
			CreatedAt:    now.Add(-48 * time.Hour),
			UpdatedAt:    now.Add(-24 * time.Hour),
			ActiveStatus: true,
			Certificate: model.Certificate{
				CertName: "secure-cert",
				PublicKey: `-----BEGIN CERTIFICATE-----
MIIDmzCCAoOgAwIBAgIUF8gB7go14E2Pdd0eeb5GWJ35iiUwDQYJKoZIhvcNAQEL
BQAwXTELMAkGA1UEBhMCQ04xEDAOBgNVBAgMB0JlaWppbmcxEDAOBgNVBAcMB0Jl
aWppbmcxDTALBgNVBAoMBFRlc3QxCzAJBgNVBAsMAklUMQ4wDAYDVQQDDAVhLmNv
bTAeFw0yNTAyMTkxNTAxNTJaFw0yNjAyMTkxNTAxNTJaMF0xCzAJBgNVBAYTAkNO
MRAwDgYDVQQIDAdCZWlqaW5nMRAwDgYDVQQHDAdCZWlqaW5nMQ0wCwYDVQQKDARU
ZXN0MQswCQYDVQQLDAJJVDEOMAwGA1UEAwwFYS5jb20wggEiMA0GCSqGSIb3DQEB
AQUAA4IBDwAwggEKAoIBAQCr1qZe7hDyo8gxnBfNx5m2dLfgbQU5tql/v90RLbBN
3+FFY0Tfb4MeE2ZtOnu/dEdia0MYPudCUwYZ2G2SAs6kQKsW017oZLf/bl7KgHGA
1OYqPdYwGyo0+SADgkJObspF102hUifFDx6NRzyYQxN9SETPkv3vORsEo+QaO9Bt
jgjaOC8YCesE14wdAoRJLipiSFK058BZCSNXqDCQaEHFCEFnn/LzxsJt5gbd7lyO
R895la+fop4M8kAE12KmR5IGufr7QKOgJCvZz6f0Pr11wDeIjIPdBRI3ck8cmM91
daatGoTakkjPUiU3qiJKU78HhGap9VmpqgTITncH9kVTAgMBAAGjUzBRMB0GA1Ud
DgQWBBQHl98+UjFubSYyTPHHdCyehi/2tzAfBgNVHSMEGDAWgBQHl98+UjFubSYy
TPHHdCyehi/2tzAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAD
qxOabi4OI9eMkfNnMs9AOVCUX03bF6jdlGsmWNdQmyCVFbOlRA9OBIrcZEQtA841
aYOCXVagounfokvRfljhrCckl3dA4f7eqPMP8ycDpafHdEu4IJSsr14IgAdq0ZfJ
MMtfMIpctz+Su9tYYgvvPCxIvONdCfPmzdvhMftRyHTrceg66hTnNwg8f3yAVok4
bOX/6A1yHIVbHyVLZ3Ez4bL8lyz4xuwFr26d3ApCP46NAYnMUliEKzegovnPUpLt
cloaYekgOnUBmr8yBIwZJqp8P0Gaa7mfNzlXRNOCmS18xahdTOSpSg5KfC1G7Jtg
YylDIhRE0QrE+5pu7dAs
-----END CERTIFICATE-----`,
				PrivateKey: `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCr1qZe7hDyo8gx
nBfNx5m2dLfgbQU5tql/v90RLbBN3+FFY0Tfb4MeE2ZtOnu/dEdia0MYPudCUwYZ
2G2SAs6kQKsW017oZLf/bl7KgHGA1OYqPdYwGyo0+SADgkJObspF102hUifFDx6N
RzyYQxN9SETPkv3vORsEo+QaO9BtjgjaOC8YCesE14wdAoRJLipiSFK058BZCSNX
qDCQaEHFCEFnn/LzxsJt5gbd7lyOR895la+fop4M8kAE12KmR5IGufr7QKOgJCvZ
z6f0Pr11wDeIjIPdBRI3ck8cmM91daatGoTakkjPUiU3qiJKU78HhGap9VmpqgTI
TncH9kVTAgMBAAECggEACyO8oE3NknU0nqawUlo8qDvTybw3iQDC5zGwapMsKTg4
uc9QIS3w8YuvaahPal9m20X50QIO6tlH/XfuznbZH4PDs5SbQ/R3ixsEERuXgBMN
IrLkhjTUnR+DSEby9nOvMCzfbvRM+LTctarnDjXW9xmuwEgWpyHsEvZu7JZxEhD2
Ya8cuQ90mKS5TyLR/2KoJf7zbJlfiecLMExdEETXkLy04OBmhQwIR7ZKNe7eUBjn
1WtXs3INMkoDHxo3+85lggZAd/hAG4swJfTHHVbKTLrXRjHlIBEQ3NfjwdCOIqVG
DuFtk3A+bdP4Z2q8sjcQL/HPrY2Jl+p2GPxnvFQ8TQKBgQDaafRzSf63omv2Gh6Q
qrGooIXwArwkNCbTARdnBx41XygdhdP3aRhgE6i3Mm3C97BJAuS79ZWEjZGhI0Dw
2uwzk4oSl8LZiLq/E7z4DcTYqM1O6+mSiVFHsVrDhZGgfReQCaBZp032iERQLEXP
TjxA99r361LL7vyFYo3o8wv+pQKBgQDJaNp4lAk7ojZxSxmh1qqSKuaqL/fXXBL3
Kv83ObIuh00ylGFlHUhCff9fQ1BhQBxOA4fCW2axSx9WiUqTiVpiyw5BQPN+9sPb
wfMrLZ1gYrVEFEQE8VoiM9tQEwRqKQAEApAa0YqmFxDUwACfdAROfPejYw/pFLpU
3Ake5OwqlwKBgQCVCnJd7aNcSgBj6oTq8R/UUt2y3xrllZTcrcT7cBcEEo/8PWNc
VCHnBeM+R7IwtfZcjBXr0PSbhENY8waQlMNTmp1AfMDg0nWkh+KOXk7yDZY0AbXc
YcnOI08tVsr9+f6HMppyM0F3NptvHhbxFJD3QGryfGl+cfFtT8hIqvmHZQKBgQCf
X8Q409N2h8aS4b13rdktbps2Ilz44lfzk+d+OL6BSPlSQ83J6GDslK1GIYryWXvM
U8jSh+b79hjnLh6AHpkSQeGWyyGi3vte4ttb2G2G/rS3GV41lxIerHAnrdS5eJYV
lj2XqyYOhYQBBam4g2KBBSwj8th9NLS5P6BL/RPQIwKBgARL+81+hJBCsI8tgdeg
KtDhUqEAeKKNoud549B9x1Y6gGInP931DHofPQWaxGKHnsQhgMD08gCKIRMK6O0f
50PgqZoqJlL/j590/R8Sh6fg8Y3WY7zd3KQgpYS+pYJotzvCfczxWqIvFFCCx2Lu
JtutDjT7wgLTacd+39nhwVKw
-----END PRIVATE KEY-----`,
				ExpireDate:  now.AddDate(1, 0, 0),
				IssuerName:  "Internet Widgets Pty Ltd",
				FingerPrint: "5E:FF:56:A2:AF:15:88:25:AE:E2:2B:B5:11:64:63:F8:8E:7C:D2:2E",
			},
			Backend: model.Backend{
				Name: "be_secure_servers",
				Servers: []model.Server{
					{
						Name:   "web1",
						Host:   "httpbin.org",
						Port:   443,
						Weight: 10,
						IsSSL:  false,
					},
				},
			},
		},
		{
			ID:           primitive.NewObjectID(),
			Name:         "测试站点2-inactive",
			Domain:       "c.com",
			ListenPort:   8080,
			EnableHTTPS:  false,
			WAFEnabled:   true,
			WAFMode:      model.WAFModeObservation,
			CreatedAt:    now.Add(-7 * 24 * time.Hour),
			UpdatedAt:    now.Add(-7 * 24 * time.Hour),
			ActiveStatus: false,
			Backend: model.Backend{
				Name: "be_dev_servers",
				Servers: []model.Server{
					{
						Name:   "dev-srv",
						Host:   "httpbin.org",
						Port:   80,
						Weight: 1,
						IsSSL:  false,
					},
				},
			},
		},
	}
}
