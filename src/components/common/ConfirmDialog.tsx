import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  /** Dialog open state */
  open: boolean;
  /** Called when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Title shown at the top of the dialog */
  title: string;
  /** Short description displayed below the title */
  description: string;
  /** Action performed when the user confirms */
  onConfirm: () => void;
}

/**
 * Simple reusable confirmation dialog.
 *
 * It receives the text to display and a callback that will be executed
 * when the user clicks the **Confirm** button.
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: ConfirmDialogProps) => {
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
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};