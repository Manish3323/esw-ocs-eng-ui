import type { ObsMode, Subsystem } from '@tmtsoftware/esw-ts'
import { Alert, Space, Typography } from 'antd'
import React, { ReactElement } from 'react'
import type { ResourceTableStatus } from '../../features/sequencer/components/ResourcesTable'
import { ResourcesTable } from '../../features/sequencer/components/ResourcesTable'
import { ObsModeCard, Status } from './CommonComponents'

const ObsModeTitle = ({ title }: { title: string }) => (
  <>
    <Typography.Title level={4}>{title}</Typography.Title>
    <Status />
  </>
)

type NonConfigurableObsModeProps = {
  obsMode: ObsMode
  resources: ResourceTableStatus[]
  missingSequenceComponents: Subsystem[]
  actions?: ReactElement
}
export const NonConfigurableObsMode = ({
  obsMode,
  resources,
  actions,
  missingSequenceComponents
}: NonConfigurableObsModeProps): JSX.Element => {
  return (
    <ObsModeCard title={<ObsModeTitle title={obsMode.name} />} extra={actions}>
      <Space direction='vertical' size={20} style={{ width: '100%' }}>
        {missingSequenceComponents.length && (
          <Alert
            type='warning'
            message={`Sequence components are not available for ${missingSequenceComponents.join(', ')}`}
            showIcon
          />
        )}
        <ResourcesTable resources={resources} />
      </Space>
    </ObsModeCard>
  )
}

type ConfigurableObsModeProps = Omit<NonConfigurableObsModeProps, 'missingSequenceComponents'>
export const ConfigurableObsMode = ({ obsMode, resources, actions }: ConfigurableObsModeProps): JSX.Element => {
  return (
    <ObsModeCard title={<ObsModeTitle title={obsMode.name} />} extra={actions}>
      <ResourcesTable resources={resources} />
    </ObsModeCard>
  )
}
