import toastr from 'toastr'
import 'toastr/build/toastr.min.css'

toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: true,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut"
}

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