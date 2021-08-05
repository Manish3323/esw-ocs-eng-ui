import { Prefix, SequencerState, SequencerStateResponse, Setup, Step, StepList, StepStatus } from '@tmtsoftware/esw-ts'
import { getCurrentStepCommandName, SequencerInfo } from '../../src/features/sequencer/utils'

export const getStep = (stepStatus: StepStatus['_type'], id: string, hasBreakpoint = false): Step => {
  return {
    hasBreakpoint: hasBreakpoint,
    status: { _type: stepStatus, message: '' },
    command: new Setup(Prefix.fromString(`ESW.test${id}`), `Command-${id}`),
    id: id
  }
}

export const getStepList = (status: Step['status']['_type'], hasBreakpoint = false): StepList =>
  new StepList([
    {
      hasBreakpoint: hasBreakpoint,
      status: { _type: status, message: '' },
      command: new Setup(Prefix.fromString('ESW.test'), 'Command-1'),
      id: 'step1'
    }
  ])

export const getSequencersInfo = (): SequencerInfo[] => {
  return [
    {
      key: 'ESW.darknight',
      prefix: 'ESW.darknight',
      currentStepCommandName: getCurrentStepCommandName(undefined),
      stepListInfo: { status: 'NA', currentStepNumber: 0 },
      sequencerState: { _type: 'Idle' },
      totalSteps: 0
    }
  ]
}

export const sendEvent = (
  onevent: (sequencerStateResponse: SequencerStateResponse) => void,
  state: SequencerState['_type'],
  stepList: StepList,
  timeout?: number | undefined
): void => {
  timeout
    ? setTimeout(() => onevent(makeSeqStateResponse(state, stepList)), timeout)
    : onevent(makeSeqStateResponse(state, stepList))
}

export const makeSeqStateResponse = (
  seqState: SequencerState['_type'],
  stepList: StepList
): SequencerStateResponse => ({
  _type: 'SequencerStateResponse',
  sequencerState: { _type: seqState },
  stepList
})
