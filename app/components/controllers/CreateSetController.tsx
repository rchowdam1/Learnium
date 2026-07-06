"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import CreateSetModal from "../modals/CreateSetModal";

export default function CreateSetController({
  onCreateSet,
}: {
  onCreateSet: (
    title: string,
    description: string,
    category: string,
    numLessons?: number,
    setId?: number
  ) => void;
}) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div>
      <button
        className="focus-ring flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-cta p-3 text-label text-cta-text hover:bg-cta-hover"
        onClick={() => setCreateModalOpen(true)}
      >
        <Plus className="w-4 h-4 mr-2" />
        Create New Set
      </button>

      <CreateSetModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreateSet={onCreateSet}
      />
    </div>
  );
}
