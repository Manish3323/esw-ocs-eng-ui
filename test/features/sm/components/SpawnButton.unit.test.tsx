import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { HttpLocation } from '@tmtsoftware/esw-ts'
import { HttpConnection, Prefix } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { anything, capture, when } from 'ts-mockito'
import { SpawnSMButton } from '../../../../src/features/sm/components/SpawnButton'
import { OBS_MODE_CONFIG } from '../../../../src/features/sm/constants'
import {
  getMockServices,
  locServiceMock,
  renderWithAuth
} from '../../../utils/test-utils'

describe('SpawnSMButton', () => {
  it('should spawn the sequence manager | ESW-441', async () => {
    const mockServices = getMockServices()
    const agentServiceMock = mockServices.mock.agentService
    const agentPrefix = new Prefix('ESW', 'ESW.Machine1')
    const agentLocation: HttpLocation = {
      _type: 'HttpLocation',
      connection: HttpConnection(agentPrefix, 'Service'),
      uri: 'url',
      metadata: {}
    }

    when(locServiceMock.listByComponentType('Machine')).thenResolve([
      agentLocation
    ])

    when(
      agentServiceMock.spawnSequenceManager(anything(), OBS_MODE_CONFIG, false)
    ).thenResolve({ _type: 'Spawned' })

    renderWithAuth({
      ui: <SpawnSMButton />,
      mockClients: mockServices
    })

    //User clicks spawn button
    const spawnButton = await screen.findByRole('button', { name: 'Spawn' })
    userEvent.click(spawnButton)

    //modal will appear with spawn button
    await screen.findByText('Choose an agent to spawn the Sequence Manager')

    const modalDocument = screen.getByRole('document')
    const modalSpawnButton = within(modalDocument).getByRole('button', {
      name: 'Spawn'
    })

    //User selects agent machine
    userEvent.click(
      within(modalDocument).getByRole('menuitem', {
        name: agentPrefix.toJSON()
      })
    )

    //User clicks modal's spawn button
    userEvent.click(modalSpawnButton)

    await screen.findByText('Successfully spawned Sequence Manager')

    const [prefix, expectedConfig, isLocal] = capture(
      agentServiceMock.spawnSequenceManager
    ).first()

    expect(prefix.toJSON()).eq(agentPrefix.toJSON())
    expect(expectedConfig).eq(OBS_MODE_CONFIG)
    expect(isLocal).to.false
  })

  it('should show error message if no agents are present and user tries spawning machine | ESW-441', async () => {
    const mockServices = getMockServices()
    when(locServiceMock.listByComponentType('Machine')).thenResolve([])

    renderWithAuth({
      ui: <SpawnSMButton />,
      mockClients: mockServices
    })

    //User clicks spawn button
    const spawnButton = await screen.findByRole('button', { name: 'Spawn' })
    userEvent.click(spawnButton)

    await screen.findByText(
      'Agents are not running. Please start an agent first.'
    )

    await waitFor(
      () =>
        expect(
          screen.queryByText('Choose an agent to spawn the Sequence Manager')
        ).not.exist
    )
  })

  it('should show notification if spawning sequence manager fails | ESW-441', async () => {
    const mockServices = getMockServices()
    const agentServiceMock = mockServices.mock.agentService
    const agentPrefix = new Prefix('ESW', 'ESW.Machine1')
    const agentLocation: HttpLocation = {
      _type: 'HttpLocation',
      connection: HttpConnection(agentPrefix, 'Service'),
      uri: 'url',
      metadata: {}
    }

    when(locServiceMock.listByComponentType('Machine')).thenResolve([
      agentLocation
    ])

    when(
      agentServiceMock.spawnSequenceManager(anything(), OBS_MODE_CONFIG, false)
    ).thenResolve({ _type: 'Failed', msg: 'Config file not found' })

    renderWithAuth({
      ui: <SpawnSMButton />,
      mockClients: mockServices
    })

    //User clicks spawn button
    const spawnButton = await screen.findByRole('button', { name: 'Spawn' })
    userEvent.click(spawnButton)

    //modal will appear with spawn button
    await screen.findByText('Choose an agent to spawn the Sequence Manager')

    const modalDocument = screen.getByRole('document')
    const modalSpawnButton = within(modalDocument).getByRole('button', {
      name: 'Spawn'
    })

    //User selects agent machine
    userEvent.click(
      within(modalDocument).getByRole('menuitem', {
        name: agentPrefix.toJSON()
      })
    )

    //User clicks modal's spawn button
    userEvent.click(modalSpawnButton)

    await screen.findByText(
      'Sequence Manager could not be spawned. Please try again., reason: Config file not found'
    )
  })
})
