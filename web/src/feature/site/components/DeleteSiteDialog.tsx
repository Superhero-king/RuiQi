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
import { useDeleteSite } from "../hooks/useSites"

interface DeleteSiteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    siteId: string | null
}

export function DeleteSiteDialog({
    open,
    onOpenChange,
    siteId
}: DeleteSiteDialogProps) {
    const { deleteSite, isLoading } = useDeleteSite()

    const handleDelete = () => {
        if (!siteId) return

        deleteSite(siteId, {
            onSettled: () => {
                onOpenChange(false)
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>确认删除</AlertDialogTitle>
                    <AlertDialogDescription>
                        您确定要删除此站点吗？此操作无法撤销，可能会影响当前正在使用此站点的服务。
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        {isLoading ? '删除中...' : '删除'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
} 