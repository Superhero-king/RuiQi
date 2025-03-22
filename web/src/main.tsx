import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import './i18n'
import App from './App.tsx'
import { ErrorBoundary } from './handler/error-boundary.tsx'
import { ENV } from './utils/env.ts'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5分钟
            retry: 1,
            refetchOnWindowFocus: false
        }
    }
})


createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
                <Suspense fallback={
                    <div className="flex h-screen w-full items-center justify-center">
                        <div className="h-6 w-6 animate-spin text-primary">加载中...</div>
                    </div>
                }>
                    <App />
                </Suspense>
                {ENV.isDevelopment && <ReactQueryDevtools />}
            </QueryClientProvider>
        </ErrorBoundary>
    </StrictMode>,
)
