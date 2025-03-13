package router

import (
	"github.com/HUAHUAI23/simple-waf/server/controller"
	"github.com/HUAHUAI23/simple-waf/server/middleware"
	"github.com/HUAHUAI23/simple-waf/server/model"
	"github.com/HUAHUAI23/simple-waf/server/repository"
	"github.com/HUAHUAI23/simple-waf/server/service"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

// Setup configures all the routes for the application
func Setup(route *gin.Engine, db *mongo.Database) {
	// 基础中间件
	route.Use(middleware.RequestID())
	route.Use(middleware.Logger())
	route.Use(middleware.Cors())
	route.Use(gin.CustomRecovery(middleware.CustomErrorHandler))

	// 创建仓库
	userRepo := repository.NewUserRepository(db)
	roleRepo := repository.NewRoleRepository(db)

	// 创建服务
	authService := service.NewAuthService(userRepo, roleRepo)

	// 创建控制器
	authController := controller.NewAuthController(authService)

	// 将仓库添加到上下文中，供中间件使用
	route.Use(func(c *gin.Context) {
		c.Set("userRepo", userRepo)
		c.Set("roleRepo", roleRepo)
		c.Next()
	})

	// 健康检查端点
	route.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// API v1 路由
	api := route.Group("/api/v1")

	// 认证相关路由 - 不需要权限检查
	auth := api.Group("/auth")
	{
		auth.POST("/login", authController.Login)

		// 需要认证的路由
		authRequired := auth.Group("")
		authRequired.Use(middleware.JWTAuth())
		{
			// 密码重置接口 - 任何已认证用户都可访问
			authRequired.POST("/reset-password", authController.ResetPassword)

			// 需要密码重置检查的路由
			passwordChecked := authRequired.Group("")
			passwordChecked.Use(middleware.PasswordResetRequired())
			{
				// 获取个人信息 - 任何已认证用户都可访问
				passwordChecked.GET("/me", authController.GetUserInfo)
			}
		}
	}

	// 需要认证和密码重置检查的API路由
	authenticated := api.Group("")
	authenticated.Use(middleware.JWTAuth())
	authenticated.Use(middleware.PasswordResetRequired())

	// 用户管理模块
	userRoutes := authenticated.Group("/users")
	{
		// 创建用户 - 需要user:create权限
		userRoutes.POST("", middleware.HasPermission(model.PermUserCreate), authController.CreateUser)
		// 获取用户列表 - 需要user:read权限
		userRoutes.GET("", middleware.HasPermission(model.PermUserRead), authController.GetUsers)
		// 更新用户 - 需要user:update权限
		userRoutes.PUT("/:id", middleware.HasPermission(model.PermUserUpdate), authController.UpdateUser)
		// 删除用户 - 需要user:delete权限
		userRoutes.DELETE("/:id", middleware.HasPermission(model.PermUserDelete), authController.DeleteUser)
	}

	// 站点管理模块
	siteRoutes := authenticated.Group("/sites")
	{
		// 创建站点 - 需要site:create权限
		siteRoutes.POST("", middleware.HasPermission(model.PermSiteCreate), nil)
		// 获取站点列表 - 需要site:read权限
		siteRoutes.GET("", middleware.HasPermission(model.PermSiteRead), nil)
		// 获取单个站点 - 需要site:read权限
		siteRoutes.GET("/:id", middleware.HasPermission(model.PermSiteRead), nil)
		// 更新站点 - 需要site:update权限
		siteRoutes.PUT("/:id", middleware.HasPermission(model.PermSiteUpdate), nil)
		// 删除站点 - 需要site:delete权限
		siteRoutes.DELETE("/:id", middleware.HasPermission(model.PermSiteDelete), nil)
	}

	// 配置管理模块
	configRoutes := authenticated.Group("/config")
	{
		// 获取配置 - 需要config:read权限
		configRoutes.GET("", middleware.HasPermission(model.PermConfigRead), nil)
		// 更新配置 - 需要config:update权限
		configRoutes.PUT("", middleware.HasPermission(model.PermConfigUpdate), nil)
	}

	// 审计日志模块
	auditRoutes := authenticated.Group("/audit")
	{
		// 获取审计日志 - 需要audit:read权限
		auditRoutes.GET("", middleware.HasPermission(model.PermAuditRead), nil)
	}

	// 系统管理模块
	systemRoutes := authenticated.Group("/system")
	{
		// 获取系统状态 - 需要system:status权限
		systemRoutes.GET("/status", middleware.HasPermission(model.PermSystemStatus), nil)
		// 重启系统 - 需要system:restart权限
		systemRoutes.POST("/restart", middleware.HasPermission(model.PermSystemRestart), nil)
	}
}
