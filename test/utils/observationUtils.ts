import { ObsMode, ObsModeDetails, ObsModesDetailsResponseSuccess, ObsModeStatus } from '@tmtsoftware/esw-ts'

export const getObsModes = (status: ObsModeStatus): ObsModesDetailsResponseSuccess => {
  const obsModes: ObsModeDetails[] = [
    {
      obsMode: new ObsMode('DarkNight_1'),
      status,
      resources: ['ESW', 'TCS'],
      sequencers: ['ESW', 'TCS']
    }
  ]
  const obsModesData: ObsModesDetailsResponseSuccess = {
    _type: 'Success',
    obsModes: obsModes
  }
  return obsModesData
}
