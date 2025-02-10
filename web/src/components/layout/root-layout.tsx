import { Outlet } from "react-router"
import { Sidebar } from "./sidebar"
import { Breadcrumb } from "./breadcrumb"

export function RootLayout() {
  return (
    <div className="flex h-screen py-4">
      <Sidebar />
      <div className="w-[0.125rem] bg-surface-300" />
      <main className="flex-1 flex flex-col px-6 h-full">
        <Breadcrumb />
        <div className="flex-1 overflow-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
} 