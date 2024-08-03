import { HttpError } from ".."

export const errorHandler = (statusCode?: number, message?: string) => {
  const error: HttpError = {
    statusCode: statusCode,
    message: message,
  }
  return error
}
