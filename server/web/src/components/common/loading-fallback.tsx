import { useTranslation } from "react-i18next"

import { Loader2 } from "lucide-react"

// Loading component with translations
export const LoadingFallback = () => {
    const { t } = useTranslation()

    return (
        <div className="flex h-screen w-full items-center justify-center">
            <div className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span>{t('common.loading')}</span>
            </div>
        </div>
    )
}