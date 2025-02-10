import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

interface AttackDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: {
    url: string
    ip: string
    payload: string
    type: string
    timestamp: string
    id: string
    location: string
  }
}

export function AttackDetailDialog({ open, onOpenChange, data }: AttackDetailDialogProps) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl [&>button:last-child]:hidden">
      {/* <DialogContent className="max-w-3xl"> */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="px-2 py-1 text-sm bg-destructive text-destructive-foreground rounded">
              {data.type}
            </span>
            <span className="text-sm font-normal">{data.url}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('attack.ip')}</span>
            <span>{data.ip}</span>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('attack.payload')}</span>
            <div className="flex items-center gap-2">
              <span>URLPATH</span>
              <Card className="p-2 bg-muted">
                <div className="flex items-center justify-between">
                  <code className="text-sm">{data.payload}</code>
                  <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(data.payload)}>
                    <Copy className="h-4 w-4" />
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
                {t('system.rule')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">{t('attack.time')}</span>
            <span>{data.timestamp}</span>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-2">
            <span className="text-muted-foreground">ID</span>
            <span>{data.id}</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(`curl ${data.url}`)}>
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
    </Dialog >
  )
} 