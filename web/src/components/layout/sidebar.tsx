import { Link, useLocation } from "react-router"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Settings, Shield, BarChart2, FileText, LogOut } from "lucide-react"
import { ROUTES } from "@/routes/constants"

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

  return (
    <div className="w-[283px] flex flex-col border-r bg-card">
      <div className="p-6">
        <div className="flex flex-col items-start gap-1 mb-8">
          <span className="text-3xl font-medium">Xray</span>
          <span className="text-lg text-muted-foreground">Simple WAF</span>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-base",
                  location.pathname === item.href && "bg-accent"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t">
        <Button variant="ghost" className="w-full justify-start text-base">
          <LogOut className="mr-3 h-5 w-5" />
          登出
        </Button>
      </div>
    </div>
  )
} 