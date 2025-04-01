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

    const navigateToLogs = (domain: string, srcIp: string) => {
        navigate(`/logs/protect?domain=${encodeURIComponent(domain)}&srcIp=${encodeURIComponent(srcIp)}`)
    }

    const columns: ColumnDef<AttackEventAggregateResult>[] = [
        {
            accessorKey: "domain",
            header: t('domain'),
            cell: ({ row }) => <span className="font-medium break-all">{row.getValue("domain")}</span>
        },
        {
            accessorKey: "dstPort",
            header: t('dst.port'),
            cell: ({ row }) => <span>{row.getValue("dstPort")}</span>
        },
        {
            accessorKey: "srcIp",
            header: t('src.ip'),
            cell: ({ row }) => <span className="break-all">{row.getValue("srcIp")}</span>
        },
        {
            accessorKey: "count",
            header: t('attack.count'),
            cell: ({ row }) => (
                <Button
                    variant="link"
                    onClick={() => navigateToLogs(row.original.domain, row.original.srcIp)}
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
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{format(new Date(row.getValue("firstAttackTime")), "yyyy-MM-dd")}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(row.getValue("firstAttackTime")), "HH:mm:ss")}</span>
                </div>
            )
        },
        {
            accessorKey: "lastAttackTime",
            header: t('last.attack.time'),
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{format(new Date(row.getValue("lastAttackTime")), "yyyy-MM-dd")}</span>
                    <span className="text-sm text-muted-foreground">{format(new Date(row.getValue("lastAttackTime")), "HH:mm:ss")}</span>
                </div>
            )
        },
        {
            accessorKey: "isOngoing",
            header: t('status'),
            cell: ({ row }) => {
                const isOngoing = row.getValue("isOngoing")
                return isOngoing ? (
                    <div className="flex flex-col items-center gap-1">
                        <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                            <AlertTriangle className="h-3 w-3" />
                            {t('ongoing')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{t('under.attack')}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <Badge variant="outline">{t('ended')}</Badge>
                        <span className="text-xs text-muted-foreground">{t('no.ongoing.attack')}</span>
                    </div>
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