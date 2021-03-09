import {
  QueryKey,
  useMutation,
  UseMutationResult,
  useQueryClient
} from 'react-query'

interface ActionProps<S, T> {
  mutationFn: (agent: S) => Promise<T>
  onSuccess: (a: T) => void
  onError: (e: unknown) => void
  invalidateKeysOnSuccess?: QueryKey[]
  useErrorBoundary?: boolean
}

export const useAction = <S, T>({
  mutationFn,
  onSuccess,
  onError,
  invalidateKeysOnSuccess,
  useErrorBoundary = true
}: ActionProps<S, T>): UseMutationResult<T, unknown, S> => {
  const qc = useQueryClient()

  return useMutation(mutationFn, {
    onSuccess: async (data) => {
      invalidateKeysOnSuccess &&
        (await Promise.all(
          invalidateKeysOnSuccess.map((key) => qc.invalidateQueries(key))
        ))
      onSuccess(data)
    },
    onError: (e) => onError(e),
    useErrorBoundary
  })
}
