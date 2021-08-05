import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RemoveBreakpointResponse, GenericResponse } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { anything, reset, verify, when } from 'ts-mockito'
import { StepThroughSequence } from '../../../../../src/features/sequencer/components/steplist/StepThroughSequence'
import { stepConstants, stepThroughConstants } from '../../../../../src/features/sequencer/sequencerConstants'
import { getStep } from '../../../../utils/sequence-utils'
import { renderWithStepListContext, sequencerServiceMock } from '../../../../utils/test-utils'

describe('Step-Through Sequence', () => {
  beforeEach(() => reset(sequencerServiceMock))

  it(`should add breakpoint in next step and remove from current step | ESW-509`, async () => {
    const currentStep = getStep('Pending', 'currentStep')
    const nextStep = getStep('Pending', 'nextStep')

    when(sequencerServiceMock.removeBreakpoint(currentStep.id)).thenResolve({ _type: 'Ok' })
    when(sequencerServiceMock.addBreakpoint(nextStep.id)).thenResolve({ _type: 'Ok' })

    renderWithStepListContext(
      <StepThroughSequence currentStepId={currentStep.id} nextStepId={nextStep.id} disabled={false} />
    )

    const button = await screen.findByRole('StepThroughSequence')
    userEvent.click(button)

    await waitFor(() => verify(sequencerServiceMock.addBreakpoint(nextStep.id)).called())
    await waitFor(() => verify(sequencerServiceMock.removeBreakpoint(currentStep.id)).called())
  })

  it(`should not add breakpoint in next step but remove from current step when current step is last step | ESW-509`, async () => {
    const currentStep = getStep('Pending', 'currentStep')

    when(sequencerServiceMock.removeBreakpoint(currentStep.id)).thenResolve({ _type: 'Ok' })

    renderWithStepListContext(
      <StepThroughSequence currentStepId={currentStep.id} nextStepId={undefined} disabled={false} />
    )

    const button = await screen.findByRole('StepThroughSequence')
    userEvent.click(button)

    await waitFor(() => verify(sequencerServiceMock.addBreakpoint(anything())).never())
    await waitFor(() => verify(sequencerServiceMock.removeBreakpoint(currentStep.id)).called())
  })

  const stepThroughInsertBreakpointFailsTests: [string, GenericResponse, string][] = [
    [
      'CannotOperateOnAnInFlightOrFinishedStep',
      {
        _type: 'CannotOperateOnAnInFlightOrFinishedStep'
      },
      `${stepThroughConstants.failedMessage}, reason: ${stepConstants.cannotOperateOnAnInFlightOrFinishedStepMsg}`
    ],
    [
      'Unhandled',
      {
        _type: 'Unhandled',
        msg: 'Cannot add breakpoint in idle state',
        state: 'Idle',
        messageType: 'Unhandled'
      },
      `${stepThroughConstants.failedMessage}, reason: Cannot add breakpoint in idle state`
    ],
    [
      'IdDoesNotExist',
      {
        _type: 'IdDoesNotExist',
        id: 'nextStep'
      },
      `${stepThroughConstants.failedMessage}, reason: ${stepConstants.idDoesNotExistMsg('nextStep')}`
    ]
  ]

  stepThroughInsertBreakpointFailsTests.forEach(([testName, res, message]) => {
    it(`should return ${testName} when Step-Through is clicked and Insert breakpoint Fails | ESW-509`, async () => {
      const currentStep = getStep('Pending', 'currentStep')
      const nextStep = getStep('Pending', 'nextStep')

      when(sequencerServiceMock.addBreakpoint(nextStep.id)).thenResolve(res)

      renderWithStepListContext(
        <StepThroughSequence currentStepId={currentStep.id} nextStepId={nextStep.id} disabled={false} />
      )

      const button = await screen.findByRole('StepThroughSequence')
      userEvent.click(button)

      await screen.findByText(message)

      verify(sequencerServiceMock.addBreakpoint(nextStep.id)).called()
      await waitFor(() => verify(sequencerServiceMock.removeBreakpoint(anything())).never())
    })
  })

  const stepThroughRemoveBreakpointFailsTests: [string, RemoveBreakpointResponse, string][] = [
    [
      'Unhandled',
      {
        _type: 'Unhandled',
        msg: 'Cannot remove breakpoint in idle state',
        state: 'Idle',
        messageType: 'Unhandled'
      },
      `${stepThroughConstants.failedMessage}, reason: Cannot remove breakpoint in idle state`
    ],
    [
      'IdDoesNotExist',
      {
        _type: 'IdDoesNotExist',
        id: 'currentStep'
      },
      `${stepThroughConstants.failedMessage}, reason: ${stepConstants.idDoesNotExistMsg('currentStep')}`
    ]
  ]

  stepThroughRemoveBreakpointFailsTests.forEach(([testName, res, message]) => {
    it(`should return ${testName} when Step-Through is clicked and Remove breakpoint Fails| ESW-509`, async () => {
      const currentStep = getStep('Pending', 'currentStep')
      const nextStep = getStep('Pending', 'nextStep')

      when(sequencerServiceMock.addBreakpoint(nextStep.id)).thenResolve({ _type: 'Ok' })
      when(sequencerServiceMock.removeBreakpoint(currentStep.id)).thenResolve(res)

      renderWithStepListContext(
        <StepThroughSequence currentStepId={currentStep.id} nextStepId={nextStep.id} disabled={false} />
      )

      const button = await screen.findByRole('StepThroughSequence')
      userEvent.click(button)

      await screen.findByText(message)

      verify(sequencerServiceMock.addBreakpoint(nextStep.id)).called()
      verify(sequencerServiceMock.removeBreakpoint(currentStep.id)).called()
    })
  })

  it(`should disable if disabled props is true | ESW-509`, async () => {
    renderWithStepListContext(<StepThroughSequence currentStepId={'123'} nextStepId={'456'} disabled={true} />)

    const button = (await screen.findByRole('StepThroughSequence')) as HTMLButtonElement

    expect(button.disabled).true
  })

  it(`should enable if disabled props is false | ESW-509`, async () => {
    renderWithStepListContext(<StepThroughSequence currentStepId={'123'} nextStepId={'456'} disabled={false} />)

    const button = (await screen.findByRole('StepThroughSequence')) as HTMLButtonElement

    expect(button.disabled).false
  })
})
