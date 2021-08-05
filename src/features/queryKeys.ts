type Query = {
  key: string
  refetchInterval?: number // Refetch the data every defined milliseconds
  retry?: number // only failing queries will retry given number of times
}
//LocationService
export const LOCATION_SERVICE: Query = {
  key: 'locationService'
}
// Agent
export const LIST_AGENTS: Query = { key: 'listAgents' }

// SM
export const AGENTS_STATUS: Query = {
  key: 'agentsStatus',
  refetchInterval: 3000
}
export const OBS_MODES_DETAILS: Query = {
  key: 'obsModesDetails',
  refetchInterval: 3000
}

// Sequencers
export const SEQUENCER_LOCATION = { key: 'findSequencerLocation' }

export const SEQUENCER_STATE = {
  key: 'getSequencerState'
}
