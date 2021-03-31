import type {
  ObsMode,
  ObsModeDetails,
  ObsModesDetailsResponseSuccess,
  Subsystem
} from '@tmtsoftware/esw-ts'
import { Table, Typography } from 'antd'
import type { ColumnsType } from 'antd/lib/table'
import React, { useEffect, useState } from 'react'
import PageHeader from '../../components/PageHeader/PageHeader'
import { useObsModesDetails } from '../../features/sm/hooks/useObsModesDetails'
import { groupBy } from '../../utils/groupBy'
import { headerTitle } from '../../utils/headerTitle'
import styles from './resources.module.css'

type ResourceType = 'InUse' | 'Available'
type ResourceData = {
  key: string
  resourceStatus: ResourceType
  usedBy: string | 'NA'
}

const getConflictingResources = (
  resources: Subsystem[],
  obsmodesDetails: ObsModeDetails[]
) => {
  const conflictingResources: [Subsystem, ObsMode][] = []
  resources.forEach((resource) =>
    obsmodesDetails.forEach((x) => {
      if (x.resources.includes(resource))
        conflictingResources.push([resource, x.obsMode])
    })
  )
  return conflictingResources
}
const updateMapWithNewData = (
  groupedData: Map<
    'Configured' | 'Configurable' | 'NonConfigurable',
    ObsModeDetails[]
  >,
  map: Map<string, ResourceData>
) => {
  const runningObsModes = groupedData.get('Configured')
  const nonConfigurableObsModes = groupedData.get('NonConfigurable')
  const ConfigurableObsModes = groupedData.get('Configurable')
  // mark all resources of configurable obsmode to Available
  ConfigurableObsModes &&
    ConfigurableObsModes.forEach((obsModeDetail) =>
      markConfigurableResourcesToAvailable(obsModeDetail, map)
    )
  // mark all resources of running obsmode to InUse
  runningObsModes && markRunningResources(runningObsModes, map)
  // mark those resources of nonconfigurable obsmode to InUse  which  are conflicting with running, and non  conflciting resources to available
  nonConfigurableObsModes &&
    runningObsModes &&
    markNonConfigurableResources(nonConfigurableObsModes, runningObsModes, map)
}

const markConfigurableResourcesToAvailable = (
  obsModeDetails: ObsModeDetails,
  map: Map<string, ResourceData>
) => {
  obsModeDetails.resources.forEach((key) => {
    map.set(key, {
      key,
      resourceStatus: 'Available',
      usedBy: 'NA'
    })
  })
}

const markNonConfigurableResources = (
  nonConfigurableObsModes: ObsModeDetails[],
  runningObsModes: ObsModeDetails[],
  map: Map<string, ResourceData>
) => {
  nonConfigurableObsModes.forEach((obsModeDetail) => {
    const conflictingResources = getConflictingResources(
      obsModeDetail.resources,
      runningObsModes
    )
    // mark only conflicting resources to in use
    mapResourcesToInUse(obsModeDetail, map, conflictingResources)
  })
}

const markRunningResources = (
  runningObsModes: ObsModeDetails[],
  map: Map<string, ResourceData>
) => {
  // mark all configured resources to in use
  runningObsModes.forEach((obsModeDetail) =>
    mapResourcesToInUse(obsModeDetail, map)
  )
  return runningObsModes
}

const mapResourcesToInUse = (
  obsModeDetails: ObsModeDetails,
  map: Map<string, ResourceData>,
  inUseResources: [Subsystem, ObsMode][] = []
) => {
  obsModeDetails.resources.forEach((key) => {
    if (inUseResources.length) {
      inUseResources.forEach((inUseResources) => {
        if (inUseResources[0] === key) {
          map.set(key, {
            key,
            resourceStatus: 'InUse',
            usedBy: inUseResources[1].name
          })
        } else {
          if (!map.get(key)) {
            map.set(key, {
              key,
              resourceStatus: 'Available',
              usedBy: 'NA'
            })
          }
        }
      })
    } else {
      map.set(key, {
        key,
        resourceStatus: 'InUse',
        usedBy: obsModeDetails.obsMode.name
      })
    }
  })
}

export const getStatusColumn = (status: ResourceType): JSX.Element => (
  <Typography.Text
    strong
    style={{
      color: `${
        status === 'Available' ? 'var(--purple)' : 'var(--successColor)'
      }`
    }}>
    {status}
  </Typography.Text>
)

const columns: ColumnsType<ResourceData> = [
  {
    title: headerTitle('Resources'),
    dataIndex: 'key'
  },
  {
    title: headerTitle('Status'),
    dataIndex: 'resourceStatus',
    render: (value: ResourceType) => getStatusColumn(value)
  },
  {
    title: headerTitle('Used By'),
    dataIndex: 'usedBy'
  }
]

const sortByResourceStatus = (list: ResourceData[]) =>
  list.sort((a, b) => (b.resourceStatus > a.resourceStatus ? 1 : -1))

const Resources = (): JSX.Element => {
  const { data: groupedData, isLoading } = useObsModesDetails()
  const [resourceMap, setResourceMap] = useState<Map<string, ResourceData>>(
    new Map<string, ResourceData>()
  )

  useEffect(() => {
    const map = new Map<string, ResourceData>()
    if (groupedData) {
      updateMapWithNewData(groupedData, map)
    }
    setResourceMap(map)
  }, [groupedData])

  return (
    <>
      <PageHeader onBack={() => window.history.back()} title='Resources' />
      <Table
        className={styles.resourcesCard}
        sticky
        onRow={() => ({ style: { fontSize: '1rem' } })}
        columns={columns}
        loading={isLoading}
        pagination={false}
        dataSource={sortByResourceStatus([...resourceMap.values()])}
      />
    </>
  )
}

export default Resources
