import { toast } from "vue-sonner";

// Return the underlying toast function so callers can use either:
//   toast({ title: '...', description: '...' })
// or the convenience methods:
//   toast.success('...')
export const useToast = () => {
  return { toast };
};
