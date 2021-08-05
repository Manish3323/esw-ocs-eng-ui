import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Result, SequencerState, SubmitResponse } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { mock, verify, when } from 'ts-mockito'
import { StartSequence } from '../../../../../src/features/sequencer/components/steplist/StartSequence'
import { startSequenceConstants } from '../../../../../src/features/sequencer/sequencerConstants'
import { renderWithStepListContext, sequencerServiceMock } from '../../../../utils/test-utils'

describe('Start Sequence', () => {
  const testData: [SubmitResponse, string, string][] = [
    [{ _type: 'Started', runId: '' }, startSequenceConstants.successMessage, 'successful'],
    [{ _type: 'Completed', runId: '', result: mock(Result) }, startSequenceConstants.successMessage, 'successful'],
    [
      { _type: 'Error', runId: '', message: 'Unknown error' },
      `${startSequenceConstants.failureMessage}, reason: Unknown error`,
      'failed'
    ],
    [
      {
        _type: 'Invalid',
        runId: '',
        issue: {
          _type: 'RequiredHCDUnavailableIssue',
          reason: 'Required HCD unavailable'
        }
      },
      `${startSequenceConstants.failureMessage}, reason: Required HCD unavailable`,
      'failed'
    ],
    [{ _type: 'Cancelled', runId: '' }, `${startSequenceConstants.failureMessage}, reason: Cancelled`, 'failed'],
    [{ _type: 'Locked', runId: '' }, `${startSequenceConstants.failureMessage}, reason: Locked`, 'failed']
  ]

  testData.forEach(([res, msg, state]) => {
    it(`should show ${state} if sequencer response is ${res._type}| ESW-497`, async () => {
      when(sequencerServiceMock.startSequence()).thenResolve(res)

      renderWithStepListContext(<StartSequence sequencerState={'Loaded'} />)

      const button = await screen.findByRole('StartSequence')

      userEvent.click(button)

      await screen.findByText(msg)

      verify(sequencerServiceMock.startSequence()).called()
    })
  })

  it('should show failed if error is returned | ESW-497', async () => {
    when(sequencerServiceMock.startSequence()).thenReject(Error('Something went wrong'))

    renderWithStepListContext(<StartSequence sequencerState={'Loaded'} />)

    const button = await screen.findByRole('StartSequence')

    userEvent.click(button)

    await screen.findByText(`${startSequenceConstants.failureMessage}, reason: Something went wrong`)

    verify(sequencerServiceMock.startSequence()).called()
  })

  const disabledStates: SequencerState['_type'][] = ['Running', 'Processing', 'Offline', 'Idle']

  disabledStates.forEach((state) => {
    it(`should be disabled if sequencer in ${state} | ESW-497`, async () => {
      renderWithStepListContext(<StartSequence sequencerState={state} />)

      const button = (await screen.findByRole('StartSequence')) as HTMLButtonElement

      expect(button.disabled).true
    })
  })
})
