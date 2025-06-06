"use client";
import { useState, useRef, useEffect } from "react";
import { EllipsisVertical, Trash2 } from "lucide-react";
import DeleteSetModal from "./DeleteSetModal";

type SetDropdownProps = {
  onDelete: () => void;
  title: string;
};

export default function SetDropdown({ onDelete, title }: SetDropdownProps) {
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/*Trigger*/}
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
      >
        <EllipsisVertical className="h-5 w-5" />
      </button>

      {/*Dropdown*/}
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg border border-gray-300">
          <button
            onClick={() => {
              setOpen(false);
              setDeleteModalOpen(true);
            }}
            className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
          >
            <div className="flex items-center justify-between">
              Delete Set
              <Trash2 className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      <DeleteSetModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onDelete={onDelete}
        title={title}
      />
    </div>
  );
}
