import type { Prefix } from '@tmtsoftware/esw-ts'

const sequencer = '/sequencer'

export const HOME = '/'
export const INFRASTRUCTURE = '/infrastructure'
export const OBSERVATIONS = '/observations'
export const RESOURCES = '/resources'
export const SEQUENCER = `${sequencer}/:subsystem/:componentName/:obsMode?`
export const NO_MATCH = '/*'

//TODO decide what to do when obsMode is not provided
export const sequencerPath = (prefix: Prefix, obsMode?: string): string =>
  `${sequencer}/${prefix.subsystem}/${prefix.componentName}/${obsMode ?? ''}`
