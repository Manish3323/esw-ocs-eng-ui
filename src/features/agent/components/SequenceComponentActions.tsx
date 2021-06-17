import { MoreOutlined } from '@ant-design/icons'
import type { ComponentId, Prefix } from '@tmtsoftware/esw-ts'
import { Dropdown, Menu, Grid } from 'antd'
import React from 'react'
import { ReloadScript } from '../../sm/components/ReloadScript'
import { StopSequencer } from '../../sm/components/StopSequencer'
import { disabledSequencerActions } from '../agentConstants'
import styles from './agentCards.module.css'
import { KillSequenceComponent } from './KillSequenceComponent'

const { useBreakpoint } = Grid

type SequenceComponentActionProps = {
  componentId: ComponentId
}

type SequencerActionProps = {
  componentId: ComponentId
  sequencerPrefix: Prefix
}

const DisabledSequencerActions = () => {
  const screen = useBreakpoint()
  const width = screen.lg ? '200px' : '150px'
  return (
    <Menu.Item key='disabledSequencerActions' disabled={true}>
      <div style={{ maxWidth: width }} className={styles.disabledSequencerActions}>
        {disabledSequencerActions.displayMessage}
      </div>
    </Menu.Item>
  )
}

const SequenceComponentActionsMenu = ({ componentId, ...restProps }: SequenceComponentActionProps) => (
  <Menu {...restProps}>
    <KillSequenceComponent componentId={componentId} />
    <Menu.Divider />
    <DisabledSequencerActions />
  </Menu>
)

const SequencerActionsMenu = ({ componentId, sequencerPrefix, ...restProps }: SequencerActionProps) => (
  <Menu {...restProps}>
    <StopSequencer sequencerPrefix={sequencerPrefix} />
    <ReloadScript subsystem={componentId.prefix.subsystem} obsMode={sequencerPrefix.componentName} />
    <KillSequenceComponent componentId={componentId} />
  </Menu>
)

export const SequenceComponentActions = ({ componentId }: SequenceComponentActionProps): JSX.Element => (
  <Dropdown overlay={() => <SequenceComponentActionsMenu componentId={componentId} />} trigger={['click']}>
    <MoreOutlined style={{ fontSize: '1.5rem' }} role='sequenceCompActions' />
  </Dropdown>
)

export const SequencerActions = ({ componentId, sequencerPrefix }: SequencerActionProps): JSX.Element => (
  <Dropdown
    overlay={() => <SequencerActionsMenu componentId={componentId} sequencerPrefix={sequencerPrefix} />}
    trigger={['click']}>
    <MoreOutlined style={{ fontSize: '1.5rem' }} role='sequencerActions' />
  </Dropdown>
)
