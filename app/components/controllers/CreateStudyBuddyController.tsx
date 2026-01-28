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
    category: string
  ) => void;
}) {
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  return (
    <div>
      <button
        className="flex justify-center items-center bg-black text-white p-3 rounded-md hover:bg-gray-800 active:bg-white active:text-black 
             transition-colors duration-200 cursor-pointer"
        onClick={() => {
          console.log("Opening Create Study Buddy Modal");
          setCreateModalOpen(true);
        }}
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
