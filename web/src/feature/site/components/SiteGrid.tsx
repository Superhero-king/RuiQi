import { useRef, useEffect, useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { siteApi } from '@/api/site'
import { Site, WAFMode } from '@/types/site'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Shield,
    ShieldAlert,
    Server,
    Globe,
    CheckCircle,
    XCircle,
    LinkIcon,
    Loader2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

interface SiteGridProps {
    onEdit: (site: Site) => void
    onDelete: (id: string) => void
}

export function SiteGrid({ onEdit, onDelete }: SiteGridProps) {
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
    const sites = useMemo(() => {
        return data?.pages.flatMap(page => page.items) || []
    }, [data])

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

    // 站点卡片组件
    const SiteCard = ({ site }: { site: Site }) => {
        const isInactive = !site.activeStatus

        return (
            <Card className={`p-5 ${isInactive ? 'bg-gray-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                    <div className={`flex flex-col ${isInactive ? 'text-gray-400' : ''}`}>
                        <h3 className="font-medium text-lg">{site.name}</h3>
                        <div className="flex items-center text-sm mt-1">
                            <Globe className="h-3.5 w-3.5 mr-1" />
                            <span>{site.domain}:{site.listenPort}</span>
                        </div>
                    </div>

                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={() => onEdit(site)}
                                >
                                    <Pencil className="mr-2 h-4 w-4" />
                                    编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => onDelete(site.id)}
                                    className="text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    删除
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* 状态信息 */}
                    <div className="flex flex-wrap gap-2">
                        {/* 站点状态 */}
                        {site.activeStatus ? (
                            <Badge variant="outline" className="flex items-center gap-1 border-green-200 text-green-700">
                                <CheckCircle className="h-3 w-3" />
                                <span>激活</span>
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="flex items-center gap-1 border-gray-200 text-gray-400">
                                <XCircle className="h-3 w-3" />
                                <span>未激活</span>
                            </Badge>
                        )}

                        {/* HTTPS状态 */}
                        {site.enableHTTPS ? (
                            <Badge variant="outline" className={`flex items-center gap-1 ${isInactive ? 'border-gray-200 text-gray-400' : 'border-blue-200 text-blue-700'}`}>
                                <LinkIcon className="h-3 w-3" />
                                <span>HTTPS</span>
                            </Badge>
                        ) : null}

                        {/* WAF状态 */}
                        {site.wafEnabled && (
                            site.wafMode === WAFMode.Protection ? (
                                <Badge variant="outline" className={`flex items-center gap-1 ${isInactive ? 'border-gray-200 text-gray-400' : 'border-green-200 text-green-700'}`}>
                                    <Shield className="h-3 w-3" />
                                    <span>防护模式</span>
                                </Badge>
                            ) : (
                                <Badge variant="outline" className={`flex items-center gap-1 ${isInactive ? 'border-gray-200 text-gray-400' : 'border-blue-200 text-blue-700'}`}>
                                    <ShieldAlert className="h-3 w-3" />
                                    <span>观察模式</span>
                                </Badge>
                            )
                        )}
                    </div>

                    {/* 上游服务器信息 */}
                    <div className={`space-y-1 ${isInactive ? 'text-gray-400' : ''}`}>
                        <div className="text-sm font-medium">上游服务器:</div>
                        <div className="space-y-1">
                            {site.backend.servers.map((server, index) => (
                                <div key={index} className="flex items-center gap-1 text-xs pl-2">
                                    <Server className="h-3 w-3" />
                                    <span>
                                        {server.isSSL ? 'https://' : 'http://'}
                                        {server.host}:{server.port}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 如果有证书，显示证书信息 */}
                    {site.enableHTTPS && site.certificate && (
                        <div className={`space-y-1 ${isInactive ? 'text-gray-400' : ''}`}>
                            <div className="text-sm font-medium">证书信息:</div>
                            <div className="text-xs pl-2">
                                <span>{site.certificate.certName}</span>
                                <span className="text-muted-foreground ml-2">
                                    ({site.certificate.issuerName})
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        )
    }

    // 卡片加载骨架屏
    const SiteCardSkeleton = () => (
        <Card className="p-5">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                </div>

                <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </div>
        </Card>
    )

    // 显示加载状态
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(6).fill(0).map((_, index) => (
                    <SiteCardSkeleton key={index} />
                ))}
            </div>
        )
    }

    return (
        <div>
            {sites.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    暂无站点数据
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sites.map(site => (
                        <SiteCard key={site.id} site={site} />
                    ))}
                </div>
            )}

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