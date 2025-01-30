import { useLocation, Link } from "react-router"
import { breadcrumbMap } from "@/routes/config"
import { RoutePath } from "@/routes/constants"
import { cn } from "@/lib/utils"
import { Slash } from "lucide-react"

export function Breadcrumb() {
  const location = useLocation()
  const [mainPath, subPath] = location.pathname.split("/").filter(Boolean)
  const config = breadcrumbMap[`/${mainPath}` as RoutePath]

  if (!config) return null

  const currentPath = subPath || config.defaultPath

  return (
    <div className="flex items-center p-0 h-14 mb-6">
      {config.items.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <div className="w-4 h-4 p-0 mx-2">
            <Slash className="text-muted-foreground w-full h-full [transform:rotate(-25deg)]" />
          </div>}
          <Link
            to={`/${mainPath}/${item.path}`}
            className={cn(
              "transition-colors hover:text-primary",
              index === 0 ? "text-2xl font-semibold" : "text-lg text-muted-foreground",
              currentPath === item.path && "text-primary"
            )}
          >
            {item.title}
          </Link>
        </div>
      ))}
    </div>
  )
} 