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
        aria-label="Set options"
        className="focus-ring rounded-xl p-1 transition-all duration-200 hover:bg-surface"
      >
        <EllipsisVertical className="h-5 w-5" />
      </button>

      {/*Dropdown*/}
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-2xl border border-border bg-surface-raised shadow-sm">
          <button
            onClick={() => {
              setOpen(false);
              setDeleteModalOpen(true);
            }}
            className="focus-ring block w-full px-4 py-2 text-left text-body text-sm text-error hover:bg-surface"
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
