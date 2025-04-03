import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check, AlertTriangle, Shield, ArrowUpRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttackDetailData } from "@/types/log"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatePresence, motion } from "motion/react"
import { 
  dialogEnterExitAnimation,
  dialogContentAnimation,
  dialogContentItemAnimation
} from "@/components/ui/animations/dialog-animations"

interface AttackDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: AttackDetailData | null
}

export function AttackDetailDialog({ open, onOpenChange, data }: AttackDetailDialogProps) {
    const [copyState, setCopyState] = useState<{ [key: string]: boolean }>({})
    const [encoding, setEncoding] = useState("UTF-8")

    const handleCopy = (text: string, key: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyState(prev => ({ ...prev, [key]: true }))
            setTimeout(() => setCopyState(prev => ({ ...prev, [key]: false })), 2000)
        })
    }

    if (!data) return null

    // 构建curl命令
    const curlCommand = `curl -X GET "${data.target}"`

    // 为了演示，假设规则ID > 1000 的是高危规则
    const isHighRisk = data.ruleId > 1000

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open && (
                    <motion.div {...dialogEnterExitAnimation}>
                        <DialogContent className="sm:max-w-[90vw] lg:max-w-[75vw] xl:max-w-[65vw] max-h-[90vh] w-full p-0 gap-0 overflow-hidden shadow-xl">
                            <motion.div {...dialogContentAnimation}>
                                <DialogHeader className="px-6 py-4 border-b">
                                    <motion.div {...dialogContentItemAnimation}>
                                        <div className="flex items-center gap-2">
                                            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                                {isHighRisk && (
                                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                                )}
                                                攻击日志详情
                                            </DialogTitle>
                                            {isHighRisk && (
                                                <Badge variant="destructive" className="ml-2">高危攻击</Badge>
                                            )}
                                        </div>
                                    </motion.div>
                                </DialogHeader>

                                <ScrollArea className="px-6 py-4 h-[calc(90vh-6rem)]">
                                    <div className="space-y-6 pr-4">
                                        {/* 攻击概述卡片 */}
                                        <motion.div {...dialogContentItemAnimation}>
                                            <Card className={`p-6 ${isHighRisk ? 'border-destructive/20 bg-destructive/5' : ''}`}>
                                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                                    <Shield className="h-5 w-5" />
                                                    攻击概述
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">攻击目标</span>
                                                            <div className="font-medium truncate">{data.target}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">攻击信息</span>
                                                            <div className="font-medium">{data.message}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">请求 ID</span>
                                                            <div className="font-mono text-sm flex items-center gap-1">
                                                                {data.requestId}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={() => handleCopy(data.requestId, 'requestId')}
                                                                >
                                                                    {copyState['requestId'] ?
                                                                        <Check className="h-3 w-3" /> :
                                                                        <Copy className="h-3 w-3" />
                                                                    }
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">规则 ID</span>
                                                            <div className="font-medium flex items-center gap-2">
                                                                {data.ruleId}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                >
                                                                    查看规则详情
                                                                    <ArrowUpRight className="h-3 w-3 ml-1" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">攻击时间</span>
                                                            <div className="font-medium">
                                                                {format(new Date(data.createdAt), "yyyy-MM-dd HH:mm:ss")}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>

                                        {/* 载荷信息 */}
                                        <motion.div {...dialogContentItemAnimation}>
                                            <Card className="p-6">
                                                <h3 className="text-lg font-semibold mb-4">检测到的载荷</h3>
                                                <div className="bg-primary/5 border border-primary/20 rounded-md p-4">
                                                    <div className="flex items-center justify-between">
                                                        <code className="text-sm break-all font-mono">{data.payload}</code>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleCopy(data.payload, 'payload')}
                                                        >
                                                            {copyState['payload'] ?
                                                                <Check className="h-4 w-4" /> :
                                                                <Copy className="h-4 w-4" />
                                                            }
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>

                                        {/* 来源和目标信息 */}
                                        <motion.div {...dialogContentItemAnimation}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* 攻击来源 */}
                                                <Card className="p-6">
                                                    <h3 className="text-lg font-semibold mb-4">攻击来源</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">来源 IP</span>
                                                            <div className="font-medium flex items-center justify-between">
                                                                <span className="break-all font-mono">{data.srcIp}</span>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="h-7 text-xs"
                                                                >
                                                                    拦截此 IP
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">来源端口</span>
                                                            <div className="font-medium font-mono">{data.srcPort}</div>
                                                        </div>
                                                    </div>
                                                </Card>

                                                {/* 目标信息 */}
                                                <Card className="p-6">
                                                    <h3 className="text-lg font-semibold mb-4">目标信息</h3>
                                                    <div className="space-y-4">
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">目标 IP</span>
                                                            <div className="font-medium font-mono break-all">{data.dstIp}</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-muted-foreground text-sm block mb-1">目标端口</span>
                                                            <div className="font-medium font-mono">{data.dstPort}</div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        </motion.div>

                                        {/* 请求详情选项卡 */}
                                        <motion.div {...dialogContentItemAnimation}>
                                            <Card className="p-6">
                                                <Tabs defaultValue="request" className="w-full">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-lg font-semibold">技术详情</h3>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleCopy(curlCommand, 'curl')}
                                                                className="flex items-center gap-1 h-8"
                                                            >
                                                                {copyState['curl'] ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                                                复制 cURL
                                                            </Button>

                                                            <Select value={encoding} onValueChange={setEncoding}>
                                                                <SelectTrigger className="w-[110px] h-8">
                                                                    <SelectValue placeholder="编码" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="UTF-8">UTF-8</SelectItem>
                                                                    <SelectItem value="GBK">GBK</SelectItem>
                                                                    <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>

                                                    <TabsList className="mb-3 w-full">
                                                        <TabsTrigger value="request" className="flex-1">请求</TabsTrigger>
                                                        <TabsTrigger value="response" className="flex-1">响应</TabsTrigger>
                                                        <TabsTrigger value="logs" className="flex-1">日志</TabsTrigger>
                                                    </TabsList>

                                                    <div className="border rounded-md overflow-hidden bg-muted/20">
                                                        <TabsContent value="request" className="m-0 data-[state=active]:block">
                                                            <div className="flex justify-end p-2 bg-muted/30 border-b">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7"
                                                                    onClick={() => handleCopy(data.request, 'requestCopy')}
                                                                >
                                                                    {copyState['requestCopy'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                                                    复制全部
                                                                </Button>
                                                            </div>
                                                            <div className="relative">
                                                                <pre className="p-4 text-sm overflow-x-auto overflow-y-auto max-h-[300px] whitespace-pre-wrap font-mono">
                                                                    <code>{data.request}</code>
                                                                </pre>
                                                            </div>
                                                        </TabsContent>

                                                        <TabsContent value="response" className="m-0 data-[state=active]:block">
                                                            <div className="flex justify-end p-2 bg-muted/30 border-b">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7"
                                                                    onClick={() => handleCopy(data.response, 'responseCopy')}
                                                                >
                                                                    {copyState['responseCopy'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                                                    复制全部
                                                                </Button>
                                                            </div>
                                                            <div className="relative">
                                                                <pre className="p-4 text-sm overflow-x-auto overflow-y-auto max-h-[300px] whitespace-pre-wrap font-mono">
                                                                    <code>{data.response}</code>
                                                                </pre>
                                                            </div>
                                                        </TabsContent>

                                                        <TabsContent value="logs" className="m-0 data-[state=active]:block">
                                                            <div className="flex justify-end p-2 bg-muted/30 border-b">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7"
                                                                    onClick={() => handleCopy(data.logs, 'logsCopy')}
                                                                >
                                                                    {copyState['logsCopy'] ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                                                    复制全部
                                                                </Button>
                                                            </div>
                                                            <div className="relative">
                                                                <pre className="p-4 text-sm overflow-x-auto overflow-y-auto max-h-[300px] whitespace-pre-wrap font-mono">
                                                                    <code>{data.logs}</code>
                                                                </pre>
                                                            </div>
                                                        </TabsContent>
                                                    </div>
                                                </Tabs>
                                            </Card>
                                        </motion.div>
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        </DialogContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </Dialog>
    )
} 