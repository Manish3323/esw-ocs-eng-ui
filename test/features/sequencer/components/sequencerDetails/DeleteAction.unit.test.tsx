import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GenericResponse, Prefix, Setup, Step } from '@tmtsoftware/esw-ts'
import React from 'react'
import { verify, when } from 'ts-mockito'
import { DeleteAction } from '../../../../../src/features/sequencer/components/steplist/DeleteAction'
import { deleteStepConstants, stepConstants } from '../../../../../src/features/sequencer/sequencerConstants'
import { MenuWithStepListContext, renderWithAuth, sequencerServiceMock } from '../../../../utils/test-utils'

describe('Delete action', () => {
  const deleteActionTests: [string, GenericResponse, string][] = [
    [
      'success',
      {
        _type: 'Ok'
      },
      deleteStepConstants.successMessage
    ],
    [
      'CannotOperateOnAnInFlightOrFinishedStep',
      {
        _type: 'CannotOperateOnAnInFlightOrFinishedStep'
      },
      `${deleteStepConstants.failureMessage}, reason: ${stepConstants.cannotOperateOnAnInFlightOrFinishedStepMsg}`
    ],
    [
      'Unhandled',
      {
        _type: 'Unhandled',
        msg: 'Cannot delete step in idle state',
        state: 'Idle',
        messageType: 'Unhandled'
      },
      `${deleteStepConstants.failureMessage}, reason: Cannot delete step in idle state`
    ],
    [
      'IdDoesNotExist',
      {
        _type: 'IdDoesNotExist',
        id: 'step1'
      },
      `${deleteStepConstants.failureMessage}, reason: ${stepConstants.idDoesNotExistMsg('step1')}`
    ]
  ]

  deleteActionTests.forEach(([testName, res, message]) => {
    it(`should return ${testName} when delete is clicked | ESW-490`, async () => {
      const step: Step = {
        hasBreakpoint: false,
        status: { _type: 'Pending' },
        command: new Setup(Prefix.fromString('ESW.test'), 'Command-1'),
        id: 'step1'
      }

      when(sequencerServiceMock.delete(step.id)).thenResolve(res)
      renderWithAuth({
        ui: <MenuWithStepListContext menuItem={<DeleteAction step={step} isDisabled={false} />} />
      })

      const deleteButton = await screen.findByText(deleteStepConstants.menuItemText)
      userEvent.click(deleteButton, { button: 0 })

      await screen.findByText(deleteStepConstants.getModalTitle('Command-1'))
      const deleteStep = screen.getByRole('button', { name: deleteStepConstants.modalOkText })

      userEvent.click(deleteStep)

      await screen.findByText(message)

      verify(sequencerServiceMock.delete(step.id)).called()
    })
  })
})
