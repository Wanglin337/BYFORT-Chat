import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Check, Users, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/constants";

interface PendingTransaction {
  id: string;
  type: string;
  amount: number;
  originalAmount: number;
  adminFee: number;
  status: string;
  recipientName?: string;
  bankName?: string;
  accountNumber?: string;
  senderName?: string;
  proofImageUrl?: string;
  createdAt: string;
  user?: {
    name: string;
    phoneNumber: string;
  };
}

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: pendingTransactions = [], isLoading } = useQuery({
    queryKey: ["/api/admin/transactions/pending"],
  });

  const approveMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await apiRequest("POST", `/api/admin/transactions/${transactionId}/approve`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Transaksi telah disetujui",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const res = await apiRequest("POST", `/api/admin/transactions/${transactionId}/reject`, {});
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Transaksi telah ditolak",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/transactions/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (transactionId: string) => {
    if (confirm("Yakin ingin menyetujui transaksi ini?")) {
      approveMutation.mutate(transactionId);
    }
  };

  const handleReject = (transactionId: string) => {
    if (confirm("Yakin ingin menolak transaksi ini?")) {
      rejectMutation.mutate(transactionId);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case "topup":
        return "Top Up";
      case "withdraw":
        return "Penarikan";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-red-600 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Panel BYFORT</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="text-white hover:text-gray-200"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="text-blue-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-blue-800">
                {(stats as any)?.pendingCount || 0}
              </h3>
              <p className="text-sm text-blue-600">Transaksi Pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="text-green-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-green-800">
                {(stats as any)?.totalUsers || 0}
              </h3>
              <p className="text-sm text-green-600">Total User</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="text-yellow-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-yellow-800">
                {formatCurrency((stats as any)?.totalVolume || 0)}
              </h3>
              <p className="text-sm text-yellow-600">Volume Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Menunggu Persetujuan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (pendingTransactions as PendingTransaction[]).length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-500">Tidak ada transaksi pending</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(pendingTransactions as PendingTransaction[]).map((transaction: PendingTransaction) => (
                  <Card key={transaction.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {getTransactionTypeLabel(transaction.type)} - {transaction.user?.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {transaction.user?.phoneNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(transaction.amount)}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {getTransactionTypeLabel(transaction.type)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500">
                            {transaction.type === "topup" ? "Bank Pengirim:" : "Bank Tujuan:"}
                          </p>
                          <p className="font-medium">
                            {transaction.bankName} - {transaction.accountNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Waktu:</p>
                          <p className="font-medium">{formatDate(transaction.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">
                            {transaction.type === "topup" ? "Nama Pengirim:" : "Nama Penerima:"}
                          </p>
                          <p className="font-medium">
                            {transaction.senderName || transaction.recipientName}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Jumlah Asli:</p>
                          <p className="font-medium">{formatCurrency(transaction.originalAmount)}</p>
                        </div>
                      </div>

                      {transaction.proofImageUrl && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Bukti Transfer:</p>
                          <img
                            src={transaction.proofImageUrl}
                            alt="Bukti transfer"
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleApprove(transaction.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          disabled={approveMutation.isPending}
                        >
                          <Check className="mr-2" size={16} />
                          {approveMutation.isPending ? "Menyetujui..." : "Setujui"}
                        </Button>
                        <Button
                          onClick={() => handleReject(transaction.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          disabled={rejectMutation.isPending}
                        >
                          <X className="mr-2" size={16} />
                          {rejectMutation.isPending ? "Menolak..." : "Tolak"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
