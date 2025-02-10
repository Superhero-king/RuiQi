import { BrowserRouter, useRoutes as useReactRoutes } from "react-router"
import { useRoutes } from "./config"

function Router() {
    const routes = useRoutes()
    return useReactRoutes(routes)
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    )
} 