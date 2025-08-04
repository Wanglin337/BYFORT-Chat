import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/constants";
import { Plus, Minus, Send, ArrowDownLeft } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function TransactionHistory() {
  const { user } = useAuthStore();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["/api/transactions", user?.id],
    enabled: !!user?.id,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "topup":
        return <Plus className="text-green-600" size={16} />;
      case "withdraw":
        return <Minus className="text-red-600" size={16} />;
      case "send":
        return <Send className="text-blue-600" size={16} />;
      case "receive":
        return <ArrowDownLeft className="text-green-600" size={16} />;
      default:
        return null;
    }
  };

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case "topup":
        return "Top Up Saldo";
      case "withdraw":
        return "Penarikan Saldo";
      case "send":
        return `Kirim ke ${transaction.recipientName}`;
      case "receive":
        return `Terima dari ${transaction.senderName}`;
      default:
        return "Transaksi";
    }
  };

  const getTransactionSubtitle = (transaction: Transaction) => {
    switch (transaction.type) {
      case "topup":
        return `${transaction.bankName} - ${transaction.accountNumber}`;
      case "withdraw":
        return `${transaction.bankName} - ${transaction.accountNumber}`;
      case "send":
        return transaction.recipientPhone;
      case "receive":
        return "Saldo masuk";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string, type: string) => {
    switch (status) {
      case "pending":
        return "Menunggu";
      case "approved":
        return type === "receive" ? "Berhasil" : "Disetujui";
      case "rejected":
        return "Ditolak";
      default:
        return status;
    }
  };

  const getAmountColor = (transaction: Transaction) => {
    if (transaction.type === "receive" || transaction.type === "topup") {
      return "text-green-600";
    }
    return "text-red-600";
  };

  const getAmountPrefix = (transaction: Transaction) => {
    if (transaction.type === "receive" || transaction.type === "topup") {
      return "+";
    }
    return "-";
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Riwayat Transaksi</h2>
          <button className="text-green-600 text-sm font-medium">Filter</button>
        </div>

        {(transactions as Transaction[]).length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(transactions as Transaction[]).map((transaction: Transaction) => (
              <div
                key={transaction.id}
                className="transaction-card bg-white rounded-xl p-4 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {getTransactionTitle(transaction)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getTransactionSubtitle(transaction)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getAmountColor(transaction)}`}>
                      {getAmountPrefix(transaction)}{formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                        transaction.status
                      )}`}
                    >
                      {getStatusText(transaction.status, transaction.type)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{formatDate(transaction.createdAt)}</span>
                  <span>ID: {transaction.id.slice(0, 8)}</span>
                </div>
                {transaction.notes && (
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <strong>Catatan:</strong> {transaction.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
