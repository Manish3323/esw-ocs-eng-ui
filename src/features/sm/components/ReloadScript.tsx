import { ReloadOutlined } from '@ant-design/icons'
import { Prefix, SequencerState, Subsystem } from '@tmtsoftware/esw-ts'
import { Menu } from 'antd'
import React from 'react'
import { showConfirmModal } from '../../../components/modal/showConfirmModal'
import { useSMService } from '../../../contexts/SMContext'
import { isSequencerInProgress } from '../../sequencer/utils'
import { useReloadScriptAction } from '../hooks/useReloadScriptAction'
import { reloadScriptConstants } from '../smConstants'

type ReloadScriptProps = {
  subsystem: Subsystem
  obsMode: string
  sequencerState: SequencerState | undefined
}
const getModalTitle = (isInProgress: boolean, sequencerPrefix: Prefix, sequencerState: SequencerState) =>
  isInProgress
    ? reloadScriptConstants.getModalTitleWithState(sequencerPrefix.toJSON(), sequencerState)
    : reloadScriptConstants.getModalTitle(sequencerPrefix.toJSON())

export const ReloadScript = ({ subsystem, obsMode, sequencerState }: ReloadScriptProps): JSX.Element => {
  const [smContext, loading] = useSMService()
  const smService = smContext?.smService
  const sequencerPrefix = new Prefix(subsystem, obsMode)
  const reloadScriptAction = useReloadScriptAction(subsystem, obsMode)
  const isInProgress = isSequencerInProgress(sequencerState)

  const handleOnClick = () => {
    sequencerState &&
      smService &&
      showConfirmModal(
        () => {
          reloadScriptAction.mutateAsync(smService)
        },
        getModalTitle(isInProgress, sequencerPrefix, sequencerState),
        reloadScriptConstants.modalOkText
      )
  }
  return (
    <Menu.Item
      key='ReloadScript'
      icon={<ReloadOutlined />}
      onClick={handleOnClick}
      disabled={loading}
      role='ReloadScript'>
      {reloadScriptConstants.menuItemText}
    </Menu.Item>
  )
}
