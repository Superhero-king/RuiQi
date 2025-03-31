import { Card } from "@/components/ui/card"
import { Outlet } from "react-router"

export function LogAndEventPage() {
    return (
        <Card className="flex-1  h-full border-none shadow-none p-0">
            <Outlet />
        </Card>
    )
}