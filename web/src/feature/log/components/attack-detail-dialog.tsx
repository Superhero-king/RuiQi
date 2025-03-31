import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AttackDetailData } from "@/types/waf"
import { format } from "date-fns"

interface AttackDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    data: AttackDetailData | null
}

export function AttackDetailDialog({ open, onOpenChange, data }: AttackDetailDialogProps) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)
    const [encoding, setEncoding] = useState("UTF-8")

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        })
    }

    if (!data) return null

    // 构建curl命令
    const curlCommand = `curl -X GET "${data.target}"`

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="px-2 py-1 text-sm bg-destructive text-destructive-foreground rounded">
                            {data.message}
                        </span>
                        <span className="text-sm font-normal">{data.target}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* 第一部分：基本信息 */}
                    <Card className="p-4 space-y-3">
                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-muted-foreground">{t('attack.ip')}</span>
                            <span>{data.clientIpAddress}</span>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-muted-foreground">{t('attack.payload')}</span>
                            <div className="flex items-center gap-2">
                                <Card className="p-2 bg-muted flex-1">
                                    <div className="flex items-center justify-between">
                                        <code className="text-sm">{data.payload}</code>
                                        <Button variant="ghost" size="icon" onClick={() => handleCopy(data.payload)}>
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-muted-foreground">{t('attack.message')}</span>
                            <span>{data.message}</span>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-muted-foreground">Rule ID</span>
                            <span>{data.ruleId}</span>
                        </div>

                        <div className="grid grid-cols-[120px_1fr] gap-2">
                            <span className="text-muted-foreground">{t('attack.time')}</span>
                            <span>{format(new Date(data.createdAt), "yyyy-MM-dd HH:mm:ss")}</span>
                        </div>
                    </Card>

                    {/* 第二、三部分：tabs和内容 */}
                    <Tabs defaultValue="request" className="w-full">
                        <div className="flex justify-between items-center mb-2">
                            <TabsList>
                                <TabsTrigger value="request">{t('request')}</TabsTrigger>
                                <TabsTrigger value="response">{t('response')}</TabsTrigger>
                                <TabsTrigger value="logs">{t('logs')}</TabsTrigger>
                            </TabsList>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopy(curlCommand)}
                                    className="flex items-center gap-1"
                                >
                                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    {t('copy.curl')}
                                </Button>

                                <select
                                    className="px-2 py-1 text-sm border rounded"
                                    value={encoding}
                                    onChange={(e) => setEncoding(e.target.value)}
                                >
                                    <option value="UTF-8">UTF-8</option>
                                    <option value="GBK">GBK</option>
                                    <option value="ISO-8859-1">ISO-8859-1</option>
                                </select>
                            </div>
                        </div>

                        <div className="border rounded-md p-0 mt-2">
                            <TabsContent value="request" className="m-0">
                                <Card className="border-0 rounded-none shadow-none">
                                    <pre className="p-4 text-sm overflow-auto max-h-[400px]">
                                        <code>{data.request}</code>
                                    </pre>
                                </Card>
                            </TabsContent>

                            <TabsContent value="response" className="m-0">
                                <Card className="border-0 rounded-none shadow-none">
                                    <pre className="p-4 text-sm overflow-auto max-h-[400px]">
                                        <code>{data.response}</code>
                                    </pre>
                                </Card>
                            </TabsContent>

                            <TabsContent value="logs" className="m-0">
                                <Card className="border-0 rounded-none shadow-none">
                                    <pre className="p-4 text-sm overflow-auto max-h-[400px]">
                                        <code>{data.logs}</code>
                                    </pre>
                                </Card>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <div className="flex justify-end">
                    <Button onClick={() => onOpenChange(false)}>
                        {t('close')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 