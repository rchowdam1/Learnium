import { BookOpen } from "lucide-react";
import Profile from "../misc/Profile";

export default function AuthNav() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="flex justify-between items-center h-16 sm:mx-[4.5rem] lg:mx-18">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Learnium</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">Welcome, John Doe</span>

          {/*Profile Button*/}
          <Profile
            onSignOut={() => console.log("Signing out...")}
            onViewProfile={() => console.log("Viewing profile...")}
          />
        </div>
      </div>
    </nav>
  );
}
