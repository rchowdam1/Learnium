"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import CreateSetModal from "../modals/CreateSetModal";

export default function CreateSetController({
  onCreateSet,
}: {
  onCreateSet: (title: string, description: string, category: string) => void;
}) {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div>
      <button
        className="flex justify-center items-center bg-black text-white p-3 rounded-md hover:bg-gray-800 active:bg-white active:text-black 
             transition-colors duration-200 cursor-pointer"
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
