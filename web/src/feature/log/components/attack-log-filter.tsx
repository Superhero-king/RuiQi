import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { attackLogQuerySchema, AttackLogQueryFormValues } from "@/validation/waf"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card } from "@/components/ui/card"
import { Search, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useState } from "react"

interface AttackLogFilterProps {
  onFilter: (values: AttackLogQueryFormValues) => void
  defaultValues?: Partial<AttackLogQueryFormValues>
}

export function AttackLogFilter({ onFilter, defaultValues = {} }: AttackLogFilterProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  
  const form = useForm<AttackLogQueryFormValues>({
    resolver: zodResolver(attackLogQuerySchema),
    defaultValues: {
      ruleId: defaultValues.ruleId || undefined,
      srcIp: defaultValues.srcIp || "",
      dstIp: defaultValues.dstIp || "",
      domain: defaultValues.domain || "",
      srcPort: defaultValues.srcPort || undefined,
      dstPort: defaultValues.dstPort || undefined,
      requestId: defaultValues.requestId || "",
      startTime: defaultValues.startTime || "",
      endTime: defaultValues.endTime || "",
      page: 1,
      pageSize: 10
    }
  })

  const handleSubmit = (values: AttackLogQueryFormValues) => {
    onFilter(values)
  }

  const handleReset = () => {
    form.reset({
      ruleId: undefined,
      srcIp: "",
      dstIp: "",
      domain: "",
      srcPort: undefined,
      dstPort: undefined,
      requestId: "",
      startTime: "",
      endTime: "",
      page: 1,
      pageSize: 10
    })
    onFilter(form.getValues())
  }

  return (
    <Card className="p-3">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex items-center justify-between mb-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 font-medium"
            >
              {t('filters')} {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                {t('reset')}
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
                name="ruleId"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                    <FormLabel className="text-xs">Rule ID</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={t('enter.rule.id')} 
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
                name="domain"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                    <FormLabel className="text-xs">{t('domain')}</FormLabel>
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
                name="requestId"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full sm:w-[calc(50%-0.375rem)] md:w-[calc(33.33%-0.5rem)] lg:w-[calc(20%-0.6rem)]">
                    <FormLabel className="text-xs">{t('request.id')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('enter.request.id')} {...field} className="h-8 text-sm" />
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