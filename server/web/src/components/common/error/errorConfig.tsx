import {
    AlertCircle,
    WifiOff,
    Clock,
    ShieldAlert,
    ServerOff,
    Bug,
    Ban,
    FileWarning
} from "lucide-react"
import { ErrorType, ErrorTypeValue } from './errorTypes'
import { ReactElement } from 'react'

// 错误配置类型
export interface ErrorConfig {
    icon: ReactElement
    title: string
    description: string
}

// 错误配置映射
export const errorConfigs: Record<ErrorTypeValue, ErrorConfig> = {
    [ErrorType.NETWORK]: {
        icon: <WifiOff className="h-5 w-5" />,
      title: '网络连接错误',
        description: '无法连接到服务器，请检查您的网络连接。'
    },
    [ErrorType.TIMEOUT]: {
        icon: <Clock className="h-5 w-5" />,
      title: '请求超时',
        description: '服务器响应时间过长，请稍后重试。'
    },
    [ErrorType.FORBIDDEN]: {
        icon: <Ban className="h-5 w-5" />,
      title: '访问被拒绝',
        description: '您没有权限访问此资源。'
    },
    [ErrorType.UNAUTHORIZED]: {
        icon: <ShieldAlert className="h-5 w-5" />,
      title: '未授权访问',
        description: '您的登录状态已失效，请重新登录。'
    },
    [ErrorType.SERVER]: {
        icon: <ServerOff className="h-5 w-5" />,
      title: '服务器错误',
        description: '服务器暂时无法处理您的请求，请稍后重试。'
    },
    [ErrorType.CLIENT]: {
        icon: <FileWarning className="h-5 w-5" />,
      title: '请求错误',
        description: '请求参数或格式有误。'
    },
    [ErrorType.VALIDATION]: {
        icon: <Bug className="h-5 w-5" />,
      title: '数据验证失败',
        description: '提交的数据未通过验证。'
    },
    [ErrorType.UNKNOWN]: {
        icon: <AlertCircle className="h-5 w-5" />,
      title: '发生错误',
        description: '加载数据时发生未知错误。'
    }
}