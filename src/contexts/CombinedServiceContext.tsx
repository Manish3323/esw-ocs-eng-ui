import type { LocationService } from '@tmtsoftware/esw-ts'
import React, { PropsWithChildren } from 'react'
import { AgentServiceProvider } from './AgentServiceContext'
import { GatewayLocationProvider } from './GatewayServiceContext'
import { LocationServiceProvider } from './LocationServiceContext'
import { SMServiceProvider } from './SMContext'

export const CombinedServiceContext = ({
  children,
  locationService
}: PropsWithChildren<{ locationService: LocationService }>): JSX.Element => (
  <LocationServiceProvider locationService={locationService}>
    <GatewayLocationProvider>
      <AgentServiceProvider>
        <SMServiceProvider>{children}</SMServiceProvider>
      </AgentServiceProvider>
    </GatewayLocationProvider>
  </LocationServiceProvider>
)
