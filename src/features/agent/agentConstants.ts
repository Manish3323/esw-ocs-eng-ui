export const killSequenceComponentConstants = {
  getSuccessMessage: (componentId: string): string => `Successfully killed Sequence Component: ${componentId}`,
  getFailureMessage: (componentId: string): string => `Sequence Component (${componentId}) could not be killed`,
  menuItemText: 'Shutdown Component',
  modalOkText: 'Shutdown',
  getModalTitle: (componentId: string): string => `Do you want to shutdown ${componentId} sequence component?`
}

export const spawnSequenceComponentConstants = {
  getSuccessMessage: (componentId: string): string => `Successfully spawned Sequence Component: ${componentId}`,
  getFailureMessage: 'Sequence Component could not be spawned',
  whiteSpaceValidation: 'component name has leading and trailing whitespaces',
  hyphenValidation: `component name has '-'`,
  modalOkText: 'Confirm'
}

export const disabledSequencerActions = {
  displayMessage: 'Spawned sequencers will display more actions'
}
