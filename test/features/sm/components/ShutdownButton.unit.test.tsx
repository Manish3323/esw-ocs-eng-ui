import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect } from 'chai'
import React from 'react'
import { verify, when } from 'ts-mockito'
import { ShutdownSMButton } from '../../../../src/features/sm/components/ShutdownButton'
import { SM_COMPONENT_ID } from '../../../../src/features/sm/constants'
import { mockServices, renderWithAuth } from '../../../utils/test-utils'

describe('ShutdownSMButton', () => {
  it('should shutdown the sequence manager | ESW-441', async () => {
    const modalTitle = 'Do you want to shutdown Sequence Manager?'

    const agentServiceMock = mockServices.mock.agentService

    when(agentServiceMock.killComponent(SM_COMPONENT_ID)).thenResolve({
      _type: 'Killed'
    })

    renderWithAuth({
      ui: <ShutdownSMButton />
    })

    const shutdownButton = await screen.findByRole('button', {
      name: 'Shutdown'
    })

    //User clicks shutdown button
    userEvent.click(shutdownButton)

    //Modal will appear with shutdown button
    await waitFor(() => expect(screen.getByText(modalTitle)).to.exist)
    const modalDocument = screen.getByRole('document')
    const modalShutdownButton = within(modalDocument).getByRole('button', {
      name: 'Shutdown'
    })

    //User clicks modal's shutdown button
    userEvent.click(modalShutdownButton)
    await screen.findByText('Successfully shutdown Sequence Manager')

    await waitFor(() => {
      expect(screen.queryByText(modalTitle)).to.null
    })
    verify(agentServiceMock.killComponent(SM_COMPONENT_ID)).called()
  })

  it('should show notification if sequence manager shutdown fails | ESW-441', async () => {
    const agentServiceMock = mockServices.mock.agentService

    when(agentServiceMock.killComponent(SM_COMPONENT_ID)).thenResolve({
      _type: 'Failed',
      msg: 'Cant kill'
    })

    renderWithAuth({
      ui: <ShutdownSMButton />
    })

    const shutdownButton = await screen.findByRole('button', {
      name: 'Shutdown'
    })

    //User clicks shutdown button
    userEvent.click(shutdownButton)

    //Modal will appear with shutdown button
    const modalDocument = await screen.findByRole('document')
    const modalShutdownButton = within(modalDocument).getByRole('button', {
      name: 'Shutdown'
    })

    //User clicks modal's shutdown button
    userEvent.click(modalShutdownButton)
    await screen.findByText('Failed to shutdown Sequence Manager, reason: Cant kill')

    verify(agentServiceMock.killComponent(SM_COMPONENT_ID)).called()
  })
})
