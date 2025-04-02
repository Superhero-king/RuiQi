import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HelpCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ApiError } from "@/api/index"
import { getErrorType, ErrorType } from "./errorTypes"
import { errorConfigs } from "./errorConfig"

interface AdvancedErrorDisplayProps {
    /** 错误对象 */
    error: unknown
    /** 重试回调函数 */
    onRetry?: () => void
    /** 额外的CSS类名 */
    className?: string
}

/**
 * 高级错误展示组件
 */
export const AdvancedErrorDisplay = ({
    error,
    onRetry,
    className
}: AdvancedErrorDisplayProps) => {
    const [showDetails, setShowDetails] = useState(false)

    // 处理错误信息
    const isApiError = error instanceof Error && error.name === 'ApiError'
    const errorMessage = error instanceof Error ? error.message : '加载数据时发生错误'
    const apiError = isApiError ? (error as ApiError) : undefined
    const errorCode = apiError?.code || (error instanceof Error && 'status' in error ? (error as unknown as { status: number }).status : undefined)
    const errorType = getErrorType(error)
    const requestId = apiError?.requestId
    const errorDetail = apiError?.errorDetail

    // 获取错误配置
    const { icon, title, description } = errorConfigs[errorType]
    const finalDescription = errorType === ErrorType.CLIENT || errorType === ErrorType.VALIDATION
        ? errorMessage || description
        : description

    /**
     * 格式化错误详情对象
     * @param detail - 错误详情
     * @returns 格式化后的错误详情字符串
     */
    const formatErrorDetail = (detail: unknown): string | null => {
        if (!detail) return null

        try {
            if (typeof detail === 'string') {
                // 尝试解析JSON字符串
                try {
                    const parsed = JSON.parse(detail)
                    return JSON.stringify(parsed, null, 2)
                } catch {
                    // 如果不是JSON，直接返回字符串
                    return detail
                }
            } else if (typeof detail === 'object') {
                return JSON.stringify(detail, null, 2)
            }

            return String(detail)
        } catch {
            return '无法解析错误详情'
        }
    }

    const formattedErrorDetail = formatErrorDetail(errorDetail)

    return (
        <Alert variant="destructive" className={cn("mx-auto my-6 max-w-xl", className)}>
            {icon}
            <AlertTitle className="font-medium mt-0">{title}</AlertTitle>
            <AlertDescription className="mt-2 flex flex-col gap-4">
                <p className="text-sm">{finalDescription}</p>

                <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                    <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 text-xs flex items-center gap-1 hover:bg-red-50"
                            >
                                <HelpCircle className="h-3 w-3" />
                                {showDetails ? '隐藏详情' : '查看详情'}
                            </Button>
                        </CollapsibleTrigger>

                        {onRetry && errorType !== ErrorType.UNAUTHORIZED && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onRetry}
                                className="flex items-center gap-2 text-xs border-red-300 hover:bg-red-50 hover:text-red-600"
                            >
                                <RefreshCw className="h-3 w-3" />
                                重试
                            </Button>
                        )}
                    </div>

                    <CollapsibleContent>
                        <div className="mt-3 p-3 bg-red-50 rounded text-xs font-mono overflow-auto">
                            <p>错误信息: {errorMessage}</p>
                            {errorCode && <p className="mt-1">错误代码: {errorCode}</p>}
                            {requestId && <p className="mt-1">请求ID: {requestId}</p>}
                            {formattedErrorDetail && (
                                <div className="mt-1">
                                    <p>错误详情:</p>
                                    <pre className="mt-1 p-2 bg-red-100 rounded overflow-x-auto">
                                        {formattedErrorDetail}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </AlertDescription>
        </Alert>
    )
}