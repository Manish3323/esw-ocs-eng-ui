import type { ObsMode } from '@tmtsoftware/esw-ts'

export const abortSequenceConstants = {
  successMessage: 'Successfully aborted the Sequence',
  failureMessage: 'Failed to abort the Sequence',
  buttonText: 'Abort sequence',
  modalTitle: `Do you want to abort the sequence?`,
  modalOkText: 'Abort'
}

export const goOfflineConstants = {
  successMessage: 'Sequencer is offline successfully',
  failureMessage: 'Sequencer failed to go Offline',
  buttonText: 'Go offline'
}

export const goOnlineConstants = {
  successMessage: 'Sequencer is online successfully',
  failureMessage: 'Sequencer failed to go Online',
  buttonText: 'Go online'
}

export const loadSequenceConstants = {
  successMessage: 'Sequence has been loaded successfully',
  failureMessage: 'Failed to load the sequence',
  buttonText: 'Load Sequence'
}

export const uploadSequenceConstants = {
  couldNotDeserializeReason: 'file content is not valid or not properly structured'
}

export const observationShutdownConstants = {
  getSuccessMessage: (obsMode: ObsMode): string =>
    `${obsMode.name} Observation has been shutdown and moved to Configurable.`,
  getFailureMessage: (obsMode: ObsMode): string => `Failed to shutdown Observation ${obsMode.name}`,
  getModalTitle: (obsMode: ObsMode): string => `Do you want to shutdown Observation ${obsMode.toJSON()}?`,
  modalOkText: 'Shutdown',
  buttonText: 'Shutdown'
}

export const stopSequenceConstants = {
  successMessage: 'Successfully stopped the Sequence',
  failureMessage: 'Failed to stop the Sequence',
  modalTitle: `Do you want to stop the sequence?`,
  modalOkText: 'Stop',
  buttonText: 'Stop sequence'
}

export const sequencerDetailsConstants = {
  getSequencerNotFoundMessage: (prefix: string): string => `Sequencer ${prefix} : Not found`
}

export const stepConstants = {
  cannotOperateOnAnInFlightOrFinishedStepMsg: 'Cannot operate on in progress or finished step',
  idDoesNotExistMsg: (id: string): string => `${id} does not exist`,
  defaultStepFailureErrorMessage: 'Step Failure: Error while executing step'
}

export const addStepConstants = {
  failureMessage: 'Failed to add steps',
  successMessage: 'Successfully added steps',
  menuItemText: 'Add steps'
}

export const insertBreakPointConstants = {
  successMessage: 'Successfully inserted breakpoint',
  failureMessage: 'Failed to insert breakpoint',
  menuItemText: 'Insert breakpoint'
}

export const removeBreakPointConstants = {
  successMessage: 'Successfully removed breakpoint',
  failureMessage: 'Failed to remove breakpoint',
  menuItemText: 'Remove breakpoint'
}

export const deleteStepConstants = {
  successMessage: 'Successfully deleted step',
  failureMessage: 'Failed to delete step',
  getModalTitle: (stepName: string): string => `Do you want to delete a step '${stepName}'?`,
  modalOkText: 'Delete',
  menuItemText: 'Delete'
}

export const duplicateStepConstants = {
  successMessage: 'Successfully duplicated steps',
  failureMessage: 'Failed to duplicate steps',
  menuItemText: 'Duplicate'
}

export const pauseSequenceConstants = {
  successMessage: 'Sequence is paused successfully',
  failureMessage: 'Failed to pause the sequence'
}

export const resumeSequenceConstants = {
  successMessage: 'Sequence is resumed successfully',
  failureMessage: 'Failed to resume the sequence'
}

export const startSequenceConstants = {
  successMessage: 'Sequence is started successfully',
  failureMessage: 'Failed to start the sequence',
  completedSuccessMessage: 'Sequence is completed successfully'
}

export const stepThroughConstants = {
  failedMessage: 'StepThrough failed for step'
}

export const stepListContextConstants = {
  failedMessage: 'StepListTableContext must be used within a StepListContextProvider'
}
