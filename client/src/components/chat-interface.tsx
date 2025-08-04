import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, MoreVertical, Plus, UserPlus, Users } from "lucide-react";
import ChatModal from "@/components/chat-modals";

// Mock chat data for demonstration
const mockChats = [
  {
    id: "1",
    name: "Andri Supratman",
    lastMessage: "Halo, bagaimana kabarnya?",
    time: "14:30",
    unreadCount: 2,
    avatar: "AS",
  },
  {
    id: "2", 
    name: "Siti Nurhaliza",
    lastMessage: "Terima kasih sudah transfer saldonya",
    time: "13:45",
    unreadCount: 0,
    avatar: "SN",
  },
  {
    id: "3",
    name: "Budi Santoso",
    lastMessage: "Kapan kita meeting lagi?",
    time: "12:20",
    unreadCount: 0,
    avatar: "BS",
  },
  {
    id: "4",
    name: "Diana Putri",
    lastMessage: "Sudah terima pesanannya ya",
    time: "11:15",
    unreadCount: 1,
    avatar: "DP",
  },
];

export default function ChatInterface() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showChatModal, setShowChatModal] = useState<"add-contact" | "create-group" | null>(null);
  const [showChatOptions, setShowChatOptions] = useState(false);

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement actual message sending
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (selectedChat) {
    const chat = mockChats.find(c => c.id === selectedChat);
    return (
      <div className="h-full flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedChat(null)}
              className="text-gray-600"
            >
              ← Kembali
            </Button>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-semibold text-sm">
                {chat?.avatar}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{chat?.name}</h3>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical size={16} />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div className="text-center">
            <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
              Hari ini
            </span>
          </div>
          
          {/* Mock messages */}
          <div className="flex justify-end">
            <div className="bg-green-500 text-white p-3 rounded-lg max-w-xs">
              <p className="text-sm">Halo, apa kabar?</p>
              <span className="text-xs opacity-75">14:25</span>
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-lg max-w-xs shadow-sm">
              <p className="text-sm text-gray-800">{chat?.lastMessage}</p>
              <span className="text-xs text-gray-500">{chat?.time}</span>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ketik pesan..."
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              className="whatsapp-green hover:bg-green-700 text-white"
              size="sm"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Search Bar */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Cari chat..."
              className="pl-10"
            />
          </div>
          
          {/* Chat Actions Button */}
          <div className="relative">
            <Button
              onClick={() => setShowChatOptions(!showChatOptions)}
              className="whatsapp-green hover:bg-green-700 text-white w-10 h-10 rounded-full p-0"
            >
              <Plus size={18} />
            </Button>
            
            {/* Dropdown Options */}
            {showChatOptions && (
              <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowChatModal("add-contact");
                    setShowChatOptions(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 justify-start rounded-none"
                >
                  <UserPlus className="text-blue-600" size={16} />
                  <span className="text-gray-800">Tambah Kontak</span>
                </Button>
                
                <hr className="border-gray-200" />
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowChatModal("create-group");
                    setShowChatOptions(false);
                  }}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 justify-start rounded-none"
                >
                  <Users className="text-green-600" size={16} />
                  <span className="text-gray-800">Buat Grup</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {mockChats.map((chat) => (
          <Button
            key={chat.id}
            variant="ghost"
            onClick={() => setSelectedChat(chat.id)}
            className="w-full flex items-center space-x-3 p-4 hover:bg-gray-50 justify-start h-auto"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-600 font-semibold">{chat.avatar}</span>
            </div>
            <div className="flex-1 text-left">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-800">{chat.name}</h3>
                <span className="text-xs text-gray-500">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
            </div>
            {chat.unreadCount > 0 && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-white font-semibold">
                  {chat.unreadCount}
                </span>
              </div>
            )}
          </Button>
        ))}
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <ChatModal
          type={showChatModal}
          onClose={() => setShowChatModal(null)}
        />
      )}

      {/* Overlay to close dropdown */}
      {showChatOptions && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowChatOptions(false)}
        />
      )}
    </div>
  );
}
