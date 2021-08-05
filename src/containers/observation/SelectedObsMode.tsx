import type { ObsModeDetails } from '@tmtsoftware/esw-ts'
import React from 'react'
import type { ResourceTableStatus } from '../../features/sequencer/components/ResourcesTable'
import { ConfiguredObsMode } from './ConfiguredObsMode'
import type { TabName } from './ObservationTabs'
import { ConfigurableObsMode, NonConfigurableObsMode } from './ObsMode'
import { ConfigurableActions } from './ObsModeActions'

type SelectedObsModeProps = {
  currentTab: TabName
  obsModeDetails: ObsModeDetails
  resources: ResourceTableStatus[]
}

export const SelectedObsMode = ({ currentTab, obsModeDetails, resources }: SelectedObsModeProps): JSX.Element => {
  const { obsMode, sequencers, status } = obsModeDetails
  switch (currentTab) {
    case 'Running':
      return <ConfiguredObsMode obsMode={obsMode} sequencers={sequencers} resources={resources} />

    case 'Configurable':
      return (
        <ConfigurableObsMode
          obsMode={obsMode}
          resources={resources}
          actions={<ConfigurableActions obsMode={obsMode} />}
        />
      )

    case 'Non-configurable':
      return (
        <NonConfigurableObsMode
          obsMode={obsMode}
          resources={resources}
          missingSequenceComponents={status._type === 'NonConfigurable' ? status.missingSequenceComponents : []}
        />
      )
  }
}
