import { ObsMode, ObsModesDetailsResponseSuccess, ObsModeDetails } from '@tmtsoftware/esw-ts'
const obsModes: ObsModeDetails[] = [
  {
    obsMode: new ObsMode('DarkNight_1'),
    status: {
      _type: 'Configured'
    },
    resources: ['ESW', 'TCS'],
    sequencers: ['ESW', 'TCS']
  },
  {
    obsMode: new ObsMode('DarkNight_2'),
    status: {
      _type: 'Configurable'
    },
    resources: ['ESW', 'IRIS'],
    sequencers: ['ESW']
  },
  {
    obsMode: new ObsMode('DarkNight_3'),
    status: {
      _type: 'NonConfigurable',
      missingSequenceComponents: []
    },
    resources: ['ESW', 'IRIS', 'WFOS'],
    sequencers: ['ESW', 'TCS']
  },
  {
    obsMode: new ObsMode('DarkNight_8'),
    status: {
      _type: 'Configured'
    },
    resources: ['ESW', 'SOSS'],
    sequencers: ['ESW', 'SOSS']
  },
  {
    obsMode: new ObsMode('DarkNight_6'),
    status: {
      _type: 'Configurable'
    },
    resources: ['ESW', 'IRIS'],
    sequencers: ['ESW']
  },
  {
    obsMode: new ObsMode('DarkNight_5'),
    status: {
      _type: 'NonConfigurable',
      missingSequenceComponents: ['TCS']
    },
    resources: ['ESW', 'IRIS', 'WFOS'],
    sequencers: ['ESW', 'TCS']
  }
]

export const nonConfigurableObsModesData: ObsModesDetailsResponseSuccess = {
  _type: 'Success',
  obsModes: obsModes.filter((obs) => obs.status._type === 'NonConfigurable')
}

export const configurableObsModesData: ObsModesDetailsResponseSuccess = {
  _type: 'Success',
  obsModes: obsModes.filter((obs) => obs.status._type === 'Configurable')
}

export const obsModesData: ObsModesDetailsResponseSuccess = {
  _type: 'Success',
  obsModes: obsModes
}
