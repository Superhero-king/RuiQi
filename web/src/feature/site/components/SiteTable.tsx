import { useRef, useEffect, useMemo } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    ColumnDef,
} from '@tanstack/react-table'
import { useInfiniteQuery } from '@tanstack/react-query'
import { siteApi } from '@/api/site'
import { Site, WAFMode } from '@/types/site'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Shield,
    ShieldAlert,
    Server,
    Globe,
    CheckCircle,
    XCircle
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Loader2 } from 'lucide-react'
import { DataTable } from '@/components/table/data-table'

interface SiteTableProps {
    onEdit: (site: Site) => void
    onDelete: (id: string) => void
}

export function SiteTable({ onEdit, onDelete }: SiteTableProps) {
    // 引用用于无限滚动
    const sentinelRef = useRef<HTMLDivElement>(null)

    // 每页数据条数
    const PAGE_SIZE = 20

    // 获取站点列表
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['sites'],
        queryFn: ({ pageParam }) => siteApi.getSites(pageParam as number, PAGE_SIZE),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            // 优化判断逻辑：使用实际获取的数据总量，而不是假设每页恰好有PAGE_SIZE条
            const fetchedItemsCount = allPages.reduce((total, page) => total + page.items.length, 0)
            return fetchedItemsCount < lastPage.total ? allPages.length + 1 : undefined
        },
    })

    // 扁平化分页数据
    const flatData = useMemo(() =>
        data?.pages.flatMap(page => page.items) || [],
        [data]
    )


    // 优化的无限滚动实现
    useEffect(() => {
        // 只有当有更多页面可加载时才创建观察器
        if (!hasNextPage) return

        const options = {
            // 降低threshold使其更容易触发
            threshold: 0.1,
            // 减小rootMargin以避免过早触发，但仍保持一定的预加载空间
            rootMargin: '100px 0px'
        }

        const handleObserver = (entries: IntersectionObserverEntry[]) => {
            const [entry] = entries
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage()
            }
        }

        const observer = new IntersectionObserver(handleObserver, options)

        const sentinel = sentinelRef.current
        if (sentinel) {
            observer.observe(sentinel)
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel)
            }
            observer.disconnect()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])



    // 表格列定义
    const columns: ColumnDef<Site>[] = [
        {
            accessorKey: 'name',
            header: () => <div className="font-medium py-3.5">站点名称</div>,
            cell: ({ row }) => {
                const isInactive = !row.original.activeStatus
                return (
                    <div className={`font-medium ${isInactive ? 'text-gray-400' : ''}`}>
                        {row.original.name}
                    </div>
                )
            },
        },
        {
            accessorKey: 'domain',
            header: () => <div className="font-medium py-3.5">域名</div>,
            cell: ({ row }) => {
                const isInactive = !row.original.activeStatus
                return (
                    <div className={`flex items-center gap-1 ${isInactive ? 'text-gray-400' : ''}`}>
                        <Globe className="h-3.5 w-3.5" />
                        <span>{row.original.domain}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: 'listenPort',
            header: () => <div className="font-medium py-3.5">监听端口</div>,
            cell: ({ row }) => {
                const isInactive = !row.original.activeStatus
                return (
                    <div className={isInactive ? 'text-gray-400' : ''}>
                        {row.original.listenPort}
                    </div>
                )
            },
        },
        {
            accessorKey: 'backend',
            header: () => <div className="font-medium py-3.5">上游服务器</div>,
            cell: ({ row }) => {
                const isInactive = !row.original.activeStatus
                const servers = row.original.backend.servers

                return (
                    <div className={`flex flex-col gap-1 ${isInactive ? 'text-gray-400' : ''}`}>
                        {servers.map((server, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs">
                                <Server className="h-3 w-3" />
                                <span>
                                    {server.isSSL ? 'https://' : 'http://'}
                                    {server.host}:{server.port}
                                </span>
                            </div>
                        ))}
                    </div>
                )
            },
        },
        {
            accessorKey: 'enableHTTPS',
            header: () => <div className="font-medium py-3.5">HTTPS</div>,
            cell: ({ row }) => {
                const isInactive = !row.original.activeStatus
                const enabled = row.original.enableHTTPS

                return (
                    <div className={`${isInactive ? 'text-gray-400' : ''}`}>
                        {enabled ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                已启用
                            </Badge>
                        ) : (
                            <Badge variant="outline" className={isInactive ? 'text-gray-400 border-gray-200' : ''}>
                                未启用
                            </Badge>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'activeStatus',
            header: () => <div className="font-medium py-3.5">站点状态</div>,
            cell: ({ row }) => {
                const isActive = row.original.activeStatus

                return (
                    <div className="flex items-center gap-1">
                        {isActive ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-green-600">激活</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-400">未激活</span>
                            </>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'wafStatus',
            header: () => <div className="font-medium py-3.5">WAF状态</div>,
            cell: ({ row }) => {
                const isInactive = !row.original.activeStatus
                const wafEnabled = row.original.wafEnabled
                const wafMode = row.original.wafMode

                if (!wafEnabled) {
                    return (
                        <Badge variant="outline" className={isInactive ? 'text-gray-400 border-gray-200' : ''}>
                            未启用
                        </Badge>
                    )
                }

                return (
                    <div className={`flex items-center gap-1 ${isInactive ? 'text-gray-400' : ''}`}>
                        {wafMode === WAFMode.Protection ? (
                            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span>防护模式</span>
                            </Badge>
                        ) : (
                            <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3" />
                                <span>观察模式</span>
                            </Badge>
                        )}
                    </div>
                )
            },
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
                            onClick={() => onEdit(row.original)}
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(row.original.id)}
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
        <div>
            {/* 表格 */}
            <DataTable table={table} columns={columns} isLoading={isLoading} style="border" />

            {/* 无限滚动监测元素，只在有更多数据时显示 */}
            {hasNextPage && (
                <div
                    ref={sentinelRef}
                    className="h-5 flex justify-center items-center mt-4"
                >
                    {isFetchingNextPage && (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                </div>
            )}
        </div>
    )


}