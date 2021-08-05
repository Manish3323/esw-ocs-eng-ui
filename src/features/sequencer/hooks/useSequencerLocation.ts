import { AkkaConnection, Prefix, Location } from '@tmtsoftware/esw-ts'
import { useQuery, UseQueryResult } from 'react-query'
import { useLocationService } from '../../../contexts/LocationServiceContext'
import { SEQUENCER_LOCATION } from '../../queryKeys'

export const useSequencerLocation = (prefix: Prefix): UseQueryResult<Location> => {
  const locationService = useLocationService()
  return useQuery([SEQUENCER_LOCATION.key, prefix.toJSON()], {
    queryFn: () => locationService.find(AkkaConnection(prefix, 'Sequencer'))
  })
}
