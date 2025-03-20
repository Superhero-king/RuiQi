// src/components/error-boundary.tsx
import { Component, ReactNode } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { AlertCircle } from 'lucide-react'

interface Props {
    children?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    render() {
        if (this.state.hasError) {
            return <ErrorDisplay error={this.state.error} />
        }

        return this.props.children
    }
}

interface ErrorDisplayProps {
    error?: Error
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
    // 如果在路由中使用，尝试获取路由错误
    try {
        const routeError = useRouteError()
        if (isRouteErrorResponse(routeError)) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <h1 className="text-2xl font-bold mb-2">错误 {routeError.status}</h1>
                    <p className="mb-4 text-gray-600">{routeError.statusText}</p>
                    <p className="text-sm text-gray-500">{routeError.data?.message || '发生了意外错误'}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                    >
                        返回首页
                    </button>
                </div>
            )
        }

        if (routeError instanceof Error) {
            error = routeError
        }
    } catch {
        // useRouteError 只能在路由上下文中使用
    }

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">发生了错误</h1>
            <p className="mb-4 text-gray-600">{error?.message || '应用程序遇到了意外问题'}</p>
            <p className="text-sm text-gray-500 max-w-md overflow-auto">
                {error?.stack?.split('\n').slice(0, 3).join('\n')}
            </p>
            <button
                onClick={() => window.location.href = '/'}
                className="mt-6 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
                返回首页
            </button>
        </div>
    )
}

// 用作路由错误元素的简单包装器
export function RouteErrorBoundary() {
    return <ErrorDisplay />
}