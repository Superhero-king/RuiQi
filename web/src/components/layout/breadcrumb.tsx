import { useLocation, Link } from "react-router"
import { breadcrumbMap } from "@/routes/config"
import { RoutePath } from "@/routes/constants"
import { cn } from "@/lib/utils"

export function Breadcrumb() {
  const location = useLocation()
  const [mainPath, subPath] = location.pathname.split("/").filter(Boolean)
  const config = breadcrumbMap[`/${mainPath}` as RoutePath]
  
  if (!config) return null
  
  const currentPath = subPath || config.defaultPath

  return (
    <div className="flex items-center gap-4 p-4 border-b">
      {config.items.map((item, index) => (
        <div key={item.path} className="flex items-center">
          {index > 0 && <span className="mx-2 text-muted-foreground">/</span>}
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