import { QueryFunction, QueryKey, useQuery as useReactQuery, UseQueryOptions, UseQueryResult } from 'react-query'

export const useQuery = <TQueryFnData = unknown, TError = unknown, TData = TQueryFnData>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TQueryFnData>,
  options?: UseQueryOptions<TQueryFnData, TError, TData>
): UseQueryResult<TData, TError> => useReactQuery(queryKey, queryFn, { ...options, retry: 1 })

export type { UseQueryResult }
