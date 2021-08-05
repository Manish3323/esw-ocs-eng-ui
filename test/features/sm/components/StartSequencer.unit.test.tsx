import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentId, ObsMode, Prefix } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { deepEqual, reset, verify, when } from 'ts-mockito'
import { StartSequencer } from '../../../../src/features/sm/components/StartSequencer'
import { startSequencerConstants } from '../../../../src/features/sm/smConstants'
import { obsModesData } from '../../../jsons/obsmodes'
import { mockServices, renderWithAuth } from '../../../utils/test-utils'

describe('Start Sequencer', () => {
  const ESW = 'ESW'
  const obsModeName = 'DarkNight_1'
  const obsMode = new ObsMode(obsModeName)
  const smService = mockServices.mock.smService

  const componentId = new ComponentId(new Prefix(ESW, obsModeName), 'Sequencer')

  beforeEach(() => {
    reset(smService)
  })

  it('should start the sequencer for given subsystem and obsmode | ESW-447, ESW-507', async () => {
    when(smService.getObsModesDetails()).thenResolve(obsModesData)
    when(smService.startSequencer(ESW, deepEqual(obsMode))).thenResolve({
      _type: 'Started',
      componentId
    })

    renderWithAuth({ ui: <StartSequencer /> })

    const startSequencerButton = screen.getByRole('button', {
      name: startSequencerConstants.buttonText
    })
    userEvent.click(startSequencerButton)

    const modal = await screen.findByRole('dialog', {
      name: startSequencerConstants.modalTitle
    })
    await enterUserInputInSelect(modal, startSequencerConstants.subsystemInputLabel, 'es', ESW)

    await enterUserInputInAutoComplete(modal, startSequencerConstants.obsModeInputLabel, 'dark', obsModeName)

    const confirmButton = screen.getByRole('button', { name: startSequencerConstants.modalOkText })
    userEvent.click(confirmButton)

    await screen.findByText(startSequencerConstants.successMessage)
    verify(smService.startSequencer(ESW, deepEqual(obsMode))).called()
    await waitFor(() => expect(screen.queryByText(startSequencerConstants.modalTitle)).to.null)
  })

  it('should open modal and render a form containing subsystem and obsmode input| ESW-447', async () => {
    when(smService.getObsModesDetails()).thenResolve(obsModesData)

    renderWithAuth({
      ui: <StartSequencer />
    })

    const startSequencerButton = screen.getByRole('button', { name: startSequencerConstants.buttonText })
    userEvent.click(startSequencerButton)

    const modal = await screen.findByRole('dialog', {
      name: startSequencerConstants.modalTitle
    })

    within(modal).getByRole('combobox', { name: startSequencerConstants.subsystemInputLabel })
    within(modal).getByRole('combobox', { name: startSequencerConstants.obsModeInputLabel })
    within(modal).getByText(startSequencerConstants.subsystemInputPlaceholder)
    within(modal).getByText(startSequencerConstants.obsModeInputPlaceholder)
    within(modal).getByRole('button', { name: startSequencerConstants.modalOkText })
  })
})

const enterUserInputInSelect = async (
  withinElement: HTMLElement,
  label: string,
  userInput: string,
  optionToChoose: string
) => {
  const combobox = within(withinElement).getByRole('combobox', { name: label })
  userEvent.click(combobox)
  userEvent.type(combobox, userInput)
  const option = await screen.findByText(optionToChoose)

  await waitFor(() => userEvent.click(option))
}

const enterUserInputInAutoComplete = async (
  withinElement: HTMLElement,
  label: string,
  userInput: string,
  optionToChoose: string
) => {
  const combobox = within(withinElement).getByRole('combobox', { name: label })
  userEvent.click(combobox)
  userEvent.type(combobox, userInput)

  const obsModeItem = await screen.findAllByText(optionToChoose)
  await waitFor(() => userEvent.click(obsModeItem[1]))
}
