import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { AttackDetailData } from "@/types/waf"

interface AttackDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: AttackDetailData | null
}

export function AttackDetailDialog({ open, onOpenChange, data }: AttackDetailDialogProps) {
  const { t } = useTranslation()
  const [hasCopiedPayload, setHasCopiedPayload] = useState(false)
  const [hasCopiedCurl, setHasCopiedCurl] = useState(false)

  if (!data) return null

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(data.payload)
    setHasCopiedPayload(true)
    setTimeout(() => setHasCopiedPayload(false), 2000)
  }

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(`curl ${data.target}`)
    setHasCopiedCurl(true)
    setTimeout(() => setHasCopiedCurl(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl [&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="px-2 py-1 text-sm bg-destructive text-destructive-foreground rounded">
              {data.message}
            </span>
            <span className="text-sm font-normal truncate">{data.target}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('attack.ip')}</span>
            <span>{data.clientIpAddress}</span>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('attack.payload')}</span>
            <div className="flex flex-col gap-2">
              <span>URLPATH</span>
              <Card className="p-2 bg-muted">
                <div className="flex items-center justify-between">
                  <code className="text-sm break-all overflow-hidden">{data.payload}</code>
                  <Button variant="ghost" size="icon" onClick={handleCopyPayload}>
                    {hasCopiedPayload ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('protect.module')}</span>
            <div className="flex items-center gap-2">
              <span>{t('sql.injection.detect')}</span>
              <span className="px-2 py-1 text-sm bg-primary text-primary-foreground rounded">
                {t('system.rule')} #{data.ruleId}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('attack.time')}</span>
            <span>{data.createdAt}</span>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('logs')}</span>
            <Card className="p-2 bg-black text-green-400">
              <pre className="text-xs whitespace-pre-wrap break-words overflow-auto max-h-60">
                {data.logs}
              </pre>
            </Card>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('request')}</span>
            <Card className="p-2 bg-muted">
              <pre className="text-xs whitespace-pre-wrap break-words overflow-auto max-h-60">
                {data.request}
              </pre>
            </Card>
          </div>

          {data.response && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <span className="text-muted-foreground">{t('response')}</span>
              <Card className="p-2 bg-muted">
                <pre className="text-xs whitespace-pre-wrap break-words overflow-auto max-h-60">
                  {data.response}
                </pre>
              </Card>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopyCurl}
              className="flex items-center gap-2"
            >
              {hasCopiedCurl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {t('copy.curl')}
            </Button>
            <select className="px-2 py-1 text-sm border rounded">
              <option>UTF-8</option>
            </select>
          </div>
          <Button variant="destructive" size="sm" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 