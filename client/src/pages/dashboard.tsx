import { useState } from "react";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { MessageCircle, Wallet, History, Settings, Bell, MoreVertical } from "lucide-react";
import BalanceCard from "@/components/balance-card";
import TransactionForms from "@/components/transaction-forms";
import TransactionHistory from "@/components/transaction-history";
import ChatInterface from "@/components/chat-interface";
import NotificationToast from "@/components/notification-toast";
import ProfileModal from "@/components/profile-modals";

type TabType = "chat" | "balance" | "history" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [showModal, setShowModal] = useState<string>("");
  const [showProfileModal, setShowProfileModal] = useState<"edit" | "notifications" | "security" | null>(null);
  const { user, logout } = useAuthStore();

  const tabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "balance", label: "Saldo", icon: Wallet },
    { id: "history", label: "Riwayat", icon: History },
    { id: "settings", label: "Saya", icon: Settings },
  ];

  const handleLogout = () => {
    if (confirm("Yakin ingin keluar dari BYFORT?")) {
      logout();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="whatsapp-green text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Settings className="text-sm" size={16} />
          </div>
          <div>
            <h2 className="font-semibold">{user?.name || "BYFORT User"}</h2>
            <p className="text-xs opacity-90">{user?.phoneNumber}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full text-white"
          >
            <Bell size={18} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full text-white"
            onClick={handleLogout}
          >
            <MoreVertical size={18} />
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "balance" && <BalanceCard onShowModal={setShowModal} />}
        {activeTab === "history" && <TransactionHistory />}
        {activeTab === "settings" && (
          <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Pengaturan</h2>
            
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 whatsapp-green rounded-full flex items-center justify-center">
                  <Settings className="text-white text-xl" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.phoneNumber}</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowProfileModal("edit")}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800"
              >
                Edit Profil
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <Button
                variant="ghost"
                onClick={() => setShowProfileModal("security")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="text-gray-600" size={20} />
                  <span className="font-medium text-gray-800">Keamanan & PIN</span>
                </div>
                <MoreVertical className="text-gray-400" size={16} />
              </Button>
              
              <hr className="border-gray-200" />
              
              <Button
                variant="ghost"
                onClick={() => setShowProfileModal("notifications")}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Bell className="text-gray-600" size={20} />
                  <span className="font-medium text-gray-800">Notifikasi</span>
                </div>
                <MoreVertical className="text-gray-400" size={16} />
              </Button>
              
              <hr className="border-gray-200" />
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-600"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="text-red-600" size={20} />
                  <span className="font-medium">Keluar</span>
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex flex-col items-center py-2 px-4 ${
                  isActive ? "text-green-600" : "text-gray-500"
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Transaction Forms Modal */}
      {showModal && (
        <TransactionForms
          type={showModal}
          onClose={() => setShowModal("")}
        />
      )}

      <NotificationToast />

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          type={showProfileModal}
          onClose={() => setShowProfileModal(null)}
        />
      )}
    </div>
  );
}
