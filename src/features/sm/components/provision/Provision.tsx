import React from 'react'
import { ConfigServiceProvider } from '../../../../contexts/ConfigServiceContext'
import { ProvisionButton } from './ProvisionButton'
import { UnProvisionButton } from './UnProvisionButton'

type ProvisionProps = {
  provisionStatus: boolean | undefined
  disabled?: boolean
}

export const Provision = ({ provisionStatus, disabled = false }: ProvisionProps): JSX.Element =>
  provisionStatus ? (
    <UnProvisionButton disabled={disabled} />
  ) : (
    <ConfigServiceProvider>
      <ProvisionButton disabled={disabled} />
    </ConfigServiceProvider>
  )
