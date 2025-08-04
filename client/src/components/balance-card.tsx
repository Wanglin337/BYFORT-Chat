import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency } from "@/lib/constants";
import { Wallet, Plus, Minus, Send, Info, ArrowUpCircle, ArrowDownCircle, UserPlus } from "lucide-react";

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

        {/* Panduan Penggunaan */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <Info className="text-blue-600" size={20} />
            <h3 className="font-semibold text-gray-800">Panduan Penggunaan</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <ArrowUpCircle className="text-orange-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-orange-800 mb-1">Top Up</p>
                <p className="text-sm text-orange-700 leading-relaxed">
                  Isi saldo BYFORT Anda melalui transfer bank. Minimal Rp 12.000, maksimal Rp 10.000.000. 
                  Upload bukti transfer dan tunggu persetujuan admin untuk saldo masuk ke akun.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <ArrowDownCircle className="text-red-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800 mb-1">Menarik Saldo</p>
                <p className="text-sm text-red-700 leading-relaxed">
                  Tarik saldo BYFORT ke rekening bank Anda. Minimal Rp 55.000, maksimal Rp 10.000.000. 
                  Masukkan data rekening tujuan dan tunggu persetujuan admin untuk pencairan.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <UserPlus className="text-green-600" size={16} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800 mb-1">Kirim Saldo</p>
                <p className="text-sm text-green-700 leading-relaxed">
                  Kirim saldo ke sesama pengguna BYFORT dengan nomor HP. Minimal Rp 10.000. 
                  Transaksi langsung berhasil tanpa persetujuan admin. Potongan admin Rp 1.200 per transaksi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
