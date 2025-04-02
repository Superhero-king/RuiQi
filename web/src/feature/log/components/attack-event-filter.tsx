import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { attackEventQuerySchema, AttackEventQueryFormValues } from "@/validation/log"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { Search, RefreshCw, ChevronDown, ChevronUp, Clock, RotateCcw } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AttackEventFilterProps {
    onFilter: (values: AttackEventQueryFormValues) => void
    onRefresh?: () => void
    enablePolling: boolean
    pollingInterval: number
    onPollingChange: (enabled: boolean, interval: number) => void
    defaultValues?: Partial<AttackEventQueryFormValues>
}

export function AttackEventFilter({
    onFilter,
    onRefresh,
    enablePolling,
    pollingInterval,
    onPollingChange,
    defaultValues = {}
}: AttackEventFilterProps) {
    const { t } = useTranslation()
    const pollingIntervals = [5, 10, 30, 60]

    const [expanded, setExpanded] = useState(false)

    const form = useForm<AttackEventQueryFormValues>({
        resolver: zodResolver(attackEventQuerySchema),
        defaultValues: {
            srcIp: defaultValues.srcIp || "",
            dstIp: defaultValues.dstIp || "",
            domain: defaultValues.domain || "",
            srcPort: defaultValues.srcPort || undefined,
            dstPort: defaultValues.dstPort || undefined,
            startTime: defaultValues.startTime || "",
            endTime: defaultValues.endTime || "",
            page: 1,
            pageSize: 10
        }
    })

    const handleSubmit = (values: AttackEventQueryFormValues) => {
        onFilter(values)
    }

    const handleReset = () => {
        form.reset({
            srcIp: "",
            dstIp: "",
            domain: "",
            srcPort: undefined,
            dstPort: undefined,
            startTime: "",
            endTime: "",
            page: 1,
            pageSize: 10
        })
        onFilter(form.getValues())
    }

    const handleRefresh = () => {
        if (onRefresh) onRefresh()
    }


    return (
        <Card className="p-4 bg-zinc-50 border-none shadow-none rounded-sm">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpanded(!expanded)}
                                className="flex items-center gap-1 font-medium"
                            >
                                {t('filter')} {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>

                            <div className="flex items-center gap-2 border-l pl-4">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <Switch
                                        checked={enablePolling}
                                        onCheckedChange={(checked) => onPollingChange(checked, pollingInterval)}
                                    />
                                    <span className="text-sm font-medium">{t('autoRefresh')}</span>
                                </div>

                                {enablePolling && (
                                    <Select
                                        value={pollingInterval.toString()}
                                        onValueChange={(value) => onPollingChange(enablePolling, parseInt(value))}
                                    >
                                        <SelectTrigger className="h-8 w-24">
                                            <SelectValue placeholder={t('interval')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pollingIntervals.map(interval => (
                                                <SelectItem key={interval} value={interval.toString()}>
                                                    {interval} {t('seconds')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleReset}
                                className="flex items-center gap-1"
                            >
                                <RotateCcw className="h-3 w-3" />
                                {t('reset')}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRefresh}
                                className="flex items-center gap-1"
                            >
                                <RefreshCw className="h-3 w-3" />
                                {t('refresh')}
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                className="flex items-center gap-1"
                            >
                                <Search className="h-3 w-3" />
                                {t('search')}
                            </Button>
                        </div>
                    </div>

                    {expanded && (
                        <div className="flex flex-wrap gap-3 mt-3">
                            <FormField
                                control={form.control}
                                name="domain"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                                        <FormLabel className="text-xs">{t('attack.url')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('enter.domain')} {...field} className="h-8 text-sm" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="srcIp"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                                        <FormLabel className="text-xs">{t('client.ip')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('enter.ip')} {...field} className="h-8 text-sm" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dstIp"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                                        <FormLabel className="text-xs">{t('server.ip')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('enter.ip')} {...field} className="h-8 text-sm" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="srcPort"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                                        <FormLabel className="text-xs">{t('source.port')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={t('enter.port')}
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                                                className="h-8 text-sm"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="dstPort"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                                        <FormLabel className="text-xs">{t('dest.port')}</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder={t('enter.port')}
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                                                className="h-8 text-sm"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                                        <FormLabel className="text-xs">{t('start.time')}</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} className="h-8 text-sm" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                                        <FormLabel className="text-xs">{t('end.time')}</FormLabel>
                                        <FormControl>
                                            <Input type="datetime-local" {...field} className="h-8 text-sm" />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
                </form>
            </Form>
        </Card>
    )
} 