// api.types.ts
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export type AsyncState<T> = {
  data: T | null
  loading: boolean
  error: ApiError | null
}
