import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OkOrUnhandledResponse, Prefix } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { reset, verify, when } from 'ts-mockito'
import { StopSequence } from '../../../../../src/features/sequencer/components/actions/StopSequence'
import { stopSequenceConstants } from '../../../../../src/features/sequencer/sequencerConstants'
import { renderWithAuth, sequencerServiceMock } from '../../../../utils/test-utils'

describe('StopSequence', () => {
  const testData: [OkOrUnhandledResponse, string, string][] = [
    [{ _type: 'Ok' }, stopSequenceConstants.successMessage, 'successful'],
    [
      {
        _type: 'Unhandled',
        msg: 'StopSequence message is not handled in Processing state',
        messageType: 'StopSequence',
        state: 'Processing'
      },
      `${stopSequenceConstants.failureMessage}, reason: StopSequence message is not handled in Processing state`,
      'failed'
    ]
  ]

  beforeEach(() => {
    reset(sequencerServiceMock)
  })

  testData.forEach(([res, msg, state]) => {
    it(`should be ${state} if sequencer response is ${res._type}| ESW-500`, async () => {
      when(sequencerServiceMock.stop()).thenResolve(res)

      renderWithAuth({
        ui: <StopSequence prefix={new Prefix('ESW', 'darknight')} isSequencerRunning />
      })

      const stopSeqButton = await screen.findByRole('StopSequence')

      userEvent.click(stopSeqButton, { button: 0 })

      await screen.findByText(stopSequenceConstants.modalTitle)
      const modalConfirmButton = await within(screen.getByRole('document')).findByRole('button', {
        name: stopSequenceConstants.modalOkText
      })

      userEvent.click(modalConfirmButton, { button: 0 })

      await screen.findByText(msg)

      verify(sequencerServiceMock.stop()).called()

      await waitFor(() => expect(screen.queryByText(stopSequenceConstants.modalTitle)).to.not.exist)
    })
  })

  it(`should be failed if stopSequence call fails | ESW-500`, async () => {
    when(sequencerServiceMock.stop()).thenReject(Error('error occurred'))

    renderWithAuth({
      ui: <StopSequence prefix={new Prefix('ESW', 'darknight')} isSequencerRunning />
    })

    //*********testing cancel button ***********************
    const stopSeqButton1 = await screen.findByRole('StopSequence')

    userEvent.click(stopSeqButton1, { button: 0 })
    await screen.findByText(stopSequenceConstants.modalTitle)
    const modalCancelButton = within(screen.getByRole('document')).getByRole('button', {
      name: 'Cancel'
    })
    userEvent.click(modalCancelButton)

    verify(sequencerServiceMock.stop()).never()

    //*********testing stop(confirm) button ***********************
    const stopSeqButton2 = await screen.findByRole('StopSequence')

    userEvent.click(stopSeqButton2, { button: 0 })
    await screen.findByText(stopSequenceConstants.modalTitle)
    const modalConfirmButton = within(screen.getByRole('document')).getByRole('button', {
      name: stopSequenceConstants.modalOkText
    })

    userEvent.click(modalConfirmButton)

    await screen.findByText(`${stopSequenceConstants.failureMessage}, reason: error occurred`)

    verify(sequencerServiceMock.stop()).called()
  })

  it(`should be disabled if sequencer is not running | ESW-500`, async () => {
    renderWithAuth({
      ui: <StopSequence prefix={new Prefix('ESW', 'darknight')} isSequencerRunning={false} />
    })

    const stopSeqButton = (await screen.findByRole('StopSequence')) as HTMLButtonElement

    expect(stopSeqButton.disabled).true
  })
})
