"use client";

import { BookOpen } from "lucide-react";
import Profile from "../misc/Profile";
import toast from "react-hot-toast";
import { createSupabaseClient } from "@/lib/supabase";

import { useState, useEffect } from "react";

export default function AuthNav() {
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await fetch("/api/get-username");

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            setUsername(data.username);
          }
        } else {
          toast.error("Could not fetch username");
        }
      } catch (error) {
        toast.error("Could not fetch username");
      }
    };

    fetchUsername();
  }, []);

  // 6/22 look into signing out on the sets page
  const signOut = async () => {
    try {
      const response = await fetch("/api/logout");

      if (!response.ok) {
        alert("Error - 10");
        return;
      }

      // successful, should redirect
    } catch (error) {
      alert(error);
      return;
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="flex justify-between items-center h-16 sm:mx-[4.5rem] lg:mx-18">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Learnium</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            {username && `Welcome, ${username}`}
          </span>

          {/*Profile Button*/}
          <Profile
            onSignOut={signOut}
            onViewProfile={() => console.log("Viewing profile...")}
          />
        </div>
      </div>
    </nav>
  );
}
