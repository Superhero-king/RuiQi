import { Outlet } from "react-router"
import { Sidebar } from "./sidebar"
import { Breadcrumb } from "./breadcrumb"

export function RootLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="w-[2px] my-4 bg-surface-300 " />
      <main className="flex-1 flex flex-col">
        <Breadcrumb />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
} 