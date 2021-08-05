import type { ObsModeDetails, SequenceManagerService } from '@tmtsoftware/esw-ts'
import type { TabName } from '../../../containers/observation/ObservationTabs'
import { useSMService } from '../../../contexts/SMContext'
import { useQuery, UseQueryResult } from '../../../hooks/useQuery'
import { groupBy } from '../../../utils/groupBy'
import { errorMessage } from '../../../utils/message'
import { OBS_MODES_DETAILS } from '../../queryKeys'

export type GroupedObsModeDetails = {
  [key in TabName]: ObsModeDetails[]
}

const getObsModesDetails = async (smService: SequenceManagerService): Promise<GroupedObsModeDetails> => {
  const response = await smService.getObsModesDetails()
  if (response._type === 'Failed') return errorMessage(response.msg)
  if (response._type === 'LocationServiceError') return errorMessage(response.reason)

  const grouped = groupBy(response.obsModes, (x) => x.status._type)
  return {
    Running: grouped.get('Configured') || [],
    Configurable: grouped.get('Configurable') || [],
    'Non-configurable': grouped.get('NonConfigurable') || []
  }
}

export const useObsModesDetails = (): UseQueryResult<GroupedObsModeDetails> => {
  const [smContext] = useSMService()
  const smService = smContext?.smService
  return useQuery(OBS_MODES_DETAILS.key, () => smService && getObsModesDetails(smService), {
    // The query will not execute until the smService is resolved
    enabled: !!smService,
    refetchInterval: OBS_MODES_DETAILS.refetchInterval
  })
}
