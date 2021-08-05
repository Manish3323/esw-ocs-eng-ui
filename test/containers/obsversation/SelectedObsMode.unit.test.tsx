import { screen, waitFor, within } from '@testing-library/react'
import {
  AkkaConnection,
  AkkaLocation,
  ObsMode,
  ObsModeDetails,
  ObsModesDetailsResponseSuccess,
  Prefix,
  SequencerStateResponse,
  ServiceError,
  StepList,
  TrackingEvent
} from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { deepEqual, reset, verify, when } from 'ts-mockito'
import { SelectedObsMode } from '../../../src/containers/observation/SelectedObsMode'
import { sequencerActionConstants } from '../../../src/features/sm/smConstants'
import { mockServices, renderWithAuth, sequencerServiceMock } from '../../utils/test-utils'

describe('CurrentObsMode', () => {
  beforeEach(() => {
    reset(mockServices.mock.smService)
    reset(sequencerServiceMock)
  })

  const eswSequencerPrefix = new Prefix('ESW', 'DarkNight_1')
  const eswSequencerConnection = AkkaConnection(eswSequencerPrefix, 'Sequencer')
  const eswSequencerLocation: AkkaLocation = {
    _type: 'AkkaLocation',
    connection: eswSequencerConnection,
    uri: 'http://localhost:5000/',
    metadata: {}
  }

  const darknightObsModeDetails: ObsModeDetails = {
    obsMode: new ObsMode('DarkNight_1'),
    status: {
      _type: 'Configured'
    },
    resources: ['ESW'],
    sequencers: ['ESW']
  }

  const obsModes: ObsModeDetails[] = [darknightObsModeDetails]
  const obsModesData: ObsModesDetailsResponseSuccess = { _type: 'Success', obsModes: obsModes }

  const sequencerStateResponse: SequencerStateResponse = {
    _type: 'SequencerStateResponse',
    sequencerState: { _type: 'Loaded' },
    stepList: new StepList([])
  }

  it(`should call cancel subscription method on unmount | ESW-489`, async (done) => {
    const { smService, locationService } = mockServices.mock

    when(smService.getObsModesDetails()).thenResolve(obsModesData)

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn(() => {
      return { cancel: done }
    })

    when(locationService.track(deepEqual(eswSequencerConnection))).thenReturn((cb) => {
      cb({ _type: 'LocationUpdated', location: eswSequencerLocation })
      return {
        cancel: () => ({})
      }
    })

    const { unmount } = renderWithAuth({
      ui: <SelectedObsMode resources={[]} currentTab='Running' obsModeDetails={darknightObsModeDetails} />
    })

    verify(locationService.track(deepEqual(eswSequencerConnection))).once()

    unmount()
  })
  it(`should render error notification when error is received | ESW-510`, async () => {
    const { smService, locationService } = mockServices.mock
    when(smService.getObsModesDetails()).thenResolve(obsModesData)

    when(locationService.track(deepEqual(eswSequencerConnection))).thenReturn((cb) => {
      cb({ _type: 'LocationUpdated', location: eswSequencerLocation })
      return {
        cancel: () => ({})
      }
    })

    when(sequencerServiceMock.subscribeSequencerState()).thenReturn((_, onError) => {
      onError &&
        onError(
          ServiceError.make(500, 'server error', {
            message: 'Sequencer not found'
          })
        )
      return {
        cancel: () => undefined
      }
    })

    renderWithAuth({
      ui: <SelectedObsMode resources={[]} currentTab='Running' obsModeDetails={darknightObsModeDetails} />
    })

    await screen.findByText('Sequencer not found')
  })

  it(`should render reload script button when sequencer becomes available | ESW-506`, async () => {
    const { smService, locationService } = mockServices.mock
    when(smService.getObsModesDetails()).thenResolve(obsModesData)
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn((cb) => {
      cb(sequencerStateResponse)
      return {
        cancel: () => undefined
      }
    })

    when(locationService.track(deepEqual(eswSequencerConnection))).thenReturn((cb) => {
      sendEvent(cb, { _type: 'LocationUpdated', location: eswSequencerLocation }, 400)
      return {
        cancel: () => ({})
      }
    })

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SelectedObsMode resources={[]} currentTab='Running' obsModeDetails={darknightObsModeDetails} />
        </BrowserRouter>
      )
    })

    const sequencerCell = /setting esw\.darknight_1 close/i
    const row = await screen.findByRole('row', { name: /esw\.darknight_1/i })

    //checks that sequencer is not running
    await within(row).findByRole('cell', { name: sequencerCell })
    await within(row).findByText(sequencerActionConstants.startSequencer)

    //checks that sequencer is up and running
    await waitFor(() => expect(within(row).queryByRole('cell', { name: sequencerCell })).to.not.exist)
    await within(row).findByText(sequencerActionConstants.reloadScript)
  })

  it('should update sequencer table if sequencer is stopped in background | ESW-506', async () => {
    const { smService, locationService } = mockServices.mock
    when(smService.getObsModesDetails()).thenResolve(obsModesData)
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn((cb) => {
      cb(sequencerStateResponse)
      return {
        cancel: () => undefined
      }
    })

    when(locationService.track(deepEqual(eswSequencerConnection))).thenReturn((cb) => {
      sendEvent(cb, { _type: 'LocationUpdated', location: eswSequencerLocation })
      sendEvent(cb, { _type: 'LocationRemoved', connection: eswSequencerConnection }, 400)
      return {
        cancel: () => ({})
      }
    })

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SelectedObsMode resources={[]} currentTab='Running' obsModeDetails={darknightObsModeDetails} />
        </BrowserRouter>
      )
    })

    const sequencerCell = /setting esw\.darknight_1 close/i
    const row = await screen.findByRole('row', { name: /esw\.darknight_1/i })

    //checks that sequencer is up and running
    await waitFor(() => expect(within(row).queryByRole('cell', { name: sequencerCell })).to.not.exist)
    await within(row).findByText(sequencerActionConstants.reloadScript)

    //checks that sequencer is not running
    await within(row).findByRole('cell', { name: sequencerCell })
    await within(row).findByText(sequencerActionConstants.startSequencer)
  })
})

const sendEvent = (
  callback: (trackingEvent: TrackingEvent) => void,
  state: TrackingEvent,
  timeout?: number | undefined
) => {
  timeout ? setTimeout(() => callback(state), timeout) : callback(state)
}
