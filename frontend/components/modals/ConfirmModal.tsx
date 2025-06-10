import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { AlertCircleIcon, LoaderCircle } from "lucide-react";
import { Alert, AlertTitle } from "../ui/shadcn-alert";

export default function ConfirmModal({
  open,
  onClose,
  title,
  description,
  isLoading,
  onConfirm,
  meta,
  error,
}: any) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent className="gap-0">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-[14px] !mt-0 !pt-0 !mb-3 leading-7 font-normal">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <div className="px-3">
            <Alert
              variant="destructive"
              className="py-2 -mt-2 rounded-[4px] flex items-center"
            >
              <AlertCircleIcon className="h-4 -mt-[5px] mr-3 w-4" />
              <AlertTitle className="text-[13px] font-medium fon !m-0">
                {error}
              </AlertTitle>
            </Alert>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            disabled={isLoading}
            size="sm"
            variant="destructive"
            onClick={() => onConfirm(meta)}
          >
            {isLoading && (
              <LoaderCircle className="mr-2 h-4 w-4 text-white animate-spin" />
            )}
            Yes, I cofirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
