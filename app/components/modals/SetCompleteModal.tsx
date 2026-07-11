import { PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import { Modal } from "@/app/components/ui/Modal";
import { Button } from "@/app/components/ui/Button";

type SetCompleteModalProps = {
  open: boolean;
  onClose: () => void;
  setTitle: string;
};

export default function SetCompleteModal({
  open,
  onClose,
  setTitle,
}: SetCompleteModalProps) {
  const router = useRouter();

  return (
    <Modal isOpen={open} onClose={onClose} className="max-w-md text-center">
      <div className="flex flex-col items-center gap-3 pt-2">
        <PartyPopper className="h-10 w-10 text-accent" aria-hidden="true" />
        <h2 className="text-display text-3xl text-primary">Congratulations!</h2>
        <p className="text-body text-base text-muted">
          You just finished &ldquo;{setTitle}&rdquo;!
        </p>
        <p className="text-body text-base text-muted">
          You can keep track of your completed sets in your profile.
        </p>
        <Button
          variant="progress"
          className="mt-2"
          onClick={() => router.replace("/dashboard")}
        >
          Finish
        </Button>
      </div>
    </Modal>
  );
}
