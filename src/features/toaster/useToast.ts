import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

export const useToast = () => {
  const success = (message: string) => {
    toastr.success(message)
  }

  const error = (message: string) => {
    toastr.error(message)
  }

  return { success, error }
} 