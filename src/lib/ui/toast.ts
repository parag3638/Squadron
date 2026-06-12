/**
 * Toast facade — call sites import from here, not sonner directly, so the
 * underlying toaster stays swappable. Enables optimistic UI via toast.promise.
 */
export { toast } from "sonner";
