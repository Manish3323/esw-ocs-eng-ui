import { render, screen, waitFor } from '@testing-library/react'
import { GATEWAY_CONNECTION, HttpLocation, ServiceError } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { anything, verify, when } from 'ts-mockito'
import { LocationServiceProvider } from '../../../src/contexts/LocationServiceContext'
import { createServiceCtx } from '../../../src/contexts/utils/createServiceCtx'
import { mockServices } from '../../utils/test-utils'
const gatewayLocation: HttpLocation = {
  _type: 'HttpLocation',
  connection: GATEWAY_CONNECTION,
  uri: 'http://localhost:5000/',
  metadata: { agentPrefix: 'ESW.primary' }
}
const serviceInstance = 'dummyService'

const factory = () => {
  return serviceInstance
}
const [useContext, Provider] = createServiceCtx(GATEWAY_CONNECTION, factory)

const Component = (): JSX.Element => {
  const [str] = useContext()
  return <span>{str ? str : 'Unknown'}</span>
}
const renderComponentWithMockLocatonService = () => {
  return render(
    <LocationServiceProvider locationService={mockServices.instance.locationService}>
      <Provider>
        <Component />
      </Provider>
    </LocationServiceProvider>
  )
}

describe('Service context helper', () => {
  it('returns undefined for a provided factory with use hook | ESW-491', async () => {
    when(mockServices.mock.locationService.track(anything())).thenReturn(() => {
      return {
        cancel: () => ({})
      }
    })

    renderComponentWithMockLocatonService()

    await waitFor(() => {
      expect(screen.getByText('Unknown')).to.exist
    })

    verify(mockServices.mock.locationService.track(anything())).called()
  })

  it('returns instance of a provided factory with use hook | ESW-491', async () => {
    when(mockServices.mock.locationService.track(anything())).thenReturn((cb) => {
      cb({ _type: 'LocationUpdated', location: gatewayLocation })
      return {
        cancel: () => ({})
      }
    })

    renderComponentWithMockLocatonService()

    await waitFor(() => {
      expect(screen.getByText(serviceInstance)).to.exist
    })

    verify(mockServices.mock.locationService.track(anything())).called()
  })

  it('should render error notification on receiving error | ESW-510', async () => {
    when(mockServices.mock.locationService.track(anything())).thenReturn((_, onError) => {
      onError &&
        onError(
          ServiceError.make(500, 'server error', {
            message: 'location service failed to track connection'
          })
        )
      return {
        cancel: () => ({})
      }
    })

    renderComponentWithMockLocatonService()

    await screen.findByText('location service failed to track connection')

    verify(mockServices.mock.locationService.track(anything())).called()
  })
})
