import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentId, ObsMode, Prefix, StartSequencerResponse, Subsystem } from '@tmtsoftware/esw-ts'
import React from 'react'
import { deepEqual, reset, verify, when } from 'ts-mockito'
import { useSMService } from '../../../../src/contexts/SMContext'
import { useStartSequencerAction } from '../../../../src/features/sm/hooks/useStartSequencerAction'
import { startSequencerConstants } from '../../../../src/features/sm/smConstants'
import { _createErrorMsg } from '../../../../src/utils/message'
import { obsModesData } from '../../../jsons/obsmodes'
import { mockServices, renderWithAuth } from '../../../utils/test-utils'

const FakeComponent = ({ subsystem, obsMode }: { subsystem: Subsystem; obsMode: ObsMode }) => {
  const [smContext] = useSMService()
  const startSequencerAction = useStartSequencerAction(subsystem, obsMode)

  return <button onClick={() => smContext && startSequencerAction.mutateAsync(smContext.smService)}></button>
}

describe('Component using useStartSequencerAction', () => {
  const subsystem = 'ESW'
  const obsModeName = 'DarkNight_1'
  const obsMode = new ObsMode(obsModeName)
  const smService = mockServices.mock.smService

  const componentId = new ComponentId(new Prefix(subsystem, obsModeName), 'Sequencer')
  const tests: [string, StartSequencerResponse, string][] = [
    [
      'success',
      {
        _type: 'Started',
        componentId
      },
      startSequencerConstants.successMessage
    ],
    [
      'locationServiceError',
      {
        _type: 'LocationServiceError',
        reason: 'Sequencer component not found'
      },
      _createErrorMsg(startSequencerConstants.failureMessage, 'Sequencer component not found')
    ],
    [
      'Unhandled',
      {
        _type: 'Unhandled',
        msg: 'StartSequencer message type is not supported in Processing state',
        state: 'Idle',
        messageType: 'Unhandled'
      },
      _createErrorMsg(
        startSequencerConstants.failureMessage,
        'StartSequencer message type is not supported in Processing state'
      )
    ],
    [
      'AlreadyRunning',
      {
        _type: 'AlreadyRunning',
        componentId
      },
      _createErrorMsg(
        startSequencerConstants.failureMessage,
        startSequencerConstants.getAlreadyRunningErrorMessage(componentId.prefix.toJSON())
      )
    ],
    [
      'LoadScriptError',
      { _type: 'LoadScriptError', reason: 'Script missing' },
      _createErrorMsg(startSequencerConstants.failureMessage, 'Script missing')
    ],
    [
      'SequenceComponentNotAvailable',
      {
        _type: 'SequenceComponentNotAvailable',
        msg: 'Sequencer component not found',
        subsystems: []
      },
      _createErrorMsg(startSequencerConstants.failureMessage, 'Sequencer component not found')
    ],
    [
      'FailedResponse',
      {
        _type: 'FailedResponse',
        reason: 'LoadScript message timed out'
      },
      _createErrorMsg(startSequencerConstants.failureMessage, 'LoadScript message timed out')
    ]
  ]

  beforeEach(() => {
    reset(smService)
  })

  tests.forEach(([testname, response, message]) => {
    it(`should return ${testname} | ESW-447, ESW-507, ESW-506`, async () => {
      when(smService.getObsModesDetails()).thenResolve(obsModesData)
      when(smService.startSequencer(subsystem, deepEqual(obsMode))).thenResolve(response)

      renderWithAuth({
        ui: <FakeComponent subsystem={subsystem} obsMode={obsMode} />
      })

      const button = screen.getByRole('button')
      userEvent.click(button)

      await screen.findByText(message)
      verify(smService.startSequencer(subsystem, deepEqual(obsMode))).once()
    })
  })
})
