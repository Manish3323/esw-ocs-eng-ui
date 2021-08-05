import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentId, ObsMode, Prefix, SequencerState } from '@tmtsoftware/esw-ts'
import { Menu } from 'antd'
import { expect } from 'chai'
import React from 'react'
import { deepEqual, verify, when } from 'ts-mockito'
import { ReloadScript } from '../../../../src/features/sm/components/ReloadScript'
import { reloadScriptConstants } from '../../../../src/features/sm/smConstants'
import { mockServices, renderWithAuth } from '../../../utils/test-utils'

describe('Reload script', () => {
  const smService = mockServices.mock.smService
  const obsMode = new ObsMode('Darknight')
  const subsystem = 'ESW'
  const componentId = new ComponentId(new Prefix(subsystem, obsMode.toJSON()), 'Sequencer')

  it(`should return Success when Reload Script is clicked | ESW-502`, async () => {
    when(smService.restartSequencer(subsystem, deepEqual(obsMode))).thenResolve({
      _type: 'Success',
      componentId: componentId
    })

    const running: SequencerState = {
      _type: 'Running'
    }

    renderWithAuth({
      ui: (
        <Menu>
          <ReloadScript sequencerState={running} subsystem={subsystem} obsMode={obsMode.toJSON()} />
        </Menu>
      )
    })

    const reloadScriptItem = screen.getByRole('ReloadScript')
    await waitFor(() => userEvent.click(reloadScriptItem))

    // expect modal to be visible
    const modalTitle = await screen.findByText(
      reloadScriptConstants.getModalTitleWithState(new Prefix(subsystem, obsMode.name).toJSON(), running)
    )
    expect(modalTitle).to.exist

    const document = screen.getByRole('document')
    const reloadConfirm = within(document).getByRole('button', {
      name: reloadScriptConstants.modalOkText
    })
    await waitFor(() => userEvent.click(reloadConfirm))

    await screen.findByText(reloadScriptConstants.getSuccessMessage(`${subsystem}.${obsMode.toJSON()}`))
    await waitFor(
      () =>
        expect(
          screen.queryByText(
            reloadScriptConstants.getModalTitleWithState(new Prefix(subsystem, obsMode.name).toJSON(), running)
          )
        ).to.null
    )
    verify(smService.restartSequencer(subsystem, deepEqual(obsMode))).called()
  })

  it(`should show confirm modal without state when sequencer is not inProgress | ESW-506`, async () => {
    when(smService.restartSequencer(subsystem, deepEqual(obsMode))).thenResolve({
      _type: 'Success',
      componentId: componentId
    })

    const sequencerState: SequencerState = { _type: 'Idle' }

    renderWithAuth({
      ui: (
        <Menu>
          <ReloadScript sequencerState={sequencerState} subsystem={subsystem} obsMode={obsMode.toJSON()} />
        </Menu>
      )
    })

    const reloadScriptItem = screen.getByRole('ReloadScript')
    await waitFor(() => userEvent.click(reloadScriptItem))

    // expect modal to be visible
    const modalTitle = await screen.findByText(
      reloadScriptConstants.getModalTitle(new Prefix(subsystem, obsMode.name).toJSON())
    )
    expect(modalTitle).to.exist

    const document = screen.getByRole('document')
    const reloadConfirm = within(document).getByRole('button', {
      name: reloadScriptConstants.modalOkText
    })
    await waitFor(() => userEvent.click(reloadConfirm))

    await screen.findByText(reloadScriptConstants.getSuccessMessage(`${subsystem}.${obsMode.toJSON()}`))
    verify(smService.restartSequencer(subsystem, deepEqual(obsMode))).called()
  })
})
