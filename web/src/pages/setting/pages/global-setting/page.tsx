import { EditableField } from "@/components/common/editable-field"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

export default function GlobalSettingPage() {
  const [engineStatus, setEngineStatus] = useState(true)
  const [port, setPort] = useState("2342")
  const [certPath, setCertPath] = useState("/home/ubuntu/cert")
  const [certKeyPath, setCertKeyPath] = useState("/home/ubuntu/cert")
  const [panelPath, setPanelPath] = useState("/home/ubuntu/cert")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-zinc-600">通用设置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-900">引擎状态</span>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">{engineStatus ? "已启动" : "已停止"}</span>
              <Switch 
                checked={engineStatus} 
                onCheckedChange={setEngineStatus} 
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-900">面板监听端口</span>
            <EditableField 
              value={port} 
              onChange={setPort}
              label="设置面板监听端口"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-900">面板证书公钥文件路径</span>
            <EditableField 
              value={certPath} 
              onChange={setCertPath}
              label="设置面板证书公钥文件路径"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-900">面板证书密钥文件路径</span>
            <EditableField 
              value={certKeyPath} 
              onChange={setCertKeyPath}
              label="设置面板证书密钥文件路径"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium text-zinc-900">面板路径</span>
            <EditableField 
              value={panelPath} 
              onChange={setPanelPath}
              label="设置面板路径"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-zinc-600">日志设置</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 日志设置内容 */}
        </CardContent>
      </Card>
    </div>
  )
}