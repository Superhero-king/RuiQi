import { type RouteObject } from "react-router"
import { Navigate } from "react-router"
import { RootLayout } from "@/components/layout/root-layout"
import { LogsPage } from "@/pages/logs/page"
import { MonitorPage } from "@/pages/monitor/page"
import { RoutePath, ROUTES } from "./constants"
import { LogsAttack, LogsProtect } from "@/pages/logs/components"
import { RulesPage } from "@/pages/rules/pages"
import { SettingsPage } from "@/pages/settings/pages"
import { GlobalSetting, SiteManager, CertManager } from "@/pages/settings/components"
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { TFunction } from 'i18next'
import { columns, MonitorOverview, payments } from "@/pages/monitor/components"
import { SysRules, UserRules, IpGroup } from "@/pages/rules/components"

interface BreadcrumbItem {
    title: string
    path: string
    component: ReactElement
}

interface BreadcrumbConfig {
    defaultPath: string
    items: BreadcrumbItem[]
}

// 创建一个配置生成函数
export function createBreadcrumbConfig(t: TFunction): Record<RoutePath, BreadcrumbConfig> {
    return {
        [ROUTES.LOGS]: {
            defaultPath: "protect",
            items: [
                {
                    title: t('breadcrumb.logs.protect'),
                    path: "protect",
                    component: <LogsProtect />
                },
                {
                    title: t('breadcrumb.logs.attack'),
                    path: "attack",
                    component: <LogsAttack />
                }
            ]
        },
        [ROUTES.MONITOR]: {
            defaultPath: "overview",
            items: [
                {
                    title: t('breadcrumb.monitor.overview'),
                    path: "overview",
                    component: <MonitorOverview columns={columns} data={payments} />
                }
            ]
        },
        [ROUTES.RULES]: {
            defaultPath: "system",
            items: [
                {
                    title: t('breadcrumb.rules.system'),
                    path: "system",
                    component: <SysRules />
                },
                {
                    title: t('breadcrumb.rules.user'),
                    path: "user",
                    component: <UserRules />
                },
                {
                    title: t('breadcrumb.rules.ipGroup'),
                    path: "ip",
                    component: <IpGroup />
                }

            ]
        },
        [ROUTES.SETTINGS]: {
            defaultPath: "settings",
            items: [
                {
                    title: t('breadcrumb.settings.settings'),
                    path: "settings",
                    component: <GlobalSetting />
                },
                {
                    title: t('breadcrumb.settings.siteManager'),
                    path: "site",
                    component: <SiteManager />
                },
                {
                    title: t('breadcrumb.settings.certManager'),
                    path: "cert",
                    component: <CertManager />
                }
            ]
        }
    }
}

// 创建一个配置提供组件
export function useBreadcrumbMap() {
    const { t } = useTranslation()
    return createBreadcrumbConfig(t)
}

// 路由配置
export function useRoutes(): RouteObject[] {
    const breadcrumbMap = useBreadcrumbMap()

    return [
        {
            element: <RootLayout />,
            children: [
                {
                    path: "/",
                    element: <Navigate to={`${ROUTES.LOGS}/attack`} replace />
                },
                {
                    path: ROUTES.LOGS,
                    element: <LogsPage />,
                    children: [
                        {
                            path: "",
                            element: <Navigate to={breadcrumbMap[ROUTES.LOGS].defaultPath} replace />
                        },
                        ...breadcrumbMap[ROUTES.LOGS].items.map(item => ({
                            path: item.path,
                            element: item.component
                        }))
                    ]
                },
                {
                    path: ROUTES.MONITOR,
                    element: <MonitorPage />,
                    children: [
                        {
                            path: "",
                            element: <Navigate to={breadcrumbMap[ROUTES.MONITOR].defaultPath} replace />
                        },
                        ...breadcrumbMap[ROUTES.MONITOR].items.map(item => ({
                            path: item.path,
                            element: item.component
                        }))
                    ]
                },
                {
                    path: ROUTES.RULES,
                    element: <RulesPage />,
                    children: [
                        {
                            path: "",
                            element: <Navigate to={breadcrumbMap[ROUTES.RULES].defaultPath} replace />
                        },
                        ...breadcrumbMap[ROUTES.RULES].items.map(item => ({
                            path: item.path,
                            element: item.component
                        }))
                    ]
                },
                {
                    path: ROUTES.SETTINGS,
                    element: <SettingsPage />,
                    children: [
                        {
                            path: "",
                            element: <Navigate to={breadcrumbMap[ROUTES.SETTINGS].defaultPath} replace />
                        },
                        ...breadcrumbMap[ROUTES.SETTINGS].items.map(item => ({
                            path: item.path,
                            element: item.component
                        }))
                    ]
                }
            ]
        }
    ]
}

// Export a default breadcrumb config for TypeScript type inference
export const breadcrumbMap = createBreadcrumbConfig(((key: string) => key) as unknown as TFunction) as ReturnType<typeof createBreadcrumbConfig> 