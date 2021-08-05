import { Alert, Button } from 'antd'
import React from 'react'
import type { FallbackProps } from 'react-error-boundary'

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps): JSX.Element {
  return (
    <Alert
      message='Error'
      description={error.message}
      type='error'
      showIcon
      action={
        <Button size='small' type='primary' onClick={resetErrorBoundary}>
          Retry
        </Button>
      }
    />
  )
}
