import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Plus,
    LayoutGrid,
    Table as TableIcon,
    RefreshCw
} from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { SiteGrid } from "@/feature/site/components/SiteGrid"
import { SiteTable } from "@/feature/site/components/SiteTable"
import { SiteDialog } from "@/feature/site/components/SiteDialog"
import { DeleteSiteDialog } from "@/feature/site/components/DeleteSiteDialog"
import { Site } from "@/types/site"
import { TabsAnimationProvider } from "@/components/ui/animation/components/tab-animation"

export default function SiteManagerPage() {
    const [view, setView] = useState<'grid' | 'table'>('grid')
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedSite, setSelectedSite] = useState<Site | null>(null)
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null)

    const queryClient = useQueryClient()

    // 处理添加站点
    const handleAddSite = () => {
        setIsAddDialogOpen(true)
    }

    // 处理编辑站点
    const handleEditSite = (site: Site) => {
        setSelectedSite(site)
        setIsEditDialogOpen(true)
    }

    // 处理删除站点
    const handleDeleteSite = (id: string) => {
        setSelectedSiteId(id)
        setIsDeleteDialogOpen(true)
    }

    // 刷新站点列表
    const refreshSites = () => {
        queryClient.invalidateQueries({ queryKey: ['sites'] })
    }

    return (
        <Card className="p-6 w-full h-full border-none shadow-none">
            <div className="flex justify-between items-center mb-6  bg-zinc-50 rounded-md p-4">
                <h2 className="text-xl font-semibold">站点管理</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshSites}
                        className="flex items-center gap-1"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        刷新
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleAddSite}
                        className="flex items-center gap-1"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        添加站点
                    </Button>
                </div>
            </div>

            <Tabs value={view} onValueChange={(v) => setView(v as 'grid' | 'table')}>
                <TabsList className="mb-4">
                    <TabsTrigger value="grid" className="flex items-center gap-1">
                        <LayoutGrid className="h-4 w-4" />
                        <span>卡片视图</span>
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex items-center gap-1">
                        <TableIcon className="h-4 w-4" />
                        <span>表格视图</span>
                    </TabsTrigger>
                </TabsList>

                <TabsAnimationProvider currentView={view} animationVariant="slide">
                    {view === "grid" ? (
                        <TabsContent value="grid" forceMount>
                            <SiteGrid
                                onEdit={handleEditSite}
                                onDelete={handleDeleteSite}
                            />
                        </TabsContent>
                    ) : (
                        <TabsContent value="table" forceMount>
                            <SiteTable
                                onEdit={handleEditSite}
                                onDelete={handleDeleteSite}
                            />
                        </TabsContent>
                    )}
                </TabsAnimationProvider>
            </Tabs>

            {/* 添加站点对话框 */}
            <SiteDialog
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                mode="create"
            />

            {/* 编辑站点对话框 */}
            <SiteDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                mode="update"
                site={selectedSite}
            />

            {/* 删除站点确认对话框 */}
            <DeleteSiteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                siteId={selectedSiteId}
            />
        </Card>
    )
} 