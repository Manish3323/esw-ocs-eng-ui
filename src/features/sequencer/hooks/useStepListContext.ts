import type { SequencerService, Option } from '@tmtsoftware/esw-ts'
import { createContext, useContext } from 'react'
import { stepListContextConstants } from '../sequencerConstants'
import type { StepListStatus } from '../utils'

export type StepListTableContextType = {
  handleDuplicate: () => void
  setFollowProgress: (_: boolean) => void
  isDuplicateEnabled: boolean
  stepListStatus: StepListStatus
  sequencerService: Option<SequencerService>
}

export const defaultStepListTableContext: StepListTableContextType = {
  handleDuplicate: () => undefined,
  setFollowProgress: () => undefined,
  isDuplicateEnabled: false,
  stepListStatus: 'NA',
  sequencerService: undefined
}

const StepListTableContext: React.Context<StepListTableContextType> = createContext(defaultStepListTableContext)

export const StepListContextProvider = StepListTableContext.Provider

export const useStepListContext = (): StepListTableContextType => {
  const context = useContext(StepListTableContext)
  if (context === undefined) {
    throw new Error(stepListContextConstants.failedMessage)
  }
  return context
}
