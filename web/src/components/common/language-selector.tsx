import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTranslation } from "react-i18next"

export function LanguageSelector() {
    const { i18n } = useTranslation()
    const [language, setLanguage] = useState(i18n.language || 'zh')

    const handleLanguageChange = (value: string) => {
        setLanguage(value)
        i18n.changeLanguage(value)
        // 保存用户语言选择到本地存储
        localStorage.setItem('i18nextLng', value)
    }

    // 初始化时从本地存储获取语言设置
    useEffect(() => {
        const savedLanguage = localStorage.getItem('i18nextLng')
        if (savedLanguage && savedLanguage !== language) {
            setLanguage(savedLanguage)
            i18n.changeLanguage(savedLanguage) // 确保应用当前语言
        }
    }, []) // 只在组件挂载时执行一次

    return (
        <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="zh">简体中文</SelectItem>
                <SelectItem value="en">English</SelectItem>
            </SelectContent>
        </Select>
    )
}