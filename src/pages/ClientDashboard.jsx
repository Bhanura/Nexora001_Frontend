import { useAuth } from "../context/AuthContext";
import CrawlPanel from "../components/features/CrawlPanel";
import ApiKeyPanel from "../components/features/ApiKeyPanel";
import ChatPreview from "../components/features/ChatPreview";
import { LogOut, LayoutGrid } from "lucide-react";

export default function ClientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
          <LayoutGrid /> Nexora
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            <span className="block font-medium text-gray-900">{user?.name}</span>
            <span className="text-xs">{user?.email}</span>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Management (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <CrawlPanel />
          <ApiKeyPanel />
          
          {/* We can add Document List here later */}
          <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center text-gray-400 text-sm">
            Document List Component (Coming Next)
          </div>
        </div>

        {/* Right Column: Chat Preview (8 cols) */}
        <div className="lg:col-span-8">
          <ChatPreview />
        </div>

      </main>
    </div>
  );
}