"use client";

import { BookOpen } from "lucide-react";
import Profile from "../misc/Profile";
import toast from "react-hot-toast";

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
      } catch {
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
        toast.error("Could not sign out");
        return;
      }
    } catch {
      toast.error("Could not sign out");
      return;
    }
  };

  return (
    <nav aria-label="Authenticated navigation" className="fixed top-0 left-0 z-50 w-full border-b border-border bg-background">
      <div className="mx-4 flex h-16 items-center justify-between sm:mx-[4.5rem] lg:mx-18">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-brand" />
          <span className="text-heading text-xl text-primary">Learnium</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-body text-sm text-muted">
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
