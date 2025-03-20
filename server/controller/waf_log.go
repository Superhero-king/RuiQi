package controller

import (
	"time"

	"github.com/HUAHUAI23/simple-waf/server/dto"
	"github.com/HUAHUAI23/simple-waf/server/service"
	"github.com/HUAHUAI23/simple-waf/server/utils/response"
	"github.com/gin-gonic/gin"
)

type WAFLogController interface {
	GetAttackEvents(ctx *gin.Context)
	GetAttackLogs(ctx *gin.Context)
}

type WAFLogControllerImpl struct {
	wafLogService service.WAFLogService
}

func NewWAFLogController(wafLogService service.WAFLogService) WAFLogController {
	return &WAFLogControllerImpl{
		wafLogService: wafLogService,
	}
}

// GetAttackEvents godoc
//
//	@Summary		Get aggregated attack events
//	@Description	Retrieve attack events aggregated by client IP and domain
//	@Tags			WAF Logs
//	@Accept			json
//	@Produce		json
//	@Param			clientIpAddress	query		string												false	"Client IP Address"
//	@Param			domain			query		string												false	"Domain name"
//	@Param			port			query		integer												false	"Port number"
//	@Param			startTime		query		string												false	"Start time (RFC3339 format)"
//	@Param			endTime			query		string												false	"End time (RFC3339 format)"
//	@Param			page			query		integer												false	"Page number (default: 1)"
//	@Param			pageSize		query		integer												false	"Page size (default: 10)"
//	@Success		200				{object}	model.SuccessResponse{data=dto.AttackEventResponse}	"Successful response"
//	@Failure		400				{object}	model.ErrResponse									"Bad request"
//	@Failure		500				{object}	model.ErrResponseDontShowError						"Internal server error"
//	@Router			/api/v1/waf/logs/events [get]
func (c *WAFLogControllerImpl) GetAttackEvents(ctx *gin.Context) {
	var req dto.AttackEventRequset

	// 使用ShouldBindQuery绑定查询参数
	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.BadRequest(ctx, err, true)
		return
	}

	// 设置默认值
	if req.StartTime.IsZero() {
		// 默认: 24小时前
		req.StartTime = time.Now().Add(-24 * time.Hour)
	}

	if req.EndTime.IsZero() {
		// 默认: 当前时间
		req.EndTime = time.Now()
	}

	// 设置默认分页参数
	page := req.Page
	if page <= 0 {
		page = 1
	}

	pageSize := req.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}

	// 调用服务
	result, err := c.wafLogService.GetAttackEvents(ctx, req, page, pageSize)
	if err != nil {
		response.InternalServerError(ctx, err, false)
		return
	}

	response.Success(ctx, "获取攻击事件成功", result)
}

// GetAttackLogs godoc
//
//	@Summary		Get individual attack logs
//	@Description	Retrieve detailed attack logs with filtering and pagination
//	@Tags			WAF Logs
//	@Accept			json
//	@Produce		json
//	@Param			ruleId			query		integer												false	"Rule ID"
//	@Param			clientIpAddress	query		string												false	"Client IP Address"
//	@Param			domain			query		string												false	"Domain name"
//	@Param			port			query		integer												false	"Port number"
//	@Param			startTime		query		string												false	"Start time (RFC3339 format)"
//	@Param			endTime			query		string												false	"End time (RFC3339 format)"
//	@Param			page			query		integer												false	"Page number (default: 1)"
//	@Param			pageSize		query		integer												false	"Page size (default: 10)"
//	@Success		200				{object}	model.SuccessResponse{data=dto.AttackLogResponse}	"Successful response"
//	@Failure		400				{object}	model.ErrResponse									"Bad request"
//	@Failure		500				{object}	model.ErrResponseDontShowError						"Internal server error"
//	@Router			/api/v1/waf/logs [get]
func (c *WAFLogControllerImpl) GetAttackLogs(ctx *gin.Context) {
	var req dto.AttackLogRequest

	// 使用ShouldBindQuery绑定查询参数
	if err := ctx.ShouldBindQuery(&req); err != nil {
		response.BadRequest(ctx, err, true)
		return
	}

	// 设置默认值
	if req.StartTime.IsZero() {
		// 默认: 24小时前
		req.StartTime = time.Now().Add(-24 * time.Hour)
	}

	if req.EndTime.IsZero() {
		// 默认: 当前时间
		req.EndTime = time.Now()
	}

	// 设置默认分页参数
	page := req.Page
	if page <= 0 {
		page = 1
	}

	pageSize := req.PageSize
	if pageSize <= 0 {
		pageSize = 10
	}

	// 调用服务
	result, err := c.wafLogService.GetAttackLogs(ctx, req, page, pageSize)
	if err != nil {
		response.InternalServerError(ctx, err, false)
		return
	}

	response.Success(ctx, "获取攻击日志成功", result)
}
