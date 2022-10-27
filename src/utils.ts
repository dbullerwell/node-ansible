export const formatArgs = (
  args?: Record<string, string>,
  freeform?: string
) => {
  const formattedArgs = []

  // Freeform arg should come first
  if (freeform) {
    formattedArgs.push(freeform)
  }

  // Only then structured args
  if (args !== undefined) {
    for (const key in args) {
      const value = args[key]
      const keyValue = key + '=' + value
      formattedArgs.push(keyValue)
    }
  }

  if (formattedArgs.length > 0) {
    return formattedArgs.join(' ')
  }

  return null
}
