import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ComponentId, ObsMode, Prefix, RestartSequencerResponse, Subsystem } from '@tmtsoftware/esw-ts'
import React from 'react'
import { deepEqual, resetCalls, verify, when } from 'ts-mockito'
import { useSMService } from '../../../../src/contexts/SMContext'
import { useReloadScriptAction } from '../../../../src/features/sm/hooks/useReloadScriptAction'
import { reloadScriptConstants } from '../../../../src/features/sm/smConstants'
import { mockServices, renderWithAuth } from '../../../utils/test-utils'

const Component = ({ subsystem, obsMode }: { subsystem: Subsystem; obsMode: string }) => {
  const [smContext] = useSMService()
  const reloadSequencerAction = useReloadScriptAction(subsystem, obsMode)
  return (
    <button onClick={() => smContext && reloadSequencerAction.mutateAsync(smContext.smService)}>
      Restart sequencer
    </button>
  )
}

describe('Reload script', () => {
  beforeEach(() => resetCalls(smService))
  const smService = mockServices.mock.smService
  const obsMode = new ObsMode('Darknight')
  const subsystem = 'ESW'
  const componentId = new ComponentId(new Prefix(subsystem, obsMode.toJSON()), 'Sequencer')
  const failureMessage = reloadScriptConstants.getFailureMessage(`${subsystem}.${obsMode.toJSON()}`)

  const responseScenarios: [string, RestartSequencerResponse, string][] = [
    [
      'Success',
      {
        _type: 'Success',
        componentId: componentId
      },
      reloadScriptConstants.getSuccessMessage(`${subsystem}.${obsMode.toJSON()}`)
    ],
    [
      'LocationServiceError',
      {
        _type: 'LocationServiceError',
        reason: 'Sequencer location not found'
      },
      `${failureMessage}, reason: Sequencer location not found`
    ],
    [
      'Unhandled',
      {
        _type: 'Unhandled',
        state: 'Processing',
        messageType: 'RestartSequencer',
        msg: "Sequence Manager can not accept 'RestartSequencer' message in 'Processing'"
      },
      `${failureMessage}, reason: Sequence Manager can not accept 'RestartSequencer' message in 'Processing'`
    ],
    [
      'FailedResponse',
      {
        _type: 'FailedResponse',
        reason: 'Sequence Manager Operation(RestartSequencer) failed due to: Ask timed out after [10000] ms'
      },
      `${failureMessage}, reason: Sequence Manager Operation(RestartSequencer) failed due to: Ask timed out after [10000] ms`
    ]
  ]

  responseScenarios.forEach(([testName, res, message]) => {
    it(`should return ${testName} when Reload Script is clicked | ESW-502`, async () => {
      when(smService.restartSequencer(subsystem, deepEqual(obsMode))).thenResolve(res)

      renderWithAuth({
        ui: <Component obsMode={obsMode.toJSON()} subsystem={subsystem} />
      })

      const button = screen.getByRole('button', { name: 'Restart sequencer' })
      userEvent.click(button)

      await screen.findByText(message)
      verify(smService.restartSequencer(subsystem, deepEqual(obsMode))).once()
    })
  })
})
