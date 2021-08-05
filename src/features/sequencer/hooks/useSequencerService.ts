import {
  ComponentId,
  createSequencerService,
  Location,
  Prefix,
  SequencerService,
  TokenFactory
} from '@tmtsoftware/esw-ts'
import { useGatewayLocation } from '../../../contexts/GatewayServiceContext'
import { useAuth } from '../../../hooks/useAuth'
import { createTokenFactory } from '../../../utils/createTokenFactory'
import { getUsername } from '../../../utils/getUsername'

export const useSequencerService = (sequencerPrefix: Prefix): SequencerService | undefined => {
  const [gatewayLocation] = useGatewayLocation()
  const { auth } = useAuth()
  const username = getUsername(auth)

  const tf = createTokenFactory(auth)
  return gatewayLocation && mkSequencerService(sequencerPrefix, gatewayLocation, tf, username)
}

// added for testing purpose : checkout /test/mocks/useSequencerService
export const mkSequencerService = (
  sequencerPrefix: Prefix,
  gatewayLocation: Location,
  tokenFactory: TokenFactory,
  username?: string
): SequencerService => {
  const compId = new ComponentId(sequencerPrefix, 'Sequencer')
  return createSequencerService(compId, gatewayLocation, { tokenFactory, username })
}
