import { useQuery } from '@tanstack/react-query'
import { wafApi } from '@/api/services'
import { AttackLogQuery, AttackLogResponse } from '@/types/waf'

export const useAttackLogs = (query: AttackLogQuery) => {
  return useQuery<AttackLogResponse, Error, AttackLogResponse, [string, AttackLogQuery]>({
    queryKey: ['attackLogs', query],
    queryFn: () => wafApi.getAttackLogs(query),
    placeholderData: (previousData) => previousData,
  })
} 