import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteDnsConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dnsAddress: string;
}

const DeleteDnsConfirmationModal = ({ isOpen, onClose, onConfirm, dnsAddress }: DeleteDnsConfirmationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-gray-800 rounded-xl w-[90vw] sm:w-full max-w-[400px] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100 text-base sm:text-lg">
            Delete DNS Address
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 text-sm sm:text-base">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the DNS address <span className="font-mono">{dnsAddress}</span>?
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="text-xs sm:text-sm w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs sm:text-sm w-full sm:w-auto"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDnsConfirmationModal;