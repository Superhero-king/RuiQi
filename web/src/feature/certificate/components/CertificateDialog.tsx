import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { CertificateForm } from './CertificateForm'
import { Certificate } from '@/types/certificates'

interface CertificateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    mode: 'create' | 'update'
    certificate?: Certificate | null // 仅在编辑模式下需要
}

export function CertificateDialog({
    open,
    onOpenChange,
    mode = 'create',
    certificate = null
}: CertificateDialogProps) {
    // 根据模式确定标题和描述
    const title = mode === 'create' ? '创建新证书' : '更新证书'
    const description = mode === 'create' 
        ? '请填写证书信息并上传公钥和私钥文件，或直接粘贴内容。系统将自动解析证书信息。'
        : '编辑证书信息，修改后将自动保存。'
    
    // 根据模式准备表单默认值
    const defaultValues = mode === 'update' && certificate 
        ? {
            name: certificate.name,
            description: certificate.description,
            publicKey: certificate.publicKey,
            privateKey: certificate.privateKey,
            domains: certificate.domains,
            expireDate: certificate.expireDate,
            fingerPrint: certificate.fingerPrint,
            issuerName: certificate.issuerName
        }
        : {
            name: '',
            description: '',
            publicKey: '',
            privateKey: '',
        }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto hide-scrollbar animate-in fade-in-50 duration-300">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <CertificateForm 
                    mode={mode}
                    certificateId={certificate?.id}
                    defaultValues={defaultValues}
                    onSuccess={() => onOpenChange(false)} 
                />
            </DialogContent>
        </Dialog>
    )
} 