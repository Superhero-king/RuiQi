import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
  } from '@/components/ui/dialog';
  import { SiteForm } from './SiteForm';
  import { Site } from '@/types/site';
  
  interface SiteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'create' | 'update';
    site?: Site | null; // 仅在编辑模式下需要
  }
  
  export function SiteDialog({
    open,
    onOpenChange,
    mode = 'create',
    site = null
  }: SiteDialogProps) {
    // 根据模式确定标题和描述
    const title = mode === 'create' ? '创建新站点' : '更新站点';
    const description = mode === 'create' 
      ? '请填写站点信息，包括基本信息、HTTPS设置、后端服务器和WAF设置。'
      : '编辑站点信息，修改后将自动保存。';
    
    // 根据模式准备表单默认值
    const defaultValues = mode === 'update' && site 
      ? {
          name: site.name,
          domain: site.domain,
          listenPort: site.listenPort,
          enableHTTPS: site.enableHTTPS,
          activeStatus: site.activeStatus,
          wafEnabled: site.wafEnabled,
          wafMode: site.wafMode,
          backend: site.backend,
          certificate: site.certificate,
        }
      : undefined;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto hide-scrollbar animate-in fade-in-50 duration-300">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
  
          <SiteForm 
            mode={mode}
            siteId={site?.id}
            defaultValues={defaultValues}
            onSuccess={() => onOpenChange(false)} 
          />
        </DialogContent>
      </Dialog>
    );
  } 