import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"
import { Settings, Shield, BarChart2, FileText, LogOut } from "lucide-react"
import { ROUTES } from "@/routes/constants"
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card"

const sidebarItems = [
  {
    title: "监控",
    icon: BarChart2,
    href: ROUTES.MONITOR
  },
  {
    title: "日志",
    icon: FileText,
    href: ROUTES.LOGS
  },
  {
    title: "规则",
    icon: Shield,
    href: ROUTES.RULES
  },
  {
    title: "设置",
    icon: Settings,
    href: ROUTES.SETTINGS
  }
] as const

export function Sidebar() {
  const location = useLocation()

  // 获取当前路径的第一级
  const currentFirstLevelPath = '/' + location.pathname.split('/')[1]

  return (
    <Card className="w-[283px] flex flex-col rounded-none py-4 gap-1 border-0 shadow-none overflow-auto">
      <CardHeader className="pt-1 pb-0 gap-5 w-full items-center justify-center space-y-0 ">
        <CardTitle
          className="bg-surface-300 font-medium w-20 h-20 rounded-full text-[36px] leading-[1.2] tracking-[0.01em] flex justify-center items-center"
        >
          Xray
        </CardTitle>
        <CardDescription className="text-[28px] font-bold leading-[1.4] tracking-[0.2px] normal-case">Simple WAF</CardDescription>
      </CardHeader>

      <CardContent className="pt-[96px] pl-[48px] pb-0 pr-0">
        <nav className="flex flex-col gap-[18px]">
          {sidebarItems.map((item) => {
            const isActive = currentFirstLevelPath === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-[18px] group"
              >
                <div className={cn(
                  "p-2 rounded-md w-[56px] h-[56px]",
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
                  "text-[24px] leading-[1.6] tracking-[1px] text-text-200",
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

      <CardFooter className="pt-[100px] pl-[48px] pb-0 pr-0">
        <div className="flex items-center gap-[18px] cursor-pointer group">
          <div className={cn(
            "p-2 rounded-md w-[56px] h-[56px]",
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
            "text-[24px] leading-[1.6] tracking-[1px] text-text-200",
            "transform transition-all duration-500 ease-out",
            "font-normal group-hover:translate-x-1",
            "group-active:font-bold group-active:translate-x-2"
          )}>
            登出
          </span>
        </div>
      </CardFooter>
    </Card>
  )
} 