import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

export const useToast = () => {
  const success = (message: string) => {
    toastr.success(message)
  }

  const error = (message: string) => {
    toastr.error(message)
  }

  const positions = {
    'top-right': 'toast-top-right',
    'top-left': 'toast-top-left',
    'top-center': 'toast-top-center',
    'bottom-right': 'toast-bottom-right',
    'bottom-left': 'toast-bottom-left',
    'bottom-center': 'toast-bottom-center'
  };

  toastr.options = {
  closeButton: true,
  progressBar: true,
  positionClass: positions['bottom-right'],
  timeOut: 2000,
  extendedTimeOut: 2000,
  tapToDismiss: false,
  preventDuplicates: false,
  newestOnTop: true
}

  return { success, error }
} 