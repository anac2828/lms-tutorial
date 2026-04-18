export type ActionState = {
  success: boolean
  error?: string
  [key: string]: unknown
}
// Used in the action functions
export function handleActionError(
  error: unknown,
  defaultMessage = 'Something went wrong. Please try again.',
): ActionState {
  // Error from (auth.ts getUserId)
  if (error instanceof Error) {
    if (error.message === 'UNAUTHENTICATED')
      return {
        success: false,
        error: 'You must be signed in to perform this action.',
      }
    // Error from prisma findUnique (attachment.ts action)
    if (error.message === 'UNAUTHORIZED')
      return {
        success: false,
        error: 'You do not have permission to perform this action.',
      }

    return { success: false, error: error.message }
  }

  // Unkown error
  return { success: false, error: defaultMessage }
}
