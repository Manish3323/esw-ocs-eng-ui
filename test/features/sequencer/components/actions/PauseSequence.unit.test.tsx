import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PauseResponse } from '@tmtsoftware/esw-ts'
import React from 'react'
import { verify, when } from 'ts-mockito'
import { PauseSequence } from '../../../../../src/features/sequencer/components/steplist/PauseSequence'
import { pauseSequenceConstants } from '../../../../../src/features/sequencer/sequencerConstants'
import { renderWithStepListContext, sequencerServiceMock } from '../../../../utils/test-utils'

describe('Pause Sequence', () => {
  const testData: [PauseResponse, string, string][] = [
    [{ _type: 'Ok' }, pauseSequenceConstants.successMessage, 'successful'],
    [
      { _type: 'CannotOperateOnAnInFlightOrFinishedStep' },
      `${pauseSequenceConstants.failureMessage}, reason: CannotOperateOnAnInFlightOrFinishedStep`,
      'failed'
    ],
    [
      {
        _type: 'Unhandled',
        msg: 'Pause message is not handled in Idle state',
        messageType: 'Pause',
        state: 'Idle'
      },
      `${pauseSequenceConstants.failureMessage}, reason: Pause message is not handled in Idle state`,
      'failed'
    ]
  ]

  testData.forEach(([res, msg, state]) => {
    it(`should be ${state} if sequencer response is ${res._type}| ESW-497`, async () => {
      when(sequencerServiceMock.pause()).thenResolve(res)

      renderWithStepListContext(<PauseSequence />)

      const button = await screen.findByRole('PauseSequence')

      userEvent.click(button)

      await screen.findByText(msg)

      verify(sequencerServiceMock.pause()).called()
    })
  })

  it('should show failed if error is returned | ESW-497', async () => {
    when(sequencerServiceMock.pause()).thenReject(Error('Something went wrong'))

    renderWithStepListContext(<PauseSequence />)

    const button = await screen.findByRole('PauseSequence')

    userEvent.click(button)

    await screen.findByText(`${pauseSequenceConstants.failureMessage}, reason: Something went wrong`)

    verify(sequencerServiceMock.pause()).called()
  })
})
