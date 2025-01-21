import { type RouteObject } from "react-router"
import { Navigate } from "react-router"
import { RootLayout } from "@/components/layout/root-layout"
import { LogsPage } from "@/pages/logs/page"
import { RoutePath, ROUTES } from "./constants"
import { LogsAttack, LogsProtect } from "@/pages/logs/components"
import { ReactElement } from 'react'

interface BreadcrumbItem {
    title: string
    path: string
    component: ReactElement
}

interface BreadcrumbConfig {
    defaultPath: string
    items: BreadcrumbItem[]
}


// 面包屑配置
export const breadcrumbMap: Record<RoutePath, BreadcrumbConfig> = {
    [ROUTES.LOGS]: {
        defaultPath: "attack",
        items: [
            {
                title: "防护日志",
                path: "attack",
                component: <LogsAttack />
            },
            {
                title: "攻击检测",
                path: "protect",
                component: <LogsProtect />
            }
        ]
    },
    [ROUTES.MONITOR]: {
        defaultPath: "overview",
        items: [
            {
                title: "监控",
                path: "overview",
                component: <div>Monitor Overview</div>
            }
        ]
    },
    [ROUTES.RULES]: {
        defaultPath: "rules",
        items: [
            {
                title: "规则",
                path: "rules",
                component: <div>Rules Page</div>
            }
        ]
    },
    [ROUTES.SETTINGS]: {
        defaultPath: "settings",
        items: [
            {
                title: "设置",
                path: "settings",
                component: <div>Settings Page</div>
            }
        ]
    }
}

// 路由配置
export const routes: RouteObject[] = [
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