import { useState, useEffect } from "react"
import { useLocation } from "react-router"
import { Card } from "@/components/ui/card"
import {
    ColumnDef,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable
} from "@tanstack/react-table"
import { DataTable } from "@/components/table/data-table"
import { DataTablePagination } from "@/components/table/pagination"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { AttackLogFilter } from "@/feature/log/components/attack-log-filter"
import { AttackLogQueryFormValues } from "@/validation/log"
import { WAFLog, AttackDetailData } from "@/types/log"
import { useAttackLogs } from "@/feature/log/hook/useAttackLogs"
import { format } from "date-fns"
import { AttackDetailDialog } from "@/feature/log/components/attack-detail-dialog"
import { Eye } from "lucide-react"

export default function LogsPage() {
    const { t } = useTranslation()
    const location = useLocation()

    const [queryParams, setQueryParams] = useState<AttackLogQueryFormValues>({
        page: 1,
        pageSize: 10
    })

    const [selectedLog, setSelectedLog] = useState<AttackDetailData | null>(null)
    const [detailDialogOpen, setDetailDialogOpen] = useState(false)

    // 从URL参数中获取查询条件
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const domain = params.get('domain')
        const srcIp = params.get('srcIp')

        if (domain || srcIp) {
            setQueryParams(prev => ({
                ...prev,
                domain: domain || undefined,
                srcIp: srcIp || undefined
            }))
        }
    }, [location.search])

    const { data, isLoading, isError } = useAttackLogs(queryParams)

    const handleFilter = (values: AttackLogQueryFormValues) => {
        setQueryParams(values)
    }

    const handlePageChange = (page: number) => {
        setQueryParams(prev => ({ ...prev, page }))
    }

    const handlePageSizeChange = (pageSize: number) => {
        setQueryParams(prev => ({ ...prev, page: 1, pageSize }))
    }

    const handleOpenDetail = (log: WAFLog) => {
        setSelectedLog({
            target: `${log.domain}:${log.dstPort}${log.uri}`,
            srcIp: log.srcIp,
            srcPort: log.srcPort,
            dstIp: log.dstIp,
            dstPort: log.dstPort,
            payload: log.payload,
            message: log.message,
            ruleId: log.ruleId,
            requestId: log.requestId,
            createdAt: log.createdAt,
            request: log.request,
            response: log.response,
            logs: log.logs.map(l => l.logRaw).join('\n\n')
        })
        setDetailDialogOpen(true)
    }

    const columns: ColumnDef<WAFLog>[] = [
        {
            header: t('target'),
            cell: ({ row }) => (
                <div className="max-w-[300px] truncate break-all">
                    {`${row.original.domain}:${row.original.dstPort}${row.original.uri}`}
                </div>
            )
        },
        {
            accessorKey: "srcIp",
            header: t('src.ip'),
            cell: ({ row }) => <span className="break-all">{row.getValue("srcIp")}</span>
        },
        {
            accessorKey: "srcPort",
            header: t('src.port'),
            cell: ({ row }) => <span>{row.getValue("srcPort")}</span>
        },
        {
            accessorKey: "dstPort",
            header: t('dst.port'),
            cell: ({ row }) => <span>{row.getValue("dstPort")}</span>
        },
        {
            accessorKey: "dstIp",
            header: t('dst.ip'),
            cell: ({ row }) => <span className="break-all">{row.getValue("dstIp")}</span>
        },
        {
            accessorKey: "createdAt",
            header: t('time'),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{format(new Date(row.getValue("createdAt")), "yyyy-MM-dd")}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(row.getValue("createdAt")), "HH:mm:ss")}</span>
                </div>
            )
        },
        {
            id: "actions",
            header: t('actions'),
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDetail(row.original)}
                    className="flex items-center gap-1"
                >
                    <Eye className="h-4 w-4" />
                    {t('details')}
                </Button>
            )
        }
    ]

    const table = useReactTable({
        data: data?.results || [],
        columns,
        pageCount: data?.totalPages || 0,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        state: {
            pagination: {
                pageIndex: (queryParams.page || 1) - 1,
                pageSize: queryParams.pageSize || 10
            }
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newPagination = updater({
                    pageIndex: (queryParams.page || 1) - 1,
                    pageSize: queryParams.pageSize || 10
                })
                handlePageChange(newPagination.pageIndex + 1)
                handlePageSizeChange(newPagination.pageSize)
            }
        }
    })

    return (
        <Card className="flex flex-col h-full p-0">
            <div className="flex flex-col h-full">
                {/* 头部筛选器 - 固定高度 */}
                <div className="p-6 flex-shrink-0">
                    <AttackLogFilter onFilter={handleFilter} defaultValues={queryParams} />
                </div>

                {/* 表格区域 - 弹性高度，可滚动 */}
                <div className="px-6 flex-1 overflow-auto">
                    {isError ? (
                        <div className="text-center py-4 text-destructive">
                            {t('error.loading.data')}
                        </div>
                    ) : (
                        <DataTable
                            table={table}
                            columns={columns}
                            isLoading={isLoading}
                        />
                    )}
                </div>

                {/* 底部分页 - 固定高度 */}
                <div className="py-6 px-4 flex-shrink-0">
                    <DataTablePagination table={table} />
                </div>
            </div>
            <AttackDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                data={selectedLog}
            />
        </Card>
    )
}