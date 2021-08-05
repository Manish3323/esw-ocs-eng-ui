import { Space } from 'antd'
import React from 'react'
import { useSMService } from '../../contexts/SMContext'
import { Configure } from '../../features/sm/components/Configure'
import { Provision } from '../../features/sm/components/provision/Provision'
import { StartSequencer } from '../../features/sm/components/StartSequencer'
import { useProvisionStatus } from '../../features/sm/hooks/useProvisionStatus'

export const SmActions = (): JSX.Element => {
  const provisionStatus = useProvisionStatus()
  const [smContext, loading] = useSMService()
  const smLocation = smContext?.smLocation

  const disabled = !smLocation || loading
  return (
    <Space>
      <Provision provisionStatus={provisionStatus} disabled={disabled} />
      <Configure disabled={!provisionStatus || disabled} />
      <StartSequencer disabled={!provisionStatus || disabled} />
    </Space>
  )
}
