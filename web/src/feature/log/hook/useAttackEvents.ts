import { useQuery } from '@tanstack/react-query'
import { wafApi } from '@/api/services'
import { AttackEventQuery, AttackEventResponse } from '@/types/waf'

export const useAttackEvents = (query: AttackEventQuery) => {
  return useQuery<AttackEventResponse, Error, AttackEventResponse, [string, AttackEventQuery]>({
    queryKey: ['attackEvents', query],
    queryFn: () => wafApi.getAttackEvents(query),
    placeholderData: (previousData) => previousData,
  })
}