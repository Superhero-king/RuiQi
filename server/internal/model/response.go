package model

import (
	"net/http"
	"time"
)

// APIResponse 是统一的API响应结构体
// @Description API响应的标准格式
type APIResponse struct {
	Code      int         `json:"code" example:"200"`                                                 // HTTP状态码
	Success   bool        `json:"success" example:"true"`                                             // 是否成功
	Message   string      `json:"message,omitempty" example:"操作成功"`                                   // 响应消息
	Data      interface{} `json:"data,omitempty"`                                                     // 响应数据
	Error     string      `json:"error,omitempty" example:"参数错误"`                                     // 错误信息(当success=false时)
	Timestamp time.Time   `json:"timestamp" example:"2023-01-01T12:00:00Z"`                           // 响应时间戳
	RequestID string      `json:"requestId,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"` // 请求ID，用于跟踪
}

// NewSuccessResponse 创建一个成功的响应
func NewSuccessResponse(message string, data interface{}) APIResponse {
	return APIResponse{
		Code:      http.StatusOK,
		Success:   true,
		Message:   message,
		Data:      data,
		Timestamp: time.Now(),
	}
}

// NewErrorResponse 创建一个错误响应
func NewErrorResponse(code int, message string, err error) APIResponse {
	errorMsg := ""
	if err != nil {
		errorMsg = err.Error()
	}

	return APIResponse{
		Code:      code,
		Success:   false,
		Message:   message,
		Error:     errorMsg,
		Timestamp: time.Now(),
	}
}

// APIError 定义API错误
// @Description API错误的标准格式
type APIError struct {
	Code    int    `json:"code" example:"400"`       // 错误码
	Message string `json:"message" example:"请求参数错误"` // 错误消息
	Err     error  `json:"-"`                        // 内部错误，不暴露给客户端
}

// Error 实现error接口
func (e *APIError) Error() string {
	if e.Err != nil {
		return e.Err.Error()
	}
	return e.Message
}

// NewAPIError 创建一个API错误
func NewAPIError(code int, message string, err error) *APIError {
	return &APIError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// 常用错误状态码
var (
	ErrBadRequest          = func(err error) *APIError { return NewAPIError(http.StatusBadRequest, "请求参数错误", err) }
	ErrUnauthorized        = func(err error) *APIError { return NewAPIError(http.StatusUnauthorized, "未授权访问", err) }
	ErrForbidden           = func(err error) *APIError { return NewAPIError(http.StatusForbidden, "禁止访问", err) }
	ErrNotFound            = func(err error) *APIError { return NewAPIError(http.StatusNotFound, "资源不存在", err) }
	ErrInternalServerError = func(err error) *APIError {
		return NewAPIError(http.StatusInternalServerError, "服务器内部错误", err)
	}
)
