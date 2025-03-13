package controller

import (
	"errors"
	"net/http"
	"time"

	"github.com/HUAHUAI23/simple-waf/server/internal/model"
	"github.com/HUAHUAI23/simple-waf/server/internal/service"
	"github.com/HUAHUAI23/simple-waf/server/internal/utils/response"
	"github.com/gin-gonic/gin"
)

// 为Swagger文档定义的响应结构体
// @Description API响应的标准格式
type SwaggerResponse struct {
	Code      int         `json:"code" example:"200"`                                                 // HTTP状态码
	Success   bool        `json:"success" example:"true"`                                             // 是否成功
	Message   string      `json:"message,omitempty" example:"操作成功"`                                   // 响应消息
	Data      interface{} `json:"data,omitempty"`                                                     // 响应数据
	Error     string      `json:"error,omitempty" example:"参数错误"`                                     // 错误信息(当success=false时)
	Timestamp time.Time   `json:"timestamp" example:"2023-01-01T12:00:00Z"`                           // 响应时间戳
	RequestID string      `json:"requestId,omitempty" example:"550e8400-e29b-41d4-a716-446655440000"` // 请求ID，用于跟踪
}

// AuthController 认证控制器
type AuthController interface {
	Login(ctx *gin.Context)
	ResetPassword(ctx *gin.Context)
	CreateUser(ctx *gin.Context)
	GetUsers(ctx *gin.Context)
	GetUserInfo(ctx *gin.Context)
	DeleteUser(ctx *gin.Context)
	UpdateUser(ctx *gin.Context)
}

type AuthControllerImpl struct {
	authService service.AuthService
}

// NewAuthController 创建认证控制器
func NewAuthController(authService service.AuthService) AuthController {
	return &AuthControllerImpl{
		authService: authService,
	}
}

// Login 用户登录
// @Summary 用户登录
// @Description 用户登录并获取JWT令牌
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body model.UserLoginRequest true "登录信息"
// @Success 200 {object} SwaggerResponse "登录成功"
// @Failure 400 {object} SwaggerResponse "请求参数错误"
// @Failure 401 {object} SwaggerResponse "用户名或密码错误"
// @Failure 500 {object} SwaggerResponse "服务器内部错误"
// @Router /auth/login [post]
func (c *AuthControllerImpl) Login(ctx *gin.Context) {
	var req model.UserLoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "无效的请求参数", err, false)
		return
	}

	// 登录
	token, user, err := c.authService.Login(ctx, req)
	if err != nil {
		if errors.Is(err, service.ErrUserNotFound) || errors.Is(err, service.ErrInvalidPassword) {
			response.Error(ctx, model.NewAPIError(http.StatusUnauthorized, "用户名或密码错误", err), false)
			return
		}
		response.InternalServerError(ctx, err, false)
		return
	}

	// 返回令牌和用户信息
	response.Success(ctx, "登录成功", gin.H{
		"token": token,
		"user":  user,
	})
}

// ResetPassword 重置密码
// @Summary 重置密码
// @Description 用户重置自己的密码
// @Tags 认证
// @Accept json
// @Produce json
// @Param request body model.UserPasswordResetRequest true "密码重置信息"
// @Security BearerAuth
// @Success 200 {object} SwaggerResponse "密码重置成功"
// @Failure 400 {object} SwaggerResponse "请求参数错误或原密码错误"
// @Failure 401 {object} SwaggerResponse "未授权访问"
// @Failure 500 {object} SwaggerResponse "服务器内部错误"
// @Router /auth/reset-password [post]
func (c *AuthControllerImpl) ResetPassword(ctx *gin.Context) {
	var req model.UserPasswordResetRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "无效的请求参数", err, false)
		return
	}

	// 从上下文中获取用户ID
	userID, exists := ctx.Get("userID")
	if !exists {
		response.Unauthorized(ctx, nil)
		return
	}

	// 重置密码
	err := c.authService.ResetPassword(ctx, userID.(string), req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidPassword) {
			response.Error(ctx, model.NewAPIError(http.StatusBadRequest, "原密码错误", err), false)
			return
		}
		response.InternalServerError(ctx, err, false)
		return
	}

	response.Success(ctx, "密码重置成功", nil)
}

// CreateUser 创建用户
// @Summary 创建新用户
// @Description 管理员创建新用户
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param request body model.UserCreateRequest true "用户创建信息"
// @Security BearerAuth
// @Success 200 {object} SwaggerResponse "用户创建成功"
// @Failure 400 {object} SwaggerResponse "请求参数错误"
// @Failure 401 {object} SwaggerResponse "未授权访问"
// @Failure 403 {object} SwaggerResponse "禁止访问"
// @Failure 409 {object} SwaggerResponse "用户名已存在"
// @Failure 500 {object} SwaggerResponse "服务器内部错误"
// @Router /users [post]
func (c *AuthControllerImpl) CreateUser(ctx *gin.Context) {
	var req model.UserCreateRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		response.BadRequest(ctx, "无效的请求参数", err, false)
		return
	}

	// 从上下文中获取管理员ID
	adminID, exists := ctx.Get("userID")
	if !exists {
		response.Unauthorized(ctx, nil)
		return
	}

	// 创建用户
	user, err := c.authService.CreateUser(ctx, adminID.(string), req)
	if err != nil {
		if errors.Is(err, service.ErrUserAlreadyExist) {
			response.Error(ctx, model.NewAPIError(http.StatusConflict, "用户名已存在", err), false)
			return
		} else if errors.Is(err, service.ErrForbidden) {
			response.Forbidden(ctx, err)
			return
		}
		response.InternalServerError(ctx, err, false)
		return
	}

	response.Success(ctx, "用户创建成功", user)
}

// GetUsers 获取所有用户
// @Summary 获取所有用户
// @Description 获取系统中所有用户的列表
// @Tags 用户管理
// @Produce json
// @Security BearerAuth
// @Success 200 {object} SwaggerResponse "获取用户列表成功"
// @Failure 401 {object} SwaggerResponse "未授权访问"
// @Failure 403 {object} SwaggerResponse "禁止访问"
// @Failure 500 {object} SwaggerResponse "服务器内部错误"
// @Router /users [get]
func (c *AuthControllerImpl) GetUsers(ctx *gin.Context) {
	// 获取所有用户
	users, err := c.authService.GetUsers(ctx)
	if err != nil {
		response.InternalServerError(ctx, err, false)
		return
	}

	response.Success(ctx, "获取用户列表成功", users)
}

// GetUserInfo 获取用户信息
// @Summary 获取当前用户信息
// @Description 获取当前登录用户的详细信息
// @Tags 认证
// @Produce json
// @Security BearerAuth
// @Success 200 {object} SwaggerResponse "获取用户信息成功"
// @Failure 401 {object} SwaggerResponse "未授权访问"
// @Router /auth/me [get]
func (c *AuthControllerImpl) GetUserInfo(ctx *gin.Context) {
	// 从上下文中获取用户信息
	userID, _ := ctx.Get("userID")
	username, _ := ctx.Get("username")
	userRole, _ := ctx.Get("userRole")
	needReset, _ := ctx.Get("needReset")

	response.Success(ctx, "获取用户信息成功", gin.H{
		"id":        userID,
		"username":  username,
		"role":      userRole,
		"needReset": needReset,
	})
}

// DeleteUser 删除用户
// @Summary 删除用户
// @Description 管理员删除指定用户
// @Tags 用户管理
// @Produce json
// @Param id path string true "用户ID"
// @Security BearerAuth
// @Success 200 {object} SwaggerResponse "用户删除成功"
// @Failure 401 {object} SwaggerResponse "未授权访问"
// @Failure 403 {object} SwaggerResponse "禁止访问"
// @Failure 404 {object} SwaggerResponse "用户不存在"
// @Failure 500 {object} SwaggerResponse "服务器内部错误"
// @Router /users/{id} [delete]
func (c *AuthControllerImpl) DeleteUser(ctx *gin.Context) {
	// 待实现
}

// UpdateUser 更新用户
// @Summary 更新用户信息
// @Description 管理员更新指定用户的信息
// @Tags 用户管理
// @Accept json
// @Produce json
// @Param id path string true "用户ID"
// @Param request body model.UserUpdateRequest true "用户更新信息"
// @Security BearerAuth
// @Success 200 {object} SwaggerResponse "用户更新成功"
// @Failure 400 {object} SwaggerResponse "请求参数错误"
// @Failure 401 {object} SwaggerResponse "未授权访问"
// @Failure 403 {object} SwaggerResponse "禁止访问"
// @Failure 404 {object} SwaggerResponse "用户不存在"
// @Failure 500 {object} SwaggerResponse "服务器内部错误"
// @Router /users/{id} [put]
func (c *AuthControllerImpl) UpdateUser(ctx *gin.Context) {
	// 待实现
}
