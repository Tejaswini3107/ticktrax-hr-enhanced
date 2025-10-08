import { toast } from "vue-sonner";

export const useToast = () => {
  return {
    toast: {
      success: (message) => toast.success(message),
      error: (message) => toast.error(message),
      warning: (message) => toast.warning(message),
      info: (message) => toast.info(message),
    }
  };
};
