import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Location, Prefix, SequencerStateResponse, StepList, StepStatus } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { anything, reset, when } from 'ts-mockito'
import { SequencerDetails } from '../../../../../src/features/sequencer/components/sequencerDetails/SequencerDetails'
import { getStep, makeSeqStateResponse as mkSeqStateResponse } from '../../../../utils/sequence-utils'
import { mockServices, renderWithAuth, sequencerServiceMock } from '../../../../utils/test-utils'

const mkStepList = (statusList: StepStatus['_type'][]): StepList => {
  const steps = statusList.map((x, index) => getStep(x, `${index + 1}`))
  return new StepList(steps)
}
describe('sequencer details selected step', () => {
  let simulateBackendEvent: (sequencerStateResponse: SequencerStateResponse) => void = () => ({})
  beforeEach(() => {
    reset(sequencerServiceMock)
    when(sequencerServiceMock.subscribeSequencerState()).thenReturn((cb) => {
      simulateBackendEvent = cb
      return {
        cancel: () => undefined
      }
    })
  })

  const darkNightSequencer = 'IRIS.IRIS_Darknight'
  const sequenceComponentPrefix = 'ESW.ESW1'

  const sequencerLoc: Location = {
    _type: 'AkkaLocation',
    connection: {
      componentType: 'Sequencer',
      connectionType: 'akka',
      prefix: Prefix.fromString(darkNightSequencer)
    },
    metadata: {
      sequenceComponentPrefix
    },
    uri: ''
  }
  const locServiceMock = mockServices.mock.locationService

  when(locServiceMock.find(anything())).thenResolve(sequencerLoc)
  when(locServiceMock.track(anything())).thenReturn(() => {
    return {
      cancel: () => ({})
    }
  })

  it('should follow step list progress by default when no user action | ESW-501, ESW-489', async () => {
    const stepListWithStep1InProgress: StepStatus['_type'][] = ['InFlight', 'Pending']
    const stepListWithStep2InProgress: StepStatus['_type'][] = ['Success', 'InFlight']

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencerDetails prefix={sequencerLoc.connection.prefix} />
        </BrowserRouter>
      )
    })
    //simulating backend event
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep1InProgress)))
    // step1 in executng, ui should show step1 details on right side
    await assertRunningStepIs(/Command-1/i, 500)
    const sourceValue = screen.getByLabelText('Source-Value')
    expect(sourceValue.innerHTML).to.equals('ESW.test1')

    //simulating backend event
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep2InProgress)))
    //After some time , a new event is received, step2 in executng, ui should show step2 details on right side
    await assertRunningStepIs(/Command-2/i, 1200)
    await screen.findByText('ESW.test2')
  })

  it('should not follow step list progress when user selects step other than in-flight step | ESW-501, ESW-489', async () => {
    const stepListWithStep1InProgress: StepStatus['_type'][] = ['InFlight', 'Pending', 'Pending']

    const stepListWithStep2InProgress: StepStatus['_type'][] = ['Success', 'InFlight', 'Pending']

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencerDetails prefix={sequencerLoc.connection.prefix} />
        </BrowserRouter>
      )
    })
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep1InProgress)))
    //User clicks step3
    const step3 = await screen.findByRole('button', { name: /Command-3/i })
    userEvent.click(step3)

    //step1 is executing, but ui should show step3(which was clicked by user) details on right side
    await assertRunningStepIs(/Command-1/i, 500)
    await screen.findByText('ESW.test3')
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep2InProgress)))
    //step2 is executing, ui should continue to show step3(which was clicked by user) details on right side
    await assertRunningStepIs(/Command-2/i, 500)
    await screen.findByText('ESW.test3')
  })

  it('should go to last existing step in stepList when user do abort sequence | ESW-501, ESW-489', async () => {
    const stepListWithStep1InProgress: StepStatus['_type'][] = ['InFlight', 'Pending', 'Pending']
    const stepListWithStep2InProgress: StepStatus['_type'][] = ['Success', 'InFlight', 'Pending']
    //this simulates abort sequence action, and removes step3 from stepList which was not executed
    const stepListWithStep3Removed: StepStatus['_type'][] = ['Success', 'Success']

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencerDetails prefix={sequencerLoc.connection.prefix} />
        </BrowserRouter>
      )
    })
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep1InProgress)))
    //user clicks step3
    const step3 = await screen.findByRole('button', { name: /Command-3/i })
    userEvent.click(step3)

    //step1 is executing, ui should show step3(which was clicked by user) details on right side
    await assertRunningStepIs(/Command-1/i, 500)
    await screen.findByText('ESW.test3')
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep2InProgress)))
    //step2 is executing
    await assertRunningStepIs(/Command-2/i, 1000)
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep3Removed)))

    //ui should show step2 details on right side as step3 got removed
    await screen.findByText('ESW.test2')
  })

  it('should start following step list progress again when user selects in-flight step | ESW-501', async () => {
    const stepList: StepStatus['_type'][] = ['InFlight', 'Pending', 'Pending']
    const updatedStepListWithStep2InProgress: StepStatus['_type'][] = ['Success', 'InFlight', 'Pending']
    const updatedStepListWithStep3InProgress: StepStatus['_type'][] = ['Success', 'Success', 'InFlight']

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencerDetails prefix={sequencerLoc.connection.prefix} />
        </BrowserRouter>
      )
    })
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepList)))
    //user clicks step3
    const step3 = await screen.findByRole('button', { name: /Command-3/i })
    userEvent.click(step3)

    //step1 is executing, ui should show step3 (which was clicked by user) details on right side i.e. user goes to non-follow mode
    await assertRunningStepIs(/Command-1/i, 500)
    await screen.findByText('ESW.test3')
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(updatedStepListWithStep2InProgress)))
    //step2 is executing, ui should show step3 (which was clicked by user) details on right side i.e. user is still in non-follow mode
    await assertRunningStepIs(/Command-2/i, 500)
    await screen.findByText('ESW.test3')

    //user clicks step2, which is in progress to go in follow mode again, and now ui should show step2 details on right side
    const step2 = await screen.findByRole('button', { name: /Command-2/i })
    userEvent.click(step2)
    await screen.findByText('ESW.test2')

    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(updatedStepListWithStep3InProgress)))
    //as user is in follow mode, and after some time ui should show step3 details on right side as steplist progress
    await screen.findByText('ESW.test3')
  })

  it('should show current running step when step list is long in follow mode | ESW-501', async () => {
    const step1To17 = new Array(17).fill('Success')
    const stepListWithStep18InProgress: StepStatus['_type'][] = [...step1To17, 'InFlight', 'Pending', 'Pending']
    const stepListWithStep19InProgress: StepStatus['_type'][] = [...step1To17, 'Success', 'InFlight', 'Pending']

    renderWithAuth({
      ui: (
        <BrowserRouter>
          <SequencerDetails prefix={sequencerLoc.connection.prefix} />
        </BrowserRouter>
      )
    })
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep18InProgress)))
    //step18 is executing, ui should show step18 details on right side
    await assertRunningStepIs(/Command-18/i, 500)
    //wait and assert for auto scroll to happen
    await waitFor(() => expect(window.scrollY).to.greaterThan(500))
    simulateBackendEvent(mkSeqStateResponse('Running', mkStepList(stepListWithStep19InProgress)))
    //step19 is executing, ui should show step19 details on right side
    await assertRunningStepIs(/Command-19/i, 500)
    await screen.findByText('ESW.test19')
  })
})

const assertRunningStepIs = async (step: RegExp, timeout: number) => {
  const htmlElement1 = await screen.findByRole('cell', { name: step })
  const stepButton1 = within(htmlElement1).getByRole('button')
  await waitFor(() => expect(stepButton1.style.borderColor).to.equal('rgb(82, 196, 26)'), { timeout })
}
