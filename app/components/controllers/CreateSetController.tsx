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
        type="button"
        className="focus-ring flex min-h-11 cursor-pointer items-center justify-center rounded-xl bg-cta px-4 py-2.5 text-label text-cta-text transition-colors hover:bg-cta-hover"
        onClick={() => setCreateModalOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
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
