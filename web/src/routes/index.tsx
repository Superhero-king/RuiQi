import { BrowserRouter, useRoutes } from "react-router"

import { routes } from "./config"

function Router() {
    return useRoutes(routes)
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Router />
        </BrowserRouter>
    )
} 