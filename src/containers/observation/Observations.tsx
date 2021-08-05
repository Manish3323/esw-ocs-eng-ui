import React from 'react'
import { PageHeader } from '../../components/pageHeader/PageHeader'
import { ObservationTabs } from './ObservationTabs'

export const Observations = (): JSX.Element => (
  <>
    <PageHeader title='Manage Observation' />
    <ObservationTabs />
  </>
)
