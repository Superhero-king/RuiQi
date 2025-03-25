import { useState, useRef, useEffect, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
} from '@tanstack/react-table'
import { useInfiniteQuery } from '@tanstack/react-query'
import { certificatesApi } from '@/api/certificate'
import { Certificate } from '@/types/certificates'
import { Button } from '@/components/ui/button'
import {
    MoreHorizontal, Plus, Trash2, RefreshCcw, Pencil
} from 'lucide-react'
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Card } from '@/components/ui/card'
import { CertificateDialog } from './CertificateDialog'
import { Loader2 } from 'lucide-react'
import { useDeleteCertificate } from '../hooks/useCertificates'
import { DataTable } from '@/components/table/data-table'

export function CertificateTable() {
    // 状态管理
    const [certificateDialogOpen, setCertificateDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedCertId, setSelectedCertId] = useState<string | null>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const [dialogMode, setDialogMode] = useState<'create' | 'update'>('create')
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

    // 删除证书钩子
    const { deleteCertificate, isLoading: isDeleting } = useDeleteCertificate()

    // 获取证书列表
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: ['certificates'],
        queryFn: ({ pageParam }) => certificatesApi.getCertificates(pageParam as number, 20),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.total > allPages.length * 20 ? allPages.length + 1 : undefined
        },
    })

    // 无限滚动实现
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries
                if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0, rootMargin: '200px 0px' }
        )

        const sentinel = sentinelRef.current
        if (sentinel) {
            observer.observe(sentinel)
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel)
            }
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    // 扁平化分页数据
    const flatData = useMemo(() =>
        data?.pages.flatMap(page => page.items) || [],
        [data]
    )

    // 处理删除证书
    const handleDeleteCertificate = () => {
        if (!selectedCertId) return

        deleteCertificate(selectedCertId, {
            onSettled: () => {
                setDeleteDialogOpen(false)
                setSelectedCertId(null)
            }
        })
    }

    // 打开删除对话框
    const openDeleteDialog = (id: string) => {
        setSelectedCertId(id)
        setDeleteDialogOpen(true)
    }

    // 打开创建证书对话框
    const openCreateDialog = () => {
        setDialogMode('create')
        setSelectedCertificate(null)
        setCertificateDialogOpen(true)
    }

    // 打开更新证书对话框
    const openUpdateDialog = (certificate: Certificate) => {
        setDialogMode('update')
        setSelectedCertificate(certificate)
        setCertificateDialogOpen(true)
    }

    // 助手函数：检查证书是否即将过期（30天内）
    const isExpiringSoon = (expireDate: string): boolean => {
        const expiryDate = new Date(expireDate)
        const now = new Date()
        const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
        return expiryDate.getTime() - now.getTime() < thirtyDaysInMs && expiryDate > now
    }

    // 助手函数：检查证书是否已过期
    const isExpired = (expireDate: string): boolean => {
        return new Date(expireDate) < new Date()
    }

    // 表格列定义
    const columns: ColumnDef<Certificate>[] = [
        {
            accessorKey: 'name',
            header: () => <div className="font-medium py-3.5">证书名称</div>,
            cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
        },
        {
            accessorKey: 'domains',
            header: () => <div className="font-medium py-3.5">域名</div>,
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1 max-w-xs">
                    {row.original.domains.map((domain, index) => (
                        <span key={index} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {domain}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            accessorKey: 'issuerAndExpiry',
            header: () => <div className="font-medium py-3.5">颁发机构与过期时间</div>,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{row.original.issuerName}</span>
                    <span className="text-xs text-muted-foreground">
                        过期时间: {new Date(row.original.expireDate).toLocaleDateString()}
                        {isExpiringSoon(row.original.expireDate) && (
                            <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                                即将过期
                            </span>
                        )}
                        {isExpired(row.original.expireDate) && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                                已过期
                            </span>
                        )}
                    </span>
                </div>
            ),
        },
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => openUpdateDialog(row.original)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => openDeleteDialog(row.original.id)}
                            className="text-red-600"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    // 初始化表格
    const table = useReactTable({
        data: flatData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <Card className="border-none shadow-none p-6">
                {/* 标题和操作按钮 */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">证书管理</h2>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="flex items-center gap-1"
                        >
                            <RefreshCcw className="h-3.5 w-3.5" />
                            刷新
                        </Button>
                        <Button
                            size="sm"
                            onClick={openCreateDialog}
                            className="flex items-center gap-1"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            添加证书
                        </Button>
                    </div>
                </div>

                {/* 表格 */}
                <DataTable table={table} columns={columns} isLoading={isLoading} style="border" />
                {/* 无限滚动监测元素 */}
                <div
                    ref={sentinelRef}
                    className="h-5 flex justify-center items-center mt-4"
                >
                    {isFetchingNextPage && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
            </Card>

            {/* 统一的证书对话框 */}
            <CertificateDialog
                open={certificateDialogOpen}
                onOpenChange={setCertificateDialogOpen}
                mode={dialogMode}
                certificate={selectedCertificate}
            />

            {/* 删除确认对话框 */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                            您确定要删除此证书吗？此操作无法撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteCertificate} disabled={isDeleting}>
                            {isDeleting ? '删除中...' : '删除'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}