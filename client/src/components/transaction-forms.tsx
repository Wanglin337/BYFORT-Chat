import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BANK_OPTIONS, FEES, formatCurrency } from "@/lib/constants";
import { topUpSchema, withdrawSchema, sendMoneySchema } from "@shared/schema";
import type { TopUpRequest, WithdrawRequest, SendMoneyRequest } from "@shared/schema";

interface TransactionFormsProps {
  type: string;
  onClose: () => void;
}

export default function TransactionForms({ type, onClose }: TransactionFormsProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const topUpForm = useForm<TopUpRequest>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      senderName: "",
      bankName: "",
      accountNumber: "",
      originalAmount: FEES.MIN_TOPUP,
      proofImageUrl: "",
    },
  });

  const withdrawForm = useForm<WithdrawRequest>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      recipientName: "",
      bankName: "",
      accountNumber: "",
      originalAmount: FEES.MIN_WITHDRAW,
    },
  });

  const sendForm = useForm<SendMoneyRequest>({
    resolver: zodResolver(sendMoneySchema),
    defaultValues: {
      recipientPhone: "",
      originalAmount: FEES.MIN_SEND,
      notes: "",
    },
  });

  const topUpMutation = useMutation({
    mutationFn: async (data: TopUpRequest & { userId: string }) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "proofImageUrl") {
          formData.append(key, value.toString());
        }
      });
      if (selectedFile) {
        formData.append("proofImage", selectedFile);
      }
      
      const res = await fetch("/api/transactions/topup", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Permintaan Dikirim",
        description: "Top up Anda sedang diproses. Tunggu konfirmasi admin.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", user?.id] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: async (data: WithdrawRequest & { userId: string }) => {
      const res = await apiRequest("POST", "/api/transactions/withdraw", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Permintaan Dikirim", 
        description: "Penarikan Anda sedang diproses. Saldo telah dipotong sementara.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", user?.id] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: SendMoneyRequest & { userId: string }) => {
      const res = await apiRequest("POST", "/api/transactions/send", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Transaksi Berhasil",
        description: "Saldo berhasil dikirim!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions", user?.id] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTopUpSubmit = (data: TopUpRequest) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Upload bukti transfer wajib",
        variant: "destructive",
      });
      return;
    }
    topUpMutation.mutate({ ...data, userId: user!.id });
  };

  const handleWithdrawSubmit = (data: WithdrawRequest) => {
    withdrawMutation.mutate({ ...data, userId: user!.id });
  };

  const handleSendSubmit = (data: SendMoneyRequest) => {
    sendMutation.mutate({ ...data, userId: user!.id });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const renderTopUpForm = () => (
    <Form {...topUpForm}>
      <form onSubmit={topUpForm.handleSubmit(handleTopUpSubmit)} className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-sm text-blue-800 font-medium mb-2">Cara Top Up:</p>
          <p className="text-sm text-blue-700">Transfer ke OVO: <strong>08313629623</strong></p>
          <p className="text-sm text-blue-700">Lalu upload bukti transfer di bawah</p>
        </div>

        <FormField
          control={topUpForm.control}
          name="senderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Pengirim</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={topUpForm.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank/E-Wallet Pengirim</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bank/e-wallet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BANK_OPTIONS.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={topUpForm.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Rekening/E-Wallet</FormLabel>
              <FormControl>
                <Input placeholder="Nomor rekening pengirim" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={topUpForm.control}
          name="originalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Transfer</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={FEES.MIN_TOPUP.toString()}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-xs text-gray-500">
                Min: {formatCurrency(FEES.MIN_TOPUP)} | Max: {formatCurrency(FEES.MAX_TOPUP)}
              </p>
              <p className="text-xs text-red-500">
                * Biaya admin {formatCurrency(FEES.ADMIN_FEE)} akan dipotong otomatis
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <Label>Bukti Transfer</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-400 mb-2">📤</div>
              <p className="text-sm text-gray-600">
                {selectedFile ? selectedFile.name : "Klik untuk upload bukti transfer"}
              </p>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full whatsapp-green hover:bg-green-700 text-white"
          disabled={topUpMutation.isPending}
        >
          {topUpMutation.isPending ? "Mengirim..." : "Kirim Permintaan Top Up"}
        </Button>
      </form>
    </Form>
  );

  const renderWithdrawForm = () => (
    <Form {...withdrawForm}>
      <form onSubmit={withdrawForm.handleSubmit(handleWithdrawSubmit)} className="space-y-4">
        <FormField
          control={withdrawForm.control}
          name="recipientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Penerima</FormLabel>
              <FormControl>
                <Input placeholder="Nama sesuai rekening" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={withdrawForm.control}
          name="bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank/E-Wallet Tujuan</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih bank/e-wallet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {BANK_OPTIONS.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value}>
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={withdrawForm.control}
          name="accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Rekening/E-Wallet</FormLabel>
              <FormControl>
                <Input placeholder="Nomor rekening tujuan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={withdrawForm.control}
          name="originalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Penarikan</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={FEES.MIN_WITHDRAW.toString()}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-xs text-gray-500">
                Min: {formatCurrency(FEES.MIN_WITHDRAW)} | Max: {formatCurrency(FEES.MAX_WITHDRAW)}
              </p>
              <p className="text-xs text-red-500">
                * Biaya admin {formatCurrency(FEES.ADMIN_FEE)} akan dipotong otomatis
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ Saldo akan dipotong terlebih dahulu. Jika ditolak, saldo akan dikembalikan.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full btn-danger text-white"
          disabled={withdrawMutation.isPending}
        >
          {withdrawMutation.isPending ? "Mengirim..." : "Kirim Permintaan Penarikan"}
        </Button>
      </form>
    </Form>
  );

  const renderSendForm = () => (
    <Form {...sendForm}>
      <form onSubmit={sendForm.handleSubmit(handleSendSubmit)} className="space-y-4">
        <FormField
          control={sendForm.control}
          name="recipientPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor HP Penerima</FormLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+62</span>
                <FormControl>
                  <Input placeholder="8xxxxxxxxxx" className="pl-12" {...field} />
                </FormControl>
              </div>
              <p className="text-xs text-gray-500">Hanya untuk pengguna BYFORT terdaftar</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={sendForm.control}
          name="originalAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Kirim</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder={FEES.MIN_SEND.toString()}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <p className="text-xs text-gray-500">
                Min: {formatCurrency(FEES.MIN_SEND)} | Max: {formatCurrency(FEES.MAX_SEND)}
              </p>
              <p className="text-xs text-red-500">
                * Biaya admin {formatCurrency(FEES.ADMIN_FEE)} akan dipotong otomatis
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={sendForm.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catatan (Opsional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tulis pesan untuk penerima..." rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Saldo akan langsung terkirim setelah dikonfirmasi.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full whatsapp-green hover:bg-green-700 text-white"
          disabled={sendMutation.isPending}
        >
          {sendMutation.isPending ? "Mengirim..." : "Kirim Saldo"}
        </Button>
      </form>
    </Form>
  );

  const getModalTitle = () => {
    switch (type) {
      case "topup": return "Top Up Saldo";
      case "withdraw": return "Tarik Saldo";
      case "send": return "Kirim Saldo";
      default: return "Transaksi";
    }
  };

  const renderForm = () => {
    switch (type) {
      case "topup": return renderTopUpForm();
      case "withdraw": return renderWithdrawForm();
      case "send": return renderSendForm();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white rounded-t-2xl p-6 w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">{getModalTitle()}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </Button>
        </div>
        
        {renderForm()}
      </div>
    </div>
  );
}
