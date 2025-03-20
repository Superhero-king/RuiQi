package dto

import (
	"time"

	"github.com/HUAHUAI23/simple-waf/pkg/model"
)

// AttackEventRequset 攻击事件查询请求
// @Description 攻击事件聚合查询条件，支持按客户端IP、域名、端口和时间范围筛选
type AttackEventRequset struct {
	ClientIPAddress string    `json:"clientIpAddress" form:"clientIpAddress" example:"192.168.1.100"`  // 客户端IP地址
	Domain          string    `json:"domain" form:"domain" example:"example.com"`                      // 域名
	Port            int       `json:"port" form:"port" example:"443"`                                  // 端口号
	StartTime       time.Time `json:"startTime" form:"startTime" example:"2024-03-17T00:00:00Z"`       // 开始时间
	EndTime         time.Time `json:"endTime" form:"endTime" example:"2024-03-18T23:59:59Z"`           // 结束时间
	Page            int       `json:"page" form:"page" binding:"omitempty,min=1" example:"1"`          // 页码
	PageSize        int       `json:"pageSize" form:"pageSize" binding:"omitempty,min=1" example:"10"` // 每页数量
}

// AttackLogRequest 攻击日志查询请求
// @Description 详细攻击日志查询条件，支持按规则ID、客户端IP、域名、端口和时间范围筛选
type AttackLogRequest struct {
	RuleID          int       `json:"ruleId" form:"ruleId" example:"100012"`                           // 规则ID
	Port            int       `json:"port" form:"port" example:"443"`                                  // 端口号
	Domain          string    `json:"domain" form:"domain" example:"example.com"`                      // 域名
	ClientIPAddress string    `json:"clientIpAddress" form:"clientIpAddress" example:"192.168.1.100"`  // 客户端IP地址
	StartTime       time.Time `json:"startTime" form:"startTime" example:"2024-03-17T00:00:00Z"`       // 开始时间
	EndTime         time.Time `json:"endTime" form:"endTime" example:"2024-03-18T23:59:59Z"`           // 结束时间
	Page            int       `json:"page" form:"page" binding:"omitempty,min=1" example:"1"`          // 页码
	PageSize        int       `json:"pageSize" form:"pageSize" binding:"omitempty,min=1" example:"10"` // 每页数量
}

// AttackEventAggregateResult 攻击事件聚合结果
// @Description 攻击事件聚合结果，按客户端IP和域名分组统计
type AttackEventAggregateResult struct {
	ClientIPAddress   string    `bson:"clientIpAddress" json:"clientIpAddress" example:"192.168.1.100"`                // 客户端IP地址
	Domain            string    `bson:"domain" json:"domain" example:"example.com"`                                    // 域名
	Count             int       `bson:"count" json:"count" example:"15"`                                               // 攻击次数
	FirstAttackTime   time.Time `bson:"firstAttackTime" json:"firstAttackTime" example:"2024-03-18T08:12:33Z"`         // 首次攻击时间
	LastAttackTime    time.Time `bson:"lastAttackTime" json:"lastAttackTime" example:"2024-03-18T08:30:45Z"`           // 最近攻击时间
	DurationInMinutes float64   `bson:"durationInMinutes,omitempty" json:"durationInMinutes,omitempty" example:"18.2"` // 攻击持续时间(分钟)
	IsOngoing         bool      `bson:"isOngoing" json:"isOngoing" example:"true"`                                     // 是否正在进行中
}

// AttackEventResponse 攻击事件响应
// @Description 攻击事件分页查询结果
type AttackEventResponse struct {
	Results     []AttackEventAggregateResult `json:"results"`                 // 聚合结果列表
	TotalCount  int64                        `json:"totalCount" example:"35"` // 总记录数
	PageSize    int                          `json:"pageSize" example:"10"`   // 每页大小
	CurrentPage int                          `json:"currentPage" example:"1"` // 当前页码
	TotalPages  int                          `json:"totalPages" example:"4"`  // 总页数
}

// AttackLogResponse 攻击日志响应
// @Description 攻击日志分页查询结果
type AttackLogResponse struct {
	Results     []model.WAFLog `json:"results"`                  // 日志记录列表
	TotalCount  int64          `json:"totalCount" example:"128"` // 总记录数
	PageSize    int            `json:"pageSize" example:"10"`    // 每页大小
	CurrentPage int            `json:"currentPage" example:"1"`  // 当前页码
	TotalPages  int            `json:"totalPages" example:"13"`  // 总页数
}
