import type { Prefix, SequencerStateResponse } from '@tmtsoftware/esw-ts'
import { useEffect, useState } from 'react'
import { useGatewayLocation } from '../../../contexts/GatewayServiceContext'
import { useAuth } from '../../../hooks/useAuth'
import { createTokenFactory } from '../../../utils/createTokenFactory'
import { errorMessage } from '../../../utils/message'
import { mkSequencerService } from '../hooks/useSequencerService'

export type SequencerStateSubscriptionResponse = {
  sequencerStateResponse: SequencerStateResponse | undefined
  loading: boolean
}

export const useSequencerStateSubscription = (prefix: Prefix): SequencerStateSubscriptionResponse => {
  const [sequencerStateResponse, setSequencerStateResponse] = useState<SequencerStateResponse | undefined>(undefined)
  const [gatewayLocation] = useGatewayLocation()
  const { auth } = useAuth()
  const tokenFactory = createTokenFactory(auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const seqService = gatewayLocation && mkSequencerService(prefix, gatewayLocation, tokenFactory)

    const subscription = seqService?.subscribeSequencerState()(
      (sequencerStateResponse: SequencerStateResponse) => {
        setLoading(false)
        setSequencerStateResponse(sequencerStateResponse)
      },
      (error) => {
        errorMessage(error.message)
        setLoading(false)
      }
    )
    return subscription?.cancel
  }, [gatewayLocation, prefix, tokenFactory, setLoading])

  return { sequencerStateResponse, loading }
}
