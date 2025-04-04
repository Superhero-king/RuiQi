import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteCertificate } from '../hooks/useCertificate'
import { AnimatePresence, motion } from "motion/react"
import { 
    dialogEnterExitAnimation, 
    dialogContentAnimation, 
    dialogHeaderAnimation,
    dialogContentItemAnimation
} from '@/components/ui/animation/dialog-animation'

interface DeleteCertificateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    certificateId: string | null
    onDeleted?: () => void
}

export function DeleteCertificateDialog({
    open,
    onOpenChange,
    certificateId,
    onDeleted
}: DeleteCertificateDialogProps) {
    // 删除证书钩子
    const { deleteCertificate, isLoading } = useDeleteCertificate()

    // 处理删除证书
    const handleDeleteCertificate = () => {
        if (!certificateId) return

        deleteCertificate(certificateId, {
            onSettled: () => {
                onOpenChange(false)
                onDeleted?.()
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AnimatePresence mode="wait">
                {open && (
                    <motion.div {...dialogEnterExitAnimation}>
                        <AlertDialogContent className="p-0 overflow-hidden">
                            <motion.div {...dialogContentAnimation}>
                                <motion.div {...dialogHeaderAnimation}>
                                    <AlertDialogHeader className="p-6 pb-3">
                                        <AlertDialogTitle className="text-xl">确认删除</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            您确定要删除此证书吗？此操作无法撤销。
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                </motion.div>
                                
                                <motion.div 
                                    {...dialogContentItemAnimation}
                                    className="px-6 pb-6"
                                >
                                    <AlertDialogFooter className="mt-2 flex justify-end space-x-2">
                                        <AlertDialogCancel>取消</AlertDialogCancel>
                                        <AlertDialogAction 
                                            onClick={handleDeleteCertificate} 
                                            disabled={isLoading}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            {isLoading ? '删除中...' : '删除'}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </motion.div>
                            </motion.div>
                        </AlertDialogContent>
                    </motion.div>
                )}
            </AnimatePresence>
        </AlertDialog>
    )
}
