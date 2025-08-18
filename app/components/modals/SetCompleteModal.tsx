import { X, PartyPopper } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center items-center transition-opacity duration-300 bg-black/80 bg-opacity-50`}
    >
      <div
        className={`flex flex-col items-center bg-white rounded-md z-60 shadow p-6 text-center relative transition-all scale-100 opacity-100`}
      >
        <X
          onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 text-gray-500 cursor-pointer hover:text-gray-200 transition-colors duration-150"
        />
        <PartyPopper className="w-10 h-10 text-[#9e975c]" />
        <span className="text-2xl font-semibold">Congratulations!</span>
        <p>You just finished "{setTitle}"!</p>
        <p>You can keep track of your completed sets in your profile.</p>

        <button
          onClick={() => router.replace("/dashboard")}
          className="mt-2 text-white bg-black px-3 py-2 rounded-md transition-colors duration-150 hover:bg-gray-50 hover:text-black cursor-pointer"
        >
          Finish
        </button>
      </div>
    </div>
  );
}
