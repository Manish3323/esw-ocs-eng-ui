import { renderHook } from '@testing-library/react-hooks/dom'
import { HttpConnection, HttpLocation, Prefix } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import { verify, when } from 'ts-mockito'
import { useAgentsList } from '../../../../src/features/agent/hooks/useAgentsList'
import { getContextWithQueryClientProvider, mockServices } from '../../../utils/test-utils'

describe('useAgents', () => {
  it('should return list of agents up and running | ESW-441', async () => {
    const locServiceMock = mockServices.mock.locationService
    const agentPrefix = new Prefix('ESW', 'ESW.Machine1')
    const agentLocation: HttpLocation = {
      _type: 'HttpLocation',
      connection: HttpConnection(agentPrefix, 'Service'),
      uri: 'url',
      metadata: {}
    }
    when(locServiceMock.listByComponentType('Machine')).thenResolve([agentLocation])
    const ContextAndQueryClientProvider = getContextWithQueryClientProvider(true)

    const { result, waitFor } = renderHook(() => useAgentsList(), {
      wrapper: ContextAndQueryClientProvider
    })

    await waitFor(() => {
      return result.current.isSuccess
    })

    verify(locServiceMock.listByComponentType('Machine')).called()

    const prefix = result.current.data ? result.current.data[0] : undefined
    expect(prefix).to.eq(agentPrefix)
  })
})
