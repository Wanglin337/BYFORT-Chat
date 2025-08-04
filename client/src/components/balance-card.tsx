import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/constants";
import { Wallet, Plus, Minus, Send, QrCode, Users } from "lucide-react";

interface BalanceCardProps {
  onShowModal: (type: string) => void;
}

export default function BalanceCard({ onShowModal }: BalanceCardProps) {
  const { user } = useAuthStore();

  const { data: userData } = useQuery({
    queryKey: ["/api/user", user?.id],
    enabled: !!user?.id,
    refetchInterval: 5000, // Refresh balance every 5 seconds
  });

  const currentBalance = (userData as any)?.balance ?? user?.balance ?? 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="balance-gradient rounded-xl p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm opacity-90">Saldo BYFORT</p>
              <h2 className="text-3xl font-bold">{formatCurrency(currentBalance)}</h2>
            </div>
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Wallet className="text-xl" size={24} />
            </div>
          </div>
          <p className="text-xs opacity-75">
            Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <Button
            onClick={() => onShowModal("topup")}
            className="btn-warning text-white p-4 rounded-xl flex flex-col items-center space-y-2 h-auto hover:scale-105 transition-transform"
          >
            <Plus size={24} />
            <span className="text-sm font-semibold">Top Up</span>
          </Button>
          
          <Button
            onClick={() => onShowModal("withdraw")}
            className="btn-danger text-white p-4 rounded-xl flex flex-col items-center space-y-2 h-auto hover:scale-105 transition-transform"
          >
            <Minus size={24} />
            <span className="text-sm font-semibold">Menarik</span>
          </Button>
          
          <Button
            onClick={() => onShowModal("send")}
            className="btn-primary text-white p-4 rounded-xl flex flex-col items-center space-y-2 h-auto hover:scale-105 transition-transform"
          >
            <Send size={24} />
            <span className="text-sm font-semibold">Kirim</span>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
          <div className="space-y-3">
            <Button
              variant="ghost"
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg justify-start"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <QrCode className="text-blue-600" size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">Scan QR Code</p>
                <p className="text-sm text-gray-500">Bayar dengan scan</p>
              </div>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg justify-start"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="text-green-600" size={16} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-800">Split Bill</p>
                <p className="text-sm text-gray-500">Patungan dengan teman</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
