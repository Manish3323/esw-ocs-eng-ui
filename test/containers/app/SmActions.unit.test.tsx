import { screen, waitFor } from '@testing-library/react'
import {
  AgentStatus,
  AgentStatusResponse,
  ComponentId,
  ObsMode,
  Prefix,
  SequenceComponentStatus,
  AGENT_SERVICE_CONNECTION,
  CONFIG_CONNECTION,
  SEQUENCE_MANAGER_CONNECTION
} from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { mock, verify, when } from 'ts-mockito'
import { SmActions } from '../../../src/containers/infrastructure/SMActions'
import { configureConstants, provisionConstants, startSequencerConstants } from '../../../src/features/sm/smConstants'
import { mockServices, renderWithAuth } from '../../utils/test-utils'

describe('SM actions', () => {
  const agentService = mockServices.mock.agentService
  const smService = mockServices.mock.smService
  const locServiceMock = mockServices.mock.locationService
  const sequenceComponentStatus = mock<SequenceComponentStatus>()
  when(smService.getObsModesDetails()).thenResolve({
    _type: 'Success',
    obsModes: [
      {
        obsMode: new ObsMode('ESW.darkNight'),
        resources: [],
        sequencers: [],
        status: { _type: 'Configurable' }
      }
    ]
  })
  when(locServiceMock.track(SEQUENCE_MANAGER_CONNECTION)).thenReturn(() => {
    return { cancel: () => ({}) }
  })
  when(locServiceMock.track(AGENT_SERVICE_CONNECTION)).thenReturn(() => {
    return { cancel: () => ({}) }
  })
  when(locServiceMock.track(CONFIG_CONNECTION)).thenReturn(() => {
    return { cancel: () => ({}) }
  })

  const agentStatus: AgentStatus = {
    agentId: new ComponentId(new Prefix('APS', 'jdks'), 'Machine'),
    seqCompsStatus: [sequenceComponentStatus]
  }

  const agentStatusSuccess1: AgentStatusResponse = {
    _type: 'Success',
    agentStatus: [agentStatus],
    seqCompsWithoutAgent: []
  }

  const agentStatusSuccess2: AgentStatusResponse = {
    _type: 'Success',
    agentStatus: [],
    seqCompsWithoutAgent: [sequenceComponentStatus]
  }

  const unProvisionRenderTestData: [AgentStatusResponse, string][] = [
    [agentStatusSuccess1, 'on any agent'],
    [agentStatusSuccess2, 'without any agent']
  ]
  unProvisionRenderTestData.map(([agentStatusResponse, name]) => {
    it(`should render provision button as enabled & configure, start sequencer button as disabled if no seq comps are running ${name} | ESW-442, ESW-445, ESW-447`, async () => {
      when(agentService.getAgentStatus()).thenResolve(agentStatusResponse)

      renderWithAuth({
        ui: <SmActions />
      })

      const provisionButton = screen.getByRole('button', {
        name: provisionConstants.buttonText
      }) as HTMLButtonElement

      const configureButton = screen.getByRole('button', {
        name: configureConstants.buttonText
      }) as HTMLButtonElement

      const startSequencerButton = screen.getByRole('button', {
        name: startSequencerConstants.buttonText
      }) as HTMLButtonElement

      expect(provisionButton.disabled).false
      expect(configureButton.disabled).true
      expect(startSequencerButton.disabled).true

      // wait for both buttons to be enabled once data is loaded in async manner
      await waitFor(() => {
        expect(
          (
            screen.getByRole('button', {
              name: provisionConstants.buttonText
            }) as HTMLButtonElement
          ).disabled
        ).false
      })
      await waitFor(() => {
        expect(
          (
            screen.getByRole('button', {
              name: configureConstants.buttonText
            }) as HTMLButtonElement
          ).disabled
        ).false
      })

      verify(agentService.getAgentStatus()).called()
    })
  })

  it('should render start sequencer button as enabled if sequence component is present on agent', async () => {
    when(agentService.getAgentStatus()).thenResolve(agentStatusSuccess1)

    renderWithAuth({
      ui: <SmActions />
    })

    await waitFor(() => {
      const button = screen.getByRole('button', {
        name: startSequencerConstants.buttonText
      }) as HTMLButtonElement
      expect(button.disabled).false
    })
  })
})
