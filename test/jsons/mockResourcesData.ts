import { ObsMode, ObsModesDetailsResponseSuccess } from '@tmtsoftware/esw-ts'
export default <ObsModesDetailsResponseSuccess>(<unknown>{
  _type: 'Success',
  obsModes: [
    {
      obsMode: new ObsMode('DarkNight_1'),
      status: {
        _type: 'Configured'
      },
      resources: ['NFARIOS', 'TCS'],
      sequencers: ['ESW', 'TCS']
    },
    {
      obsMode: new ObsMode('DarkNight_2'),
      status: {
        _type: 'Configurable'
      },
      resources: ['IRIS'],
      sequencers: ['ESW']
    },
    {
      obsMode: new ObsMode('DarkNight_3'),
      status: {
        _type: 'NonConfigurable',
        missingSequenceComponents: []
      },
      resources: ['TCS', 'WFOS'],
      sequencers: ['ESW', 'TCS']
    }
  ]
})
