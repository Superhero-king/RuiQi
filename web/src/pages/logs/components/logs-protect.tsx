import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MoreHorizontal } from "lucide-react"

const logItems = [
    {
        id: 1,
        url: "https://demo.waf-ce.chaitin.cn:10084/hello.html?payload",
        status: "已防护",
        type: "SQL注入",
        ip: "125.118.24.13",
        location: "浙江-杭州",
        timestamp: "2024-12-25",
        time: "21:58:56"
    }
]

export function LogsProtect() {
    return (
        <Card className="border-none shadow-none">
            <div className="p-0">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm">
                            全选导出
                        </Button>
                        <Button variant="outline" size="sm">
                            筛选
                        </Button>
                        <div className="h-6 border-l mx-2" />
                        <input
                            type="text"
                            placeholder="域名"
                            className="px-3 py-1 text-sm border rounded"
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        刷新
                    </Button>
                </div>

                <div className="space-y-4">
                    {logItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <input type="checkbox" className="h-4 w-4" />
                            <span className="px-3 py-1 text-xs font-medium bg-zinc-900 text-white rounded">
                                {item.status}
                            </span>
                            <span className="flex-1 text-muted-foreground text-sm">{item.url}</span>
                            <span className="text-sm text-muted-foreground">{item.type}</span>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-sm text-muted-foreground">{item.ip}</span>
                                <span className="text-sm text-muted-foreground">{item.location}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-sm text-muted-foreground">{item.timestamp}</span>
                                <span className="text-sm text-muted-foreground">{item.time}</span>
                            </div>
                            <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between mt-6">
                    <span className="text-sm text-muted-foreground">
                        0 of 5 row(s) selected.
                    </span>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">列每页</span>
                            <Button variant="outline" size="sm">12</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">上一页</Button>
                            <Button variant="outline" size="sm">下一页</Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm">跳至</span>
                            <input
                                type="text"
                                className="w-12 px-2 py-1 text-sm border rounded"
                            />
                            <span className="text-sm">/ 120 页</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
} 