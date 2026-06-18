import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Simple confirmation dialog used before persisting todo edits.
 *
 * @param open - Whether the dialog is visible.
 * @param onConfirm - Called when the user confirms the action.
 * @param onOpenChange - Called to close the dialog (e.g., when cancelled).
 * @param title - Dialog title.
 * @param description - Short description shown below the title.
 */
export const ConfirmEditDialog = ({
  open,
  onConfirm,
  onOpenChange,
  title,
  description,
}: {
  open: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={onConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};