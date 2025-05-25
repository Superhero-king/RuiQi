import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe3DMap } from './globe3D-map'
import { StatCard } from './StatCard'
import { AttackIPList } from './AttackIPList'
import { RealtimeAttackList } from './RealtimeAttackList'
import { DashboardQPSChart } from './DashboardQPSChart'
import { useSecurityDashboard } from '../hooks/useSecurityDashboard'
import { Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 安全大屏布局组件
 * 包含顶部标题栏、左侧统计卡片、右侧实时攻击列表、底部QPS图表和背景3D地球
 */
export const SecurityDashboardLayout: React.FC = () => {
    const { t, i18n } = useTranslation()
    const [currentTime, setCurrentTime] = useState(new Date())
    const [isFullscreen, setIsFullscreen] = useState(false)

    // 获取大屏数据
    const {
        overviewStats,
        attackEvents,
        realtimeAttacks,
        attackIPs
    } = useSecurityDashboard()

    // 时间更新器 - 每秒更新一次时间显示
    useEffect(() => {
        const timeUpdateRef = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)

        return () => {
            clearInterval(timeUpdateRef)
        }
    }, [])

    // 监听全屏状态变化
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    // 格式化时间显示
    const formatCurrentTime = (date: Date) => {
        const locale = i18n.language === 'zh' ? 'zh-CN' : 'en-US'
        return date.toLocaleString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/\//g, '-')
    }

    // 全屏切换
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    // 将WAF攻击事件转换为3D可视化轨道数据
    const wafAttackTrajectoryData = React.useMemo(() => {
        if (!attackEvents.data?.results) return []

        return attackEvents.data.results
            .filter(event => event.srcIpInfo?.location?.latitude) // 只显示有位置信息的攻击
            .map((event, index) => ({
                type: "waf_attack",
                order: index + 1,
                from: `${event.srcIp} (${event.srcIpInfo.location.latitude.toFixed(2)}, ${event.srcIpInfo.location.longitude.toFixed(2)})`,
                to: "WAF防护中心",
                flightCode: event.domain,
                date: event.firstAttackTime,
                status: event.isOngoing,
                startLat: event.srcIpInfo.location.latitude,
                startLng: event.srcIpInfo.location.longitude,
                endLat: 30.274084, // 杭州坐标
                endLng: 120.155070,
                arcAlt: Math.min(0.3, Math.max(0.05, event.count / 500)),
                colorIndex: Math.floor(Math.random() * 8) // 8种颜色
            }))
    }, [attackEvents.data])

    return (
        <div className="relative w-full h-screen bg-gradient-to-br from-[#0d0c27] via-[#1a1336] to-[#2d1b54] overflow-hidden">
            {/* 3D地球背景 */}
            <div className="absolute inset-0 z-0 w-full h-full">
                <Globe3DMap wafAttackTrajectoryData={wafAttackTrajectoryData} />
            </div>

            {/* 顶部标题栏 */}
            <div className="absolute top-0 left-0 right-0 z-10 h-24">
                <div className="flex items-center justify-between h-full px-6">
                    <div className="flex items-center ml-2">
                        <div className="font-bold text-2xl gap-2 flex">
                            <span className="text-[#E8DFFF] dark:text-[#F0EBFF] text-shadow-glow-purple transition-all duration-300">RuiQi WAF</span>
                            <span className="text-[#8ED4FF] dark:text-[#A5DEFF] text-shadow-glow-blue transition-all duration-300">{t('securityDashboard.title')}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-white text-lg font-mono text-shadow-glow-white">
                            {formatCurrentTime(currentTime)}
                        </div>
                        {/* 只在非全屏状态下显示全屏按钮 */}
                        {!isFullscreen && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleFullscreen}
                                className="text-white  transition-all duration-200"
                                title="进入全屏模式"
                            >
                                <Maximize2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* 左侧统计卡片区域 */}
            <div className="absolute left-6 top-28  z-10 w-64 flex flex-col">
                {/* 前三个统计卡片 */}
                <div className="flex-none space-y-0.5">
                    <StatCard
                        title={t('securityDashboard.stats.blockCount24h')}
                        value={overviewStats.data?.blockCount || 0}
                    />
                    <StatCard
                        title={t('securityDashboard.stats.attackIPCount24h')}
                        value={overviewStats.data?.attackIPCount || 0}
                    />
                    <StatCard
                        title={t('securityDashboard.stats.totalRequests24h')}
                        value={overviewStats.data?.totalRequests || 0}
                    />
                </div>

                {/* 第四个卡片 - 攻击IP列表 */}
                <div className="flex-1 min-h-0 mt-20">
                    <AttackIPList
                        attackIPs={attackIPs}
                        isLoading={attackEvents.isLoading}
                    />
                </div>
            </div>

            {/* 右侧实时攻击列表 */}
            <div className="absolute right-6 top-28 bottom-48 z-10 w-80">
                <RealtimeAttackList
                    realtimeAttacks={realtimeAttacks}
                    isLoading={attackEvents.isLoading}
                />
            </div>

            {/* 底部QPS图表 */}
            <div className="absolute left-2 right-2 bottom-2 z-10 h-32">
                <DashboardQPSChart />
            </div>
        </div>
    )
} 