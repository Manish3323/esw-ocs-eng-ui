import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'chai'
import React from 'react'
import { verify, when } from 'ts-mockito'
import { ShutdownSMButton } from '../../../../../src/features/sm/components/shutdown/ShutdownButton'
import { SM_COMPONENT_ID } from '../../../../../src/features/sm/constants'
import { getMockServices, renderWithAuth } from '../../../../utils/test-utils'

describe('ShutdownSMButton', () => {
  it('should shutdown the sequence manager | ESW-441', async () => {
    const modalTitle = 'Do you want to shutdown Sequence Manager?'
    const mockServices = getMockServices()
    const agentServiceMock = mockServices.mock.agentService

    when(agentServiceMock.killComponent(SM_COMPONENT_ID)).thenResolve({
      _type: 'Killed'
    })

    renderWithAuth({
      ui: <ShutdownSMButton />,
      mockClients: mockServices.serviceFactoryContext
    })

    const shutdownButton = await screen.findByRole('button', {
      name: /shutdown/i
    })

    //User clicks shutdown button
    userEvent.click(shutdownButton)

    //Modal will appear with shutdown button
    await waitFor(() => expect(screen.getByText(modalTitle)).to.exist)
    const modalDocument = screen.getByRole('document')
    const modalShutdownButton = within(modalDocument).getByRole('button', {
      name: /shutdown/i
    })

    //User clicks modal's shutdown button
    userEvent.click(modalShutdownButton)

    await waitFor(() => {
      expect(screen.getByText('Successfully shutdown Sequence Manager')).to
        .exist
    })
    await waitFor(() => {
      expect(screen.queryByText(modalTitle)).to.null
    })
    verify(agentServiceMock.killComponent(SM_COMPONENT_ID)).called()
  })

  it('should show notification if sequence manager shutdown fails | ESW-441', async () => {
    const mockServices = getMockServices()
    const agentServiceMock = mockServices.mock.agentService

    when(agentServiceMock.killComponent(SM_COMPONENT_ID)).thenResolve({
      _type: 'Failed',
      msg: 'Cant kill'
    })

    renderWithAuth({
      ui: <ShutdownSMButton />,
      mockClients: mockServices.serviceFactoryContext
    })

    const shutdownButton = await screen.findByRole('button', {
      name: /shutdown/i
    })

    //User clicks shutdown button
    userEvent.click(shutdownButton)

    //Modal will appear with shutdown button
    const modalDocument = await screen.findByRole('document')
    const modalShutdownButton = within(modalDocument).getByRole('button', {
      name: /shutdown/i
    })

    //User clicks modal's shutdown button
    userEvent.click(modalShutdownButton)

    await waitFor(() => {
      expect(
        screen.getByText(
          'Failed to shutdown Sequence Manager, reason: Cant kill'
        )
      ).to.exist
    })

    verify(agentServiceMock.killComponent(SM_COMPONENT_ID)).called()
  })
})
