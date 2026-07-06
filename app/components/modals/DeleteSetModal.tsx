type DeleteModalProps = {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  title: string;
};

export default function DeleteSetModal({
  open,
  onClose,
  onDelete,
  title,
}: DeleteModalProps) {
  if (!open) {
    return;
  }
  return (
    <div
      onClick={onClose}
      className={`fixed inset-0 z-40 flex justify-center items-center transition-all duration-200 ${
        open ? "visible opacity-100" : "invisible opacity-0"
      }`}
      style={{ backgroundColor: "var(--overlay)" }}
    >
      <div
        className={`z-50 rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-sm transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-heading text-2xl text-primary">Confirm delete for the following set?</span>
        <br />
        <span className="text-heading text-2xl text-center text-primary">{title}</span>

        <div className="mt-10 flex justify-around items-center">
          <button
            className="focus-ring cursor-pointer rounded-xl border border-border bg-surface px-7 py-3 text-label text-primary hover:bg-surface-raised"
            onClick={onClose}
          >
            <span className="">No</span>
          </button>
          <button
            className="focus-ring cursor-pointer rounded-xl border border-error bg-surface px-7 py-3 text-label text-error hover:bg-surface-raised"
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
