import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OkOrUnhandledResponse, Prefix } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { reset, verify, when } from 'ts-mockito'
import { AbortSequence } from '../../../../../src/features/sequencer/components/actions/AbortSequence'
import { abortSequenceConstants } from '../../../../../src/features/sequencer/sequencerConstants'
import { renderWithAuth, sequencerServiceMock } from '../../../../utils/test-utils'

describe('AbortSequence', () => {
  const testData: [OkOrUnhandledResponse, string, string][] = [
    [{ _type: 'Ok' }, abortSequenceConstants.successMessage, 'successful'],
    [
      {
        _type: 'Unhandled',
        msg: 'AbortSequence message is not handled in InProgress state',
        messageType: 'AbortSequence',
        state: 'InProgress'
      },
      `${abortSequenceConstants.failureMessage}, reason: AbortSequence message is not handled in InProgress state`,
      'failed'
    ]
  ]

  beforeEach(() => {
    reset(sequencerServiceMock)
  })

  testData.forEach(([res, msg, state]) => {
    it(`should be ${state} if sequencer response is ${res._type}| ESW-494`, async () => {
      when(sequencerServiceMock.abortSequence()).thenResolve(res)

      renderWithAuth({
        ui: <AbortSequence prefix={new Prefix('ESW', 'darknight')} isSequencerRunning />
      })

      const abortSeqButton = await screen.findByRole('button', {
        name: abortSequenceConstants.buttonText
      })

      userEvent.click(abortSeqButton, { button: 0 })

      await screen.findByText(abortSequenceConstants.modalTitle)
      const modalAbortButton = await within(screen.getByRole('document')).findByRole('button', {
        name: abortSequenceConstants.modalOkText
      })

      userEvent.click(modalAbortButton, { button: 0 })

      await screen.findByText(msg)

      verify(sequencerServiceMock.abortSequence()).called()

      await waitFor(() => expect(screen.queryByText(abortSequenceConstants.modalTitle)).to.not.exist)
    })
  })

  it(`should be failed if abortSequence call fails | ESW-494`, async () => {
    when(sequencerServiceMock.abortSequence()).thenReject(Error('error occurred'))

    renderWithAuth({
      ui: <AbortSequence prefix={new Prefix('ESW', 'darknight')} isSequencerRunning />
    })

    //*********testing cancel button ***********************
    const abortSeqButton1 = await screen.findByRole('button', {
      name: abortSequenceConstants.buttonText
    })

    userEvent.click(abortSeqButton1, { button: 0 })
    await screen.findByText(abortSequenceConstants.modalTitle)
    const modalCancelButton = within(screen.getByRole('document')).getByRole('button', {
      name: 'Cancel'
    })
    userEvent.click(modalCancelButton)

    verify(sequencerServiceMock.abortSequence()).never()

    //*********testing abort(confirm) button ***********************
    const abortSeqButton2 = await screen.findByRole('button', {
      name: abortSequenceConstants.buttonText
    })

    userEvent.click(abortSeqButton2, { button: 0 })
    await screen.findByText(abortSequenceConstants.modalTitle)
    const modalAbortButton = within(screen.getByRole('document')).getByRole('button', {
      name: abortSequenceConstants.modalOkText
    })

    userEvent.click(modalAbortButton)

    await screen.findByText(`${abortSequenceConstants.failureMessage}, reason: error occurred`)

    verify(sequencerServiceMock.abortSequence()).called()
  })

  it(`should be disabled if sequencer is not running | ESW-494`, async () => {
    renderWithAuth({
      ui: <AbortSequence prefix={new Prefix('ESW', 'darknight')} isSequencerRunning={false} />
    })

    const abortSeqButton = (await screen.findByRole('button', {
      name: abortSequenceConstants.buttonText
    })) as HTMLButtonElement

    expect(abortSeqButton.disabled).true
  })
})
