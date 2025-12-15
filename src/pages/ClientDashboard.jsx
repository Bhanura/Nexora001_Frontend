import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import IngestPanel from "../components/features/IngestPanel"; 
import ApiKeyPanel from "../components/features/ApiKeyPanel";
import ChatPreview from "../components/features/ChatPreview";
import DocumentList from "../components/features/DocumentList";
import ProfileModal from "../components/features/ProfileModal";
import { LogOut, LayoutGrid, Server, UserCog } from "lucide-react";

export default function ClientDashboard() {
  const { user, logout, setUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  // Helper to update local user state without page reload
  const handleProfileUpdate = (newData) => {
    // setUser({ ...user, ...newData }); // Enable this if you expose setUser in Context
    window.location.reload(); // Simple fallback: reload to fetch fresh data
  };

return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl tracking-tight">
          <div className="bg-brand-600 text-white p-1.5 rounded-lg">
            <LayoutGrid size={20} />
          </div>
          Nexora <span className="text-gray-400 font-normal text-sm ml-1">/ Client</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
            <Server size={12} /> System Operational
          </div>
          <div className="flex items-center gap-4 pl-6 border-l border-gray-100">
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-semibold text-gray-900">{user?.name}</span>
              <span className="block text-xs text-gray-500">{user?.email}</span>
            </div>
            
            {/* Profile Button */}
            <button 
              onClick={() => setShowProfile(true)}
              className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
              title="Edit Profile"
            >
              <UserCog size={20} />
            </button>

            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <div className="grid gap-6">
               <IngestPanel />
               <ApiKeyPanel />
            </div>
          </div>
          <div className="lg:col-span-7">
            <ChatPreview />
          </div>
        </div>
        <div className="h-[500px]">
          <DocumentList />
        </div>
      </main>

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onUpdate={handleProfileUpdate} 
        />
      )}
    </div>
  );
}