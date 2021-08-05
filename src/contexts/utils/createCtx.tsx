import React, { createContext, useContext } from 'react'

export type Hook<Value> = () => Value

export type Provider<Value> = ({
  children,
  initialValue
}: {
  children: React.ReactNode
  initialValue?: Value
}) => JSX.Element

export type CtxType<T> = readonly [Hook<T>, Provider<T>]

export function createCtx<T>(useHook: () => T): CtxType<T> {
  const ctx = createContext<T | undefined>(undefined)

  const useCtx = () => {
    const c = useContext(ctx)
    if (!c) throw new Error('useCtx must be inside a Provider with a value')
    return c
  }

  const Provider: Provider<T> = ({
    initialValue,
    children
  }: {
    children: React.ReactNode
    initialValue?: T | undefined
  }) => {
    const value = useHook()

    return <ctx.Provider value={initialValue ?? value}>{children}</ctx.Provider>
  }
  return [useCtx, Provider]
}
