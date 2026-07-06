"use client";
import { useState } from "react";
import { Upload } from "lucide-react";
import CreateStudyBuddyModal from "../modals/CreateStudyBuddyModal";

export default function CreateStudyBuddyController({
  onCreateStudyBuddy,
}: {
  onCreateStudyBuddy: (
    title: string,
    description: string,
    category: string,
    buddyId?: number,
  ) => void;
}) {
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  return (
    <div>
      <button
        className="focus-ring flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-cta p-3 text-label text-cta-text hover:bg-cta-hover"
        onClick={() => setCreateModalOpen(true)}
      >
        <Upload className="w-4 h-4 mr-2" />
        Create New Study Buddy
      </button>

      <CreateStudyBuddyModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateStudyBuddy={onCreateStudyBuddy}
      />
    </div>
  );
}
