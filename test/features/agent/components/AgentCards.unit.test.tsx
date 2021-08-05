import { cleanup, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AgentStatus, ComponentId, Prefix } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { deepEqual, verify, when } from 'ts-mockito'
import {
  disabledSequencerActions,
  killSequenceComponentConstants,
  spawnSequenceComponentConstants
} from '../../../../src/features/agent/agentConstants'
import { AgentCards } from '../../../../src/features/agent/components/AgentCards'
import { reloadScriptConstants, stopSequencerConstants } from '../../../../src/features/sm/smConstants'
import {
  getAgentStatusMock,
  mockServices,
  renderWithAuth,
  sequencerServiceMock,
  sequencerServiceMockIris
} from '../../../utils/test-utils'

const emptyAgentStatus: AgentStatus = {
  agentId: new ComponentId(Prefix.fromString('ESW.machine2'), 'Machine'),
  seqCompsStatus: []
}
const agentStatus: AgentStatus = getAgentStatusMock()

describe('Agents Grid View', () => {
  const agentService = mockServices.mock.agentService
  afterEach(() => {
    cleanup()
  })

  it('should render agents when getAgentStatus returns agents | ESW-443', async () => {
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus],
      seqCompsWithoutAgent: []
    })
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })

    await screen.findByText('ESW.machine1')
    expect(screen.getByText('ESW.machine1')).exist
    expect(screen.getByText('ESW.ESW1')).exist
    expect(screen.getByText('ESW.ESW2')).exist
    expect(screen.getByText('[ESW.darkNight]')).exist
    expect(screen.getAllByRole('sequenceCompActions')).length(1)
    expect(screen.getAllByRole('sequencerActions')).length(1)
    expect(screen.getByRole('addSeqCompIcon')).exist

    verify(agentService.getAgentStatus()).called()
  })

  it('should render multiple agents', async () => {
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus, emptyAgentStatus],
      seqCompsWithoutAgent: []
    })
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })

    await screen.findByText('ESW.machine1')
    expect(screen.getByText('ESW.machine1')).exist
    expect(screen.getByText('ESW.machine2')).exist
    expect(screen.getAllByRole('sequenceCompActions')).length(1)
    expect(screen.getAllByRole('sequencerActions')).length(1)
    expect(screen.getAllByRole('addSeqCompIcon')).length(2)
    verify(agentService.getAgentStatus()).called()
  })

  it('should render agents when getAgentStatus returns orphan seqComps | ESW-443', async () => {
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus],
      seqCompsWithoutAgent: [
        {
          seqCompId: new ComponentId(Prefix.fromString('IRIS.comp1'), 'SequenceComponent'),
          sequencerLocation: [
            {
              _type: 'AkkaLocation',
              connection: {
                componentType: 'Sequencer',
                connectionType: 'akka',
                prefix: Prefix.fromString('IRIS.clearskies')
              },
              metadata: {},
              uri: ''
            }
          ]
        },
        {
          seqCompId: new ComponentId(Prefix.fromString('TCS.comp1'), 'SequenceComponent'),
          sequencerLocation: []
        }
      ]
    })
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })

    await screen.findByText('ESW.machine1')
    expect(screen.getByText('ESW.machine1')).exist
    expect(screen.getByText('IRIS.comp1')).exist
    expect(screen.getByText('Unknown')).exist
    expect(screen.getByText('IRIS.comp1')).exist
    expect(screen.getByText('[IRIS.clearskies]')).exist
    expect(screen.getByText('TCS.comp1')).exist
    verify(agentService.getAgentStatus()).called()
  })

  it('should not render agents when getAgentStatus returns locationServiceError | ESW-443', async () => {
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'LocationServiceError',
      reason: 'Failed to fetch agents location'
    })
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })
    expect(screen.queryByText('ESW.machine1')).null
    expect(screen.queryByText('IRIS.comp1')).null
    expect(screen.queryByText('unknown')).null
    verify(agentService.getAgentStatus()).called()
  })

  it('should not render agents when getAgentStatus returns unhandled error | ESW-443', async () => {
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Unhandled',
      msg: 'failed to process getAgentStatus',
      messageType: 'ServiceError',
      state: ''
    })
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })
    expect(screen.queryByText('ESW.machine1')).null
    expect(screen.queryByText('IRIS.comp1')).null
    expect(screen.queryByText('unknown')).null
    verify(agentService.getAgentStatus()).called()
  })

  it('should add sequence components on agent| ESW-446', async () => {
    when(
      agentService.spawnSequenceComponent(deepEqual(Prefix.fromString('ESW.machine1')), deepEqual('ESW_1'))
    ).thenResolve({ _type: 'Spawned' })

    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus],
      seqCompsWithoutAgent: []
    })

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })
    const icon = await screen.findByRole('addSeqCompIcon')

    userEvent.click(icon)
    const inputBox = await screen.findByText('Add a sequence component')
    expect(inputBox).to.exist
    const textBox = screen.getByRole('textbox')

    await waitFor(() => userEvent.click(textBox))
    userEvent.type(textBox, 'ESW_1')
    userEvent.click(screen.getByRole('button', { name: spawnSequenceComponentConstants.modalOkText }))

    await screen.findByText(spawnSequenceComponentConstants.getSuccessMessage('ESW.ESW_1'))

    verify(agentService.getAgentStatus()).called()
  })

  it('should kill sequence components on agent| ESW-446,  ESW-502', async () => {
    const seqCompPrefix = new Prefix('ESW', 'ESW2')
    when(agentService.killComponent(deepEqual(new ComponentId(seqCompPrefix, 'SequenceComponent')))).thenResolve({
      _type: 'Killed'
    })

    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus],
      seqCompsWithoutAgent: []
    })

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })
    // first find the dropdown menu
    const sequenceCompActions = await screen.findByRole('sequenceCompActions')
    await waitFor(() => userEvent.click(sequenceCompActions))

    const killSequenceComponent = await screen.findByText(killSequenceComponentConstants.menuItemText)
    await waitFor(() => userEvent.click(killSequenceComponent))
    await screen.findByText(killSequenceComponentConstants.getModalTitle(seqCompPrefix.toJSON()))

    const document = screen.getByRole('document')
    const confirm = within(document).getByRole('button', { name: killSequenceComponentConstants.modalOkText })

    userEvent.click(confirm)

    await screen.findByText(killSequenceComponentConstants.getSuccessMessage('ESW.ESW2'))

    verify(agentService.getAgentStatus()).called()
  })

  it('should display menu items applicable to sequence components| ESW-502', async () => {
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus],
      seqCompsWithoutAgent: []
    })

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })
    // first find the dropdown menu
    const sequenceCompActions = await screen.findByRole('sequenceCompActions')
    await waitFor(() => userEvent.click(sequenceCompActions))

    // checking different menu items for sequencers and sequence components
    await waitFor(() => expect(screen.queryByText(killSequenceComponentConstants.menuItemText)).to.exist)
    await waitFor(() => expect(screen.queryByText(disabledSequencerActions.displayMessage)).to.exist)
    await waitFor(() => expect(screen.queryByText(reloadScriptConstants.menuItemText)).to.null)
  })

  it('should display menu items applicable to sequencer | ESW-502, ESW-506', async () => {
    const agentStatus = getAgentStatusMock('IRIS')
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus],
      seqCompsWithoutAgent: []
    })
    when(sequencerServiceMock.getSequencerState()).thenResolve({
      _type: 'Running'
    })
    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })
    // first find the dropdown menu
    const sequenceCompActions = await screen.findByRole('sequencerActions')
    await waitFor(() => userEvent.click(sequenceCompActions))

    // checking different menu items for sequencers and sequence components
    await screen.findByText(killSequenceComponentConstants.menuItemText)
    await screen.findByText(reloadScriptConstants.menuItemText)
    await screen.findByText(stopSequencerConstants.menuItemText)
    await waitFor(() => expect(screen.queryByText(disabledSequencerActions.displayMessage)).to.null)
    verify(sequencerServiceMock.getSequencerState()).called()
    verify(sequencerServiceMockIris.getSequencerState()).never()
  })

  it('should change the location on click of sequencer | ESW-492', async () => {
    when(agentService.getAgentStatus()).thenResolve({
      _type: 'Success',
      agentStatus: [agentStatus],
      seqCompsWithoutAgent: []
    })

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <AgentCards />
        </BrowserRouter>
      )
    })

    const sequencer = await screen.findByText('[ESW.darkNight]')
    userEvent.click(sequencer)

    expect(window.location.pathname).to.equal('/sequencer')
    expect(window.location.search).to.equal('?prefix=ESW.darkNight')

    verify(agentService.getAgentStatus()).called()
  })
})
