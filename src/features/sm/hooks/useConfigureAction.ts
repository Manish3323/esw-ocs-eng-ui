import type { ConfigureResponse, ConfigureSuccess, ObsMode, SequenceManagerService } from '@tmtsoftware/esw-ts'
import { useMutation, UseMutationResult } from '../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../utils/message'
import { AGENTS_STATUS, OBS_MODES_DETAILS } from '../../queryKeys'
import { configureConstants } from '../smConstants'

const handleConfigureResponse = (res: ConfigureResponse, obsMode: ObsMode) => {
  switch (res._type) {
    case 'Success':
      return res
    case 'ConfigurationMissing':
      throw Error(`ConfigurationMissing for ${obsMode.name}`)
    case 'ConflictingResourcesWithRunningObsMode':
      throw Error(
        `${
          obsMode.name
        } is conflicting with currently running Observation Modes. Running ObsModes: ${res.runningObsMode.map(
          (x) => x.name
        )}`
      )
    case 'FailedToStartSequencers':
      throw Error(`Failed to start Sequencers as ${res.reasons}`)
    case 'SequenceComponentNotAvailable':
      throw Error(res.msg)
    case 'LocationServiceError':
      throw Error(res.reason)
    case 'Unhandled':
      throw Error(res.msg)
    case 'FailedResponse':
      throw new Error(res.reason)
  }
}

const configureObsMode = (sequenceManagerService: SequenceManagerService, obsMode: ObsMode) =>
  sequenceManagerService.configure(obsMode).then((res) => handleConfigureResponse(res, obsMode))

export const useConfigureAction = (
  obsMode: ObsMode | undefined
): UseMutationResult<ConfigureSuccess | undefined, unknown, SequenceManagerService> => {
  const configure = async (sequenceManagerService: SequenceManagerService) =>
    obsMode && (await configureObsMode(sequenceManagerService, obsMode))

  return useMutation({
    mutationFn: configure,
    onSuccess: () => successMessage(configureConstants.getSuccessMessage(obsMode?.name)),
    onError: (e) => errorMessage(configureConstants.getFailureMessage(obsMode?.name), e),
    invalidateKeysOnSuccess: [AGENTS_STATUS.key, OBS_MODES_DETAILS.key]
  })
}
