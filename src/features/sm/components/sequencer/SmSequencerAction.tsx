import { ObsMode, Prefix, SequencerState } from '@tmtsoftware/esw-ts'
import { Popconfirm, Typography } from 'antd'
import React from 'react'
import { Spinner } from '../../../../components/spinners/Spinner'
import { useSMService } from '../../../../contexts/SMContext'
import { isSequencerInProgress } from '../../../sequencer/utils'
import { useReloadScriptAction } from '../../hooks/useReloadScriptAction'
import { useStartSequencerAction } from '../../hooks/useStartSequencerAction'
import { sequencerActionConstants } from '../../smConstants'

export const SmSequencerAction = ({
  sequencerPrefix,
  sequencerState,
  masterSequencerState
}: {
  sequencerPrefix: Prefix
  masterSequencerState?: SequencerState
  sequencerState?: SequencerState
}): JSX.Element => {
  const [smContext, smLoading] = useSMService()
  const smService = smContext?.smService
  const { subsystem, componentName } = sequencerPrefix
  const reloadAction = useReloadScriptAction(subsystem, componentName)
  const startSequencerAction = useStartSequencerAction(subsystem, new ObsMode(componentName))

  if (reloadAction.isLoading || startSequencerAction.isLoading) return <Spinner />

  if (!sequencerState) {
    return (
      <Typography.Link
        disabled={smLoading || startSequencerAction.isLoading}
        onClick={() => smService && startSequencerAction.mutateAsync(smService)}>
        {sequencerActionConstants.startSequencer}
      </Typography.Link>
    )
  }

  const reload = () => {
    smService && reloadAction.mutateAsync(smService)
  }

  const popConfirmTitle = (): JSX.Element => (
    <div style={{ width: '22rem' }}>
      {masterSequencerState && isSequencerInProgress(masterSequencerState)
        ? sequencerActionConstants.getPopConfirmTitleWithState(subsystem, componentName, masterSequencerState)
        : sequencerActionConstants.getPopConfirmTitle(subsystem, componentName)}
    </div>
  )

  return (
    <Popconfirm title={popConfirmTitle()} okText={sequencerActionConstants.popConfirmOkText} onConfirm={reload}>
      <Typography.Link disabled={smLoading}>{sequencerActionConstants.reloadScript}</Typography.Link>
    </Popconfirm>
  )
}
