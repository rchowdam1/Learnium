"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

type ProfileProps = {
  onSignOut: () => void;
  onViewProfile: () => void;
};

export default function Profile({ onSignOut, onViewProfile }: ProfileProps) {
  const router = useRouter();

  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const profileButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteAccount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    //console.log("Deleting account...");

    try {
      const response = await fetch("/api/delete-user", {
        method: "DELETE",
      });

      if (!response.ok) {
        toast.error("An error occurred.");
        return;
      }

      //success, which means the account was deleted
      const data = await response.json();
      if (data.success) {
        toast.success("Successfully deleted account.");
        router.replace("/");
        return;
      }
    } catch {
      toast.error("An error occurred while trying to delete the account.");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={profileButtonRef}>
      {/*Trigger*/}
      <button
        type="button"
        className="focus-ring h-11 w-28 cursor-pointer rounded-xl border border-border-interactive bg-surface px-4 text-label text-primary hover:bg-surface-raised"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span>Profile</span>
      </button>

      {/*Dropdown*/}
      {dropdownOpen && (
        <div className="absolute left-0 z-10 mt-1 w-36 origin-top-right rounded-2xl border border-border bg-surface-raised shadow-sm">
          <Link href="/profile">
            <button
              type="button"
              className="focus-ring flex w-36 cursor-pointer items-center px-3 py-2 text-body text-sm hover:bg-surface"
              onClick={onViewProfile}
            >
              <User className="text-xs text-primary" />
              <span className="ml-2">View Profile</span>
            </button>
          </Link>

          <Link href="/">
            <button
              type="button"
              className="focus-ring flex w-36 cursor-pointer items-center px-3 py-2 text-body text-sm text-error hover:bg-surface"
              onClick={onSignOut}
            >
              <LogOut className="text-xs" />
              <span className="ml-2">Sign Out</span>
            </button>
          </Link>

          <button
            type="button"
            className="focus-ring flex w-36 cursor-pointer items-center px-3 py-2 text-body text-sm text-error hover:bg-surface"
            onClick={deleteAccount}
          >
            <User className="text-xs text-error" />
            <span className="ml-2">Delete Account</span>
          </button>
        </div>
      )}
    </div>
  );
}
