import { renderHook } from '@testing-library/react-hooks/dom'
import { AuthContext } from '@tmtsoftware/esw-ts'
import { expect } from 'chai'
import React from 'react'
import { useAuth } from '../../src/hooks/useAuth'
import { getUsername } from '../../src/utils/getUsername'
import { getMockAuth } from '../utils/test-utils'

describe('Auth hook', () => {
  it('Auth should return null if not initialised', async () => {
    const { result, waitFor } = renderHook(() => useAuth())
    await waitFor(() => {
      return result.current !== null
    })

    expect(result.current.auth).to.null
  })

  it('Auth should return Auth when initialised', async () => {
    const auth = getMockAuth(true)
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider
        value={{
          auth: auth,
          login: () => ({}),
          logout: () => ({})
        }}>
        {children}
      </AuthContext.Provider>
    )

    const { result, waitFor } = renderHook(() => useAuth(), {
      wrapper
    })

    await waitFor(() => {
      return result.current !== null
    })

    expect(result.current.auth).exist
    expect(getUsername(result.current.auth)).to.equal('esw-user')
  })

  it('Auth should return undefined when logged out', async () => {
    const auth = getMockAuth(false)
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider
        value={{
          auth: auth,
          login: () => ({}),
          logout: () => ({})
        }}>
        {children}
      </AuthContext.Provider>
    )

    const { result, waitFor } = renderHook(() => useAuth(), {
      wrapper
    })

    await waitFor(() => {
      return result.current !== null
    })

    expect(result.current.auth).exist
    expect(getUsername(result.current.auth)).to.undefined
  })
})
