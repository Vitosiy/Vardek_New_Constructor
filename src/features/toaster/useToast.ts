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

  return { success, error }
} 