"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import toast from "react-hot-toast";

import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const deleteAccount = async (e) => {
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
    } catch (error) {
      toast.error("An error occurred while trying to delete the account.");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={profileButtonRef}>
      {/*Trigger*/}
      <button
        type="button"
        className="w-28 h-10 border border-gray-300 rounded-sm cursor-pointer hover:bg-gray-100 transition-all duration-150"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="font-semibold">Profile</span>
      </button>

      {/*Dropdown*/}
      {dropdownOpen && (
        <div className="absolute left-0 z-10 mt-1 w-32 origin-top-right rounded-md bg-white shadow-lg border border-gray-300">
          <Link href="/profile">
            <button
              type="button"
              className="cursor-pointer flex items-center py-2 px-1 text-sm hover:bg-gray-50 w-32"
              onClick={onViewProfile}
            >
              <User className="text-xs" />
              <span className="ml-2">View Profile</span>
            </button>
          </Link>

          <Link href="/">
            <button
              type="button"
              className="cursor-pointer text-red-400 flex items-center py-2 px-1 text-sm hover:bg-gray-50 w-32"
              onClick={onSignOut}
            >
              <LogOut className="text-xs" />
              <span className="ml-2">Sign Out</span>
            </button>
          </Link>

          <button
            type="button"
            className="cursor-pointer flex items-center py-2 px-1 text-sm hover:bg-gray-50 w-32"
            onClick={deleteAccount}
          >
            <User className="text-xs text-red-400" />
            <span className="ml-2">Delete Account</span>
          </button>
        </div>
      )}
    </div>
  );
}
