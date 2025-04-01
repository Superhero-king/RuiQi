import { useState, useEffect, useRef } from "react"
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
import { ExternalLink, AlertTriangle, History } from "lucide-react"

export default function EventsPage() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const pollingTimerRef = useRef<number | null>(null)

    const [queryParams, setQueryParams] = useState<AttackEventQueryFormValues>({
        page: 1,
        pageSize: 10
    })
    
    // 轮询状态
    const [enablePolling, setEnablePolling] = useState(false)
    const [pollingInterval, setPollingInterval] = useState(30) // 默认30秒

    const { data, isLoading, isError, refetch } = useAttackEvents(queryParams)

    // 设置轮询
    useEffect(() => {
        // 清除现有的轮询
        if (pollingTimerRef.current !== null) {
            clearInterval(pollingTimerRef.current)
            pollingTimerRef.current = null
        }
        
        // 如果启用了轮询，设置新的轮询
        if (enablePolling) {
            pollingTimerRef.current = window.setInterval(() => {
                refetch()
            }, pollingInterval * 1000)
        }
        
        // 组件卸载时清除轮询
        return () => {
            if (pollingTimerRef.current !== null) {
                clearInterval(pollingTimerRef.current)
            }
        }
    }, [enablePolling, pollingInterval, refetch])

    const handleFilter = (values: AttackEventQueryFormValues) => {
        setQueryParams(values)
    }

    const handlePollingChange = (enabled: boolean, interval: number) => {
        setEnablePolling(enabled)
        setPollingInterval(interval)
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
                const minutes = row.getValue<number>("durationInMinutes")
                const hours = Math.floor(minutes / 60)
                const remainingMinutes = Math.round(minutes % 60)
                
                const durationText = hours > 0 
                    ? `${hours}h ${remainingMinutes}m` 
                    : `${remainingMinutes}m`
                
                return isOngoing ? (
                    <div className="flex flex-col items-center gap-1">
                        <Badge variant="destructive" className="flex items-center gap-1 animate-pulse bg-red-500 text-white">
                            <AlertTriangle className="h-3 w-3" />
                            {t('ongoing')}
                        </Badge>
                        <span className="text-xs text-destructive font-medium">
                            {t('under.attack')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {t('duration')}: {durationText}
                        </span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <Badge variant="warning" className="flex items-center gap-1 bg-amber-400 text-amber-900 border-amber-500">
                            <History className="h-3 w-3" />
                            {t('ended')}
                        </Badge>
                        <span className="text-xs text-amber-500 font-medium">
                            {t('no.ongoing.attack')}
                        </span>
                    </div>
                )
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

            <AttackEventFilter 
                onFilter={handleFilter} 
                defaultValues={queryParams}
                enablePolling={enablePolling}
                pollingInterval={pollingInterval}
                onPollingChange={handlePollingChange}
            />

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