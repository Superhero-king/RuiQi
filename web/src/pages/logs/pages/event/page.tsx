import { useState } from "react"
import { useNavigate } from "react-router"
import { Card } from "@/components/ui/card"
import {
    ColumnDef,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { DataTable } from "@/components/table/data-table"
import { DataTablePagination } from "@/components/table/pagination"
import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { AttackEventFilter } from "@/feature/log/components/attack-event-filter"
import { AttackEventQueryFormValues } from "@/validation/waf"
import { AttackEventAggregateResult } from "@/types/waf"
import { useAttackEvents } from "@/feature/log/hook/useAttackEvents"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ExternalLink, AlertTriangle } from "lucide-react"

export default function EventsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [queryParams, setQueryParams] = useState<AttackEventQueryFormValues>({
        page: 1,
        pageSize: 10
    })

    const { data, isLoading, isError } = useAttackEvents(queryParams)

    const handleFilter = (values: AttackEventQueryFormValues) => {
        setQueryParams(values)
    }

    const handlePageChange = (page: number) => {
        setQueryParams(prev => ({ ...prev, page }))
    }

    const handlePageSizeChange = (pageSize: number) => {
        setQueryParams(prev => ({ ...prev, page: 1, pageSize }))
    }

    const navigateToLogs = (domain: string, clientIpAddress: string) => {
        navigate(`/logs/log?domain=${encodeURIComponent(domain)}&clientIpAddress=${encodeURIComponent(clientIpAddress)}`,
            // { replace: true } // 替换当前历史记录条目)
        )
    }

    const columns: ColumnDef<AttackEventAggregateResult>[] = [
        {
            accessorKey: "domain",
            header: t('domain'),
            cell: ({ row }) => <span className="font-medium">{row.getValue("domain")}</span>
        },
        {
            accessorKey: "clientIpAddress",
            header: t('client.ip'),
            cell: ({ row }) => <span>{row.getValue("clientIpAddress")}</span>
        },
        {
            accessorKey: "count",
            header: t('attack.count'),
            cell: ({ row }) => (
                <Button
                    variant="link"
                    onClick={() => navigateToLogs(row.original.domain, row.original.clientIpAddress)}
                    className="flex items-center gap-1 p-0"
                >
                    {row.getValue("count")}
                    <ExternalLink className="h-3 w-3" />
                </Button>
            )
        },
        {
            accessorKey: "firstAttackTime",
            header: t('first.attack.time'),
            cell: ({ row }) => <span>{format(new Date(row.getValue("firstAttackTime")), "yyyy-MM-dd HH:mm:ss")}</span>
        },
        {
            accessorKey: "lastAttackTime",
            header: t('last.attack.time'),
            cell: ({ row }) => <span>{format(new Date(row.getValue("lastAttackTime")), "yyyy-MM-dd HH:mm:ss")}</span>
        },
        {
            accessorKey: "isOngoing",
            header: t('status'),
            cell: ({ row }) => {
                const isOngoing = row.getValue("isOngoing")
                return isOngoing ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {t('ongoing')}
                    </Badge>
                ) : (
                    <Badge variant="outline">{t('ended')}</Badge>
                )
            }
        },
        {
            accessorKey: "durationInMinutes",
            header: t('duration'),
            cell: ({ row }) => {
                const minutes = row.getValue<number>("durationInMinutes")
                const hours = Math.floor(minutes / 60)
                const remainingMinutes = Math.round(minutes % 60)

                if (hours > 0) {
                    return `${hours}h ${remainingMinutes}m`
                }
                return `${remainingMinutes}m`
            }
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
            <h1 className="text-2xl font-bold">{t('attack.events')}</h1>

            <AttackEventFilter onFilter={handleFilter} defaultValues={queryParams} />

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
        </div>
    )
} 