import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import IngestPanel from "../components/features/IngestPanel"; 
import ApiKeyPanel from "../components/features/ApiKeyPanel";
import ChatPreview from "../components/features/ChatPreview";
import DocumentList from "../components/features/DocumentList";
import ProfileModal from "../components/features/ProfileModal";
import ChatbotSettingsPanel from "../components/features/ChatbotSettingsPanel";
import WidgetEmbedPanel from "../components/features/WidgetEmbedPanel";
import UserDataCollectionPanel from "../components/features/UserDataCollectionPanel";
import UserSubmissionsTable from "../components/features/UserSubmissionsTable";
import { LogOut, LayoutGrid, Server, UserCog, Home, Database, MessageSquare, Key, Users } from "lucide-react";
import ThemeToggle from "../components/ui/ThemeToggle";
import NotificationCenter from "../components/features/NotificationCenter";
import CrawlJobList from "../components/features/CrawlJobList";

export default function ClientDashboard() {
  const { user, logout, setUser } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Helper to update local user state without page reload
  const handleProfileUpdate = (newData) => {
    // setUser({ ...user, ...newData }); // Enable this if you expose setUser in Context
    window.location.reload(); // Simple fallback: reload to fetch fresh data
  };

return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm transition-colors">
        <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xl tracking-tight">
          <div className="bg-brand-600 dark:bg-brand-500 text-white p-1.5 rounded-lg transition-colors">
            <LayoutGrid size={20} />
          </div>
          Nexora <span className="text-gray-400 dark:text-slate-500 font-normal text-sm ml-1">/ Client</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 px-3 py-1 rounded-full border border-green-100 dark:border-green-900 transition-colors">
            <Server size={12} /> System Operational
          </div>
          <div className="flex items-center gap-4 pl-6 border-l border-gray-200 dark:border-slate-800 transition-colors">
            <NotificationCenter />
            <ThemeToggle />
            <div className="text-right hidden sm:block">
              <span className="block text-sm font-semibold text-gray-900 dark:text-slate-100 transition-colors">{user?.name}</span>
              <span className="block text-xs text-gray-500 dark:text-slate-400 transition-colors">{user?.email}</span>
            </div>
            
            {/* Profile Button */}
            <button 
              onClick={() => setShowProfile(true)}
              className="p-2 text-gray-400 dark:text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-slate-800 dark:hover:text-brand-400 rounded-xl transition-all"
              title="Edit Profile"
            >
              <UserCog size={20} />
            </button>

            <button 
              onClick={logout}
              className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 dark:hover:text-red-400 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
        <div className="max-w-[1600px] mx-auto px-6">
          <nav className="flex gap-1">
            <TabButton 
              icon={Home} 
              label="Overview" 
              active={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")} 
            />
            <TabButton 
              icon={Database} 
              label="Knowledge Base" 
              active={activeTab === "knowledge"} 
              onClick={() => setActiveTab("knowledge")} 
            />
            <TabButton 
              icon={MessageSquare} 
              label="Chatbot" 
              active={activeTab === "chatbot"} 
              onClick={() => setActiveTab("chatbot")} 
            />
            <TabButton 
              icon={Key} 
              label="API & Integration" 
              active={activeTab === "api"} 
              onClick={() => setActiveTab("api")} 
            />
            <TabButton 
              icon={Users} 
              label="User Data" 
              active={activeTab === "users"} 
              onClick={() => setActiveTab("users")} 
            />
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto p-6">
        {activeTab === "overview" && <OverviewTab user={user} />}
        {activeTab === "knowledge" && <KnowledgeBaseTab />}
        {activeTab === "chatbot" && <ChatbotTab />}
        {activeTab === "api" && <ApiTab />}
        {activeTab === "users" && <UserDataTab />}
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

// Tab Button Component
function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-all ${
        active
          ? "border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400"
          : "border-transparent text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}

// Overview Tab - Dashboard with key metrics and quick actions
function OverviewTab({ user }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-600 dark:text-slate-400 transition-colors">
          Here's what's happening with your chatbot today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Documents" value="0" subtitle="Documents indexed" color="blue" />
        <StatCard title="API Calls Today" value="0" subtitle="Requests processed" color="green" />
        <StatCard title="Active Users" value="0" subtitle="Interactions today" color="purple" />
        <StatCard title="Storage Used" value="0 MB" subtitle="of your plan" color="orange" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard 
            icon={Database} 
            title="Upload Documents" 
            description="Add knowledge to your chatbot"
            color="blue"
          />
          <QuickActionCard 
            icon={MessageSquare} 
            title="Test Chatbot" 
            description="Preview your chatbot"
            color="purple"
          />
          <QuickActionCard 
            icon={Key} 
            title="Get API Key" 
            description="Integrate with your app"
            color="green"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors">Recent Activity</h3>
        <p className="text-gray-500 dark:text-slate-400 text-center py-8 transition-colors">No recent activity</p>
      </div>
    </div>
  );
}

// Knowledge Base Tab - Documents and crawlers
function KnowledgeBaseTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Knowledge Base</h2>
        <p className="text-gray-600 dark:text-slate-400 transition-colors">
          Manage your documents and web content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <IngestPanel />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <CrawlJobList />
          <DocumentList />
        </div>
      </div>
    </div>
  );
}

// Chatbot Tab - Settings and preview
function ChatbotTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Chatbot Configuration</h2>
        <p className="text-gray-600 dark:text-slate-400 transition-colors">
          Customize your chatbot's appearance and behavior
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ChatbotSettingsPanel />
        </div>
        <div className="lg:col-span-3">
          <ChatPreview />
        </div>
      </div>
    </div>
  );
}

// API Tab - Keys and integration
function ApiTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">API & Integration</h2>
        <p className="text-gray-600 dark:text-slate-400 transition-colors">
          Manage API keys and embed your chatbot
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ApiKeyPanel />
        <WidgetEmbedPanel />
      </div>
    </div>
  );
}

// User Data Tab - Collection settings and submissions
function UserDataTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">User Data Collection</h2>
        <p className="text-gray-600 dark:text-slate-400 transition-colors">
          Configure data collection and view user submissions
        </p>
      </div>

      <UserDataCollectionPanel />
      <UserSubmissionsTable />
    </div>
  );
}

// Stat Card Component
function StatCard({ title, value, subtitle, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    orange: "bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 transition-colors">
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-2 transition-colors">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{value}</p>
      <p className="text-xs text-gray-500 dark:text-slate-500 transition-colors">{subtitle}</p>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({ icon: Icon, title, description, color }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400"
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition-all border border-gray-200 dark:border-slate-700">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3 transition-colors`}>
        <Icon size={20} />
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-slate-400 transition-colors">{description}</p>
    </div>
  );
}