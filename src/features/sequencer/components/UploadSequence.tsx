import { Sequence } from '@tmtsoftware/esw-ts'
import { Upload } from 'antd'
import React from 'react'
import { errorMessage } from '../../../utils/message'
import { uploadSequenceConstants } from '../sequencerConstants'

type UploadSequenceProps = {
  setSequence: (sequence: Sequence) => void
  request: () => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
  uploadErrorMsg: string
}

export const UploadSequence = ({
  setSequence,
  request,
  disabled,
  children,
  className,
  uploadErrorMsg
}: UploadSequenceProps): JSX.Element => {
  const beforeUpload = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsText(file)
      reader.onerror = () => errorMessage(uploadErrorMsg, reader.error)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          try {
            setSequence(Sequence.from(JSON.parse(reader.result)))
            resolve()
          } catch (e) {
            errorMessage(uploadErrorMsg, Error(uploadSequenceConstants.couldNotDeserializeReason)).then(reject)
          }
        }
      }
    })
  }

  return (
    <Upload
      disabled={disabled}
      beforeUpload={beforeUpload}
      customRequest={request}
      showUploadList={false}
      accept='application/json'
      className={className}>
      {children}
    </Upload>
  )
}
