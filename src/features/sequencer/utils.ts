import type { GenericResponse, Option, SequencerState, Step, StepList, StepStatus, Ok } from '@tmtsoftware/esw-ts'
import { stepConstants } from './sequencerConstants'

export type StepListStatus =
  | 'All Steps Completed'
  | 'Paused'
  | 'In Progress'
  | 'Failed'
  | 'NA'
  | 'Failed to Fetch Status'
  | 'Loaded'

export type StepListInfo = {
  currentStepNumber: number
  status: StepListStatus
}

export type SequencerInfo = {
  key: string
  prefix: string
  currentStepCommandName: string
  stepListInfo: StepListInfo
  totalSteps: number
  sequencerState?: SequencerState
  masterSequencerState?: SequencerState
}

const Status: Record<StepStatus['_type'], StepListStatus> = {
  Pending: 'Paused',
  Failure: 'Failed',
  InFlight: 'In Progress',
  Success: 'All Steps Completed'
}
const currentStep = (stepList: StepList): Option<Step> => stepList.steps.find((e) => e.status._type !== 'Success')

// todo refactor this code if possible
export const getStepListInfo = (stepList: StepList, sequencerState?: SequencerState['_type']): StepListInfo => {
  if (stepList.steps.length === 0) return { currentStepNumber: 0, status: 'NA' }
  const step = currentStep(stepList)
  if (step === undefined) return { currentStepNumber: 0, status: 'All Steps Completed' }
  const currentStepNumber = stepList.steps.indexOf(step) + 1
  const status = Status[step.status._type]
  return {
    currentStepNumber,
    status: sequencerState === 'Loaded' ? 'Loaded' : status
  }
}

export const getCurrentStepCommandName = (stepList: Option<StepList>): string => {
  if (stepList === undefined) return 'NA'
  const step = currentStep(stepList)
  return step === undefined ? 'NA' : step.command.commandName
}

export const handleStepActionResponse = (res: GenericResponse): Ok => {
  switch (res._type) {
    case 'Ok':
      return res

    case 'CannotOperateOnAnInFlightOrFinishedStep':
      throw new Error(stepConstants.cannotOperateOnAnInFlightOrFinishedStepMsg)

    case 'IdDoesNotExist':
      throw new Error(stepConstants.idDoesNotExistMsg(res.id))

    case 'Unhandled':
      throw new Error(res.msg)
  }
}

export const isSequencerInProgress = (sequencerState?: SequencerState): boolean =>
  sequencerState?._type !== 'Idle' && sequencerState?._type !== 'Offline'
