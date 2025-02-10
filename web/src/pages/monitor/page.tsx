import { Card } from "@/components/ui/card"
import { Outlet } from "react-router"

export function MonitorPage() {
    return (
        <Card className="border-none shadow-none p-0">
            <Outlet />
        </Card>
    )
}