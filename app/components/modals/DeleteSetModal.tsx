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
        open ? "visible opacity-100 bg-black/20" : "invisible opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-md z-50 shadow p-6 text-center transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-2xl">Confirm delete for the following set?</span>
        <br />
        <span className="text-2xl font-bold text-center">{title}</span>

        <div className="mt-10 flex justify-around items-center">
          <button
            className="py-3 px-7 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm cursor-pointer transition-colors duration-200"
            onClick={onClose}
          >
            <span className="font-semibold">No</span>
          </button>
          <button
            className="py-3 px-7 bg-red-500 hover:bg-red-400 rounded-lg shadow-sm text-white cursor-pointer transition-colors duration-200"
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
