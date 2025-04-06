// src/feature/global-setting/components/EngineStatus.tsx
import { RunnerStatusResponse } from '@/types/runner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Play,
    Square,
    RefreshCw,
    X,
    RotateCw,
    CheckCircle,
    XCircle,
    Loader2,
    Activity
} from 'lucide-react'

interface EngineStatusProps {
    status?: RunnerStatusResponse
    isLoading: boolean
    onStart: () => void
    onStop: () => void
    onRestart: () => void
    onForceStop: () => void
    onReload: () => void
    isControlLoading: boolean
}

export function EngineStatus({
    status,
    isLoading,
    onStart,
    onStop,
    onRestart,
    onForceStop,
    onReload,
    isControlLoading
}: EngineStatusProps) {
    const isRunning = status?.isRunning || false

    return (
        <Card className="border-none shadow-none">
            <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">引擎状态</h3>
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <div className="text-sm font-medium">当前状态:</div>
                    {isLoading ? (
                        <Badge variant="outline" className="gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>加载中...</span>
                        </Badge>
                    ) : isRunning ? (
                        <Badge variant="outline" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>运行中</span>
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            <span>已停止</span>
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="default"
                        size="sm"
                        className="gap-1"
                        onClick={onStart}
                        disabled={isRunning || isLoading || isControlLoading}
                    >
                        {isControlLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Play className="h-4 w-4" />
                        )}
                        {isControlLoading ? "处理中..." : "启动"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={onStop}
                        disabled={!isRunning || isLoading || isControlLoading}
                    >
                        {isControlLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Square className="h-4 w-4" />
                        )}
                        {isControlLoading ? "处理中..." : "停止"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={onRestart}
                        disabled={!isRunning || isLoading || isControlLoading}
                    >
                        {isControlLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        {isControlLoading ? "处理中..." : "重启"}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-1"
                        onClick={onForceStop}
                        disabled={!isRunning || isLoading || isControlLoading}
                    >
                        {isControlLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <X className="h-4 w-4" />
                        )}
                        {isControlLoading ? "处理中..." : "强制停止"}
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={onReload}
                        disabled={!isRunning || isLoading || isControlLoading}
                    >
                        {isControlLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <RotateCw className="h-4 w-4" />
                        )}
                        {isControlLoading ? "处理中..." : "热重载"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}