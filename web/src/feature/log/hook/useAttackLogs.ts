import { useQuery } from '@tanstack/react-query'
import { wafApi } from '@/api/services'
import { AttackLogQuery } from '@/types/waf'

export const useAttackLogs = (query: AttackLogQuery) => {
  return useQuery({
    queryKey: ['attackLogs', query],
    queryFn: () => wafApi.getAttackLogs(query),
    placeholderData: (previousData) => previousData,
  })
} 