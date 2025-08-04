import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { LoginRequest, CreatePinRequest } from "@shared/schema";

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [isNewUser, setIsNewUser] = useState(false);
  const { setUser } = useAuthStore();
  const { toast } = useToast();

  const checkUserMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      const res = await apiRequest("POST", "/api/auth/check-user", { phoneNumber });
      return res.json();
    },
    onSuccess: (data) => {
      setIsNewUser(!data.exists);
      setStep("pin");
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast({
        title: "Login Berhasil",
        description: `Selamat datang di BYFORT!`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: CreatePinRequest) => {
      const res = await apiRequest("POST", "/api/auth/register", data);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun BYFORT Anda telah dibuat!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Pendaftaran Gagal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleContinue = () => {
    if (step === "phone") {
      if (!phoneNumber || phoneNumber.length < 10) {
        toast({
          title: "Error",
          description: "Masukkan nomor HP yang valid",
          variant: "destructive",
        });
        return;
      }
      checkUserMutation.mutate(phoneNumber);
    } else {
      if (!pin || pin.length !== 6) {
        toast({
          title: "Error", 
          description: "PIN harus 6 digit",
          variant: "destructive",
        });
        return;
      }

      if (isNewUser) {
        if (!name || name.length < 2) {
          toast({
            title: "Error",
            description: "Masukkan nama lengkap",
            variant: "destructive",
          });
          return;
        }
        registerMutation.mutate({ phoneNumber, pin, name });
      } else {
        loginMutation.mutate({ phoneNumber, pin });
      }
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center p-6">
      <div className="text-center mb-8">
        <div className="w-24 h-24 balance-gradient rounded-full mx-auto mb-4 flex items-center justify-center">
          <MessageCircle className="text-white text-3xl" size={36} />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">BYFORT</h1>
        <p className="text-gray-600">Chat & Dompet Digital</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">+62</span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="8xxxxxxxxxx"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={step === "pin" || checkUserMutation.isPending}
                  className="pl-12"
                />
              </div>
            </div>

            {step === "pin" && (
              <>
                {isNewUser && (
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="pin">
                    {isNewUser ? "Buat PIN (6 digit)" : "Masukkan PIN"}
                  </Label>
                  <Input
                    id="pin"
                    type="password"
                    placeholder="••••••"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="text-center text-2xl tracking-widest"
                  />
                  {!isNewUser && (
                    <div className="text-center mt-2">
                      <button className="text-sm text-blue-600 hover:underline">
                        Lupa PIN?
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <Button
              onClick={handleContinue}
              className="w-full whatsapp-green hover:bg-green-700 text-white"
              disabled={
                checkUserMutation.isPending ||
                loginMutation.isPending ||
                registerMutation.isPending
              }
            >
              {checkUserMutation.isPending
                ? "Memeriksa..."
                : loginMutation.isPending || registerMutation.isPending
                ? "Memproses..."
                : step === "phone"
                ? "Lanjutkan"
                : isNewUser
                ? "Daftar & Masuk"
                : "Masuk"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
