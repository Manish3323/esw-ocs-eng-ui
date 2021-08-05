import { CopyOutlined } from '@ant-design/icons'
import type { SequenceCommand, SequencerService } from '@tmtsoftware/esw-ts'
import { Button, Row, Space } from 'antd'
import React from 'react'
import { useMutation } from '../../../../hooks/useMutation'
import { errorMessage, successMessage } from '../../../../utils/message'
import { useStepListContext } from '../../hooks/useStepListContext'
import { duplicateStepConstants } from '../../sequencerConstants'

const addCommands = (commands: SequenceCommand[]) => async (sequencerService: SequencerService) => {
  const res = await sequencerService.add(commands)
  switch (res._type) {
    case 'Ok':
      return res

    case 'Unhandled':
      throw new Error(res.msg)
  }
}

export const DuplicateAction = ({ commands: selectedCommands }: { commands: SequenceCommand[] }): JSX.Element => {
  const { sequencerService, handleDuplicate } = useStepListContext()
  const duplicateAction = useMutation({
    mutationFn: addCommands(selectedCommands),
    onSuccess: () => successMessage(duplicateStepConstants.successMessage),
    onError: (e) => errorMessage(duplicateStepConstants.failureMessage, e)
  })

  return (
    <Row justify='center' style={{ padding: '1rem 1rem' }} align='middle'>
      <Space>
        <Button onClick={handleDuplicate}>Cancel</Button>
        <Button
          type='primary'
          loading={duplicateAction.isLoading}
          disabled={selectedCommands.length === 0}
          onClick={() => {
            sequencerService && duplicateAction.mutateAsync(sequencerService)
            handleDuplicate()
          }}>
          <CopyOutlined />
          {duplicateStepConstants.menuItemText}
        </Button>
      </Space>
    </Row>
  )
}
