import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"
import { Settings, Shield, BarChart2, FileText, LogOut } from "lucide-react"
import { ROUTES } from "@/routes/constants"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'

// 创建一个配置生成函数
function createSidebarConfig(t: TFunction) {
    return [
        {
            title: t('sidebar.monitor'),
            icon: BarChart2,
            href: ROUTES.MONITOR
        },
        {
            title: t('sidebar.logs'),
            icon: FileText,
            href: ROUTES.LOGS
        },
        {
            title: t('sidebar.rules'),
            icon: Shield,
            href: ROUTES.RULES
        },
        {
            title: t('sidebar.settings'),
            icon: Settings,
            href: ROUTES.SETTINGS
        }
    ] as const
}

export function Sidebar() {
    const location = useLocation()
    const { t } = useTranslation()

    // 获取当前路径的第一级
    const currentFirstLevelPath = '/' + location.pathname.split('/')[1]

    // 使用 t 函数生成 sidebarItems
    const sidebarItems = createSidebarConfig(t)

    return (
        <Card className="w-[17.69rem] flex flex-col rounded-none  gap-1 border-0 shadow-none overflow-auto">
            <CardHeader className="pt-[0.0625rem] pb-0 gap-5 w-full items-center justify-center space-y-0 ">
                <CardTitle
                    className="bg-surface-300 font-medium w-[5rem] h-[5rem] rounded-full text-[2.25rem] leading-[1.2] tracking-[0.01em] flex justify-center items-center text-content-200"
                >
                    Xray
                </CardTitle>
                <CardDescription className="text-[1.75rem] font-bold leading-[1.4] tracking-[0.0125rem] normal-case text-content-200">
                    {t('sidebar.title')}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-[6rem] pl-[3rem] pb-0 pr-0">
                <nav className="flex flex-col gap-[1.125rem]">
                    {sidebarItems.map((item) => {
                        const isActive = currentFirstLevelPath === item.href
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className="flex items-center gap-[1.125rem] group"
                            >
                                <div className={cn(
                                    "p-2 rounded-md w-[3.5rem] h-[3.5rem]",
                                    "transform transition-all duration-500 ease-out",
                                    isActive
                                        ? "bg-primary-100 scale-110"
                                        : "bg-surface-200 group-hover:scale-105 group-hover:bg-primary-100/20"
                                )}>
                                    <item.icon
                                        strokeWidth={1}
                                        className={cn(
                                            "w-full h-full shrink-0",
                                            "transform transition-all duration-500 ease-out",
                                            isActive ? "stroke-white animate-icon-shake" : "stroke-primary-200 group-hover:stroke-primary-100"
                                        )}
                                    />
                                </div>
                                <span className={cn(
                                    "text-[1.5rem] leading-[1.6] tracking-[0.0625rem] text-content-200",
                                    "transform transition-all duration-500 ease-out",
                                    isActive
                                        ? "font-bold translate-x-2"
                                        : "font-normal group-hover:translate-x-1"
                                )}>
                                    {item.title}
                                </span>
                            </Link>
                        )
                    })}
                </nav>
            </CardContent>

            <CardFooter className="pt-[6.25rem] pl-[3rem] pb-0 pr-0">
                <div className="flex items-center gap-[1.125rem] cursor-pointer group">
                    <div className={cn(
                        "p-2 rounded-md w-[3.5rem] h-[3.5rem]",
                        "transform transition-all duration-500 ease-out",
                        "bg-surface-200 group-hover:bg-primary-100/20 group-hover:scale-105",
                        "group-active:bg-primary-100"
                    )}>
                        <LogOut strokeWidth={1}
                            className={cn(
                                "w-full h-full shrink-0",
                                "transform transition-all duration-500 ease-out",
                                "stroke-primary-200 group-hover:stroke-primary-100",
                                "group-active:stroke-white"
                            )} />
                    </div>
                    <span className={cn(
                        "text-[1.5rem] leading-[1.6] tracking-[0.0625rem] text-content-200",
                        "transform transition-all duration-500 ease-out",
                        "font-normal group-hover:translate-x-1",
                        "group-active:font-bold group-active:translate-x-2"
                    )}>
                        {t('sidebar.logout')}
                    </span>
                </div>
            </CardFooter>
        </Card>
    )
} 