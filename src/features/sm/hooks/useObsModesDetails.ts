import type { ObsModesDetailsResponseSuccess } from '@tmtsoftware/esw-ts'
import { useQuery, UseQueryResult } from '../../../hooks/useQuery'
import { errorMessage } from '../../../utils/message'
import { OBS_MODES_DETAILS_KEY } from '../../queryKeys'
import { useSMService } from '../hooks/useSMService'

export const useObsModesDetails = (): UseQueryResult<ObsModesDetailsResponseSuccess> => {
  const { data: smService } = useSMService(false)

  return useQuery(
    OBS_MODES_DETAILS_KEY,
    async () => {
      const response = await smService?.getObsModesDetails()
      if (response?._type === 'Failed') {
        return errorMessage(response.msg)
      }
      if (response?._type === 'LocationServiceError') {
        return errorMessage(response.reason)
      }
      return response
    },
    {
      // The query will not execute until the smService is resolved
      enabled: !!smService
    }
  )
}
