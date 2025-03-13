package model

import (
	"time"

	"golang.org/x/crypto/bcrypt"
)

// 扩展用户模型，添加角色ID字段
type User struct {
	ID          string    `bson:"_id,omitempty" json:"id,omitempty"`
	Username    string    `bson:"username" json:"username"`
	Password    string    `bson:"password" json:"-"`                        // 密码不返回给客户端
	Role        string    `bson:"role" json:"role"`                         // 用户角色
	Permissions []string  `bson:"permissions" json:"permissions,omitempty"` // 额外权限
	NeedReset   bool      `bson:"needReset" json:"needReset"`               // 是否需要重置密码
	CreatedAt   time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time `bson:"updatedAt" json:"updatedAt"`
	LastLogin   time.Time `bson:"lastLogin" json:"lastLogin"`
}

// HashPassword 对密码进行哈希处理
func (u *User) HashPassword() error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword 验证密码是否正确
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// GetCollectionName 返回集合名称
func (u *User) GetCollectionName() string {
	return "user"
}

// UserLoginRequest 用户登录请求
type UserLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UserPasswordResetRequest 密码重置请求
type UserPasswordResetRequest struct {
	OldPassword string `json:"oldPassword" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required,min=6"`
}

// UserCreateRequest 创建用户请求（仅管理员可用）
type UserCreateRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=admin user"`
}

// UserUpdateRequest 更新用户请求
type UserUpdateRequest struct {
	Username  string `json:"username,omitempty" binding:"omitempty,min=3,max=20"`
	Password  string `json:"password,omitempty" binding:"omitempty,min=6"`
	Role      string `json:"role,omitempty" binding:"omitempty,oneof=admin auditor configurator user"`
	NeedReset *bool  `json:"needReset,omitempty"`
}
