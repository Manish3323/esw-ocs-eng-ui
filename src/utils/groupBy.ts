export const groupBy = <T, K>(list: T[], keyGetter: (item: T) => K): Map<K, T[]> => {
  return list.reduce<Map<K, T[]>>((acc, item) => {
    const key = keyGetter(item)
    const collection = acc.get(key)
    if (!collection) {
      acc.set(key, [item])
    } else {
      collection.push(item)
    }
    return acc
  }, new Map())
}
