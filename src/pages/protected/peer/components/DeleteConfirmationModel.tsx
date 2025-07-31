import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';


const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent className="sm:max-w-[425px]" style={{ cursor: 'move' }} >
        <DialogHeader>
          <DialogTitle id="draggable-dialog-title">Delete Peer</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete this Peer?</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;