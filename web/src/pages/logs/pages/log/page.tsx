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
import { AttackLogQueryFormValues } from "@/validation/waf"
import { WAFLog, AttackDetailData } from "@/types/waf"
import { useAttackLogs } from "@/feature/log/hook/useAttackLogs"
import { format } from "date-fns"
import { AttackDetailDialog } from "@/feature/log/components/attack-detail-dialog"
import { Eye, Shield } from "lucide-react"

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
        const clientIpAddress = params.get('clientIpAddress')

        if (domain || clientIpAddress) {
            setQueryParams(prev => ({
                ...prev,
                domain: domain || undefined,
                clientIpAddress: clientIpAddress || undefined
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
            target: `${log.domain}${log.uri}`,
            clientIpAddress: log.clientIpAddress,
            payload: log.payload,
            message: log.message,
            ruleId: log.ruleId,
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
                <div className="max-w-[300px] truncate">
                    {row.original.domain}{row.original.uri}
                </div>
            )
        },
        {
            accessorKey: "clientIpAddress",
            header: t('client.ip')
        },
        {
            accessorKey: "message",
            header: t('attack.type'),
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-destructive" />
                    <span>{row.original.message}</span>
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: t('time'),
            cell: ({ row }) => format(new Date(row.getValue("createdAt")), "yyyy-MM-dd HH:mm:ss")
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
        <div className="space-y-4 p-8">
            <h1 className="text-2xl font-bold">{t('attack.logs')}</h1>

            <AttackLogFilter onFilter={handleFilter} defaultValues={queryParams} />

            <Card className="p-4">
                {isError ? (
                    <div className="text-center py-4 text-destructive">
                        {t('error.loading.data')}
                    </div>
                ) : (
                    <>
                        <DataTable
                            table={table}
                            columns={columns}
                            isLoading={isLoading}
                            style="border"
                        />

                        <div className="mt-4">
                            <DataTablePagination table={table} />
                        </div>
                    </>
                )}
            </Card>

            <AttackDetailDialog
                open={detailDialogOpen}
                onOpenChange={setDetailDialogOpen}
                data={selectedLog}
            />
        </div>
    )
}