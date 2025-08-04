import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { X, User, Bell, Shield, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

const editProfileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit"),
});

const changePinSchema = z.object({
  currentPin: z.string().min(4, "PIN minimal 4 digit"),
  newPin: z.string().min(4, "PIN minimal 4 digit"),
  confirmPin: z.string().min(4, "PIN minimal 4 digit"),
}).refine((data) => data.newPin === data.confirmPin, {
  message: "PIN baru tidak cocok",
  path: ["confirmPin"],
});

interface ProfileModalProps {
  type: "edit" | "notifications" | "security";
  onClose: () => void;
}

export default function ProfileModal({ type, onClose }: ProfileModalProps) {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Notification settings state
  const [notifications, setNotifications] = useState({
    transactions: true,
    balance: true,
    promotions: false,
    security: true,
  });

  const editForm = useForm<z.infer<typeof editProfileSchema>>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
    },
  });

  const pinForm = useForm<z.infer<typeof changePinSchema>>({
    resolver: zodResolver(changePinSchema),
    defaultValues: {
      currentPin: "",
      newPin: "",
      confirmPin: "",
    },
  });

  const onEditSubmit = async (values: z.infer<typeof editProfileSchema>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Profil berhasil diperbarui",
        description: "Data profil Anda telah disimpan",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Gagal memperbarui profil",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      });
    }
  };

  const onPinSubmit = async (values: z.infer<typeof changePinSchema>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "PIN berhasil diubah",
        description: "PIN baru Anda telah aktif",
      });
      pinForm.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Gagal mengubah PIN",
        description: "PIN lama mungkin salah",
        variant: "destructive",
      });
    }
  };

  const handleNotificationSave = () => {
    toast({
      title: "Pengaturan notifikasi disimpan",
      description: "Preferensi notifikasi Anda telah diperbarui",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {type === "edit" && (
              <>
                <User className="text-green-600" size={20} />
                <span>Edit Profil</span>
              </>
            )}
            {type === "notifications" && (
              <>
                <Bell className="text-blue-600" size={20} />
                <span>Pengaturan Notifikasi</span>
              </>
            )}
            {type === "security" && (
              <>
                <Shield className="text-red-600" size={20} />
                <span>Keamanan & PIN</span>
              </>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent>
          {type === "edit" && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor HP</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nomor HP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 whatsapp-green hover:bg-green-700"
                    disabled={editForm.formState.isSubmitting}
                  >
                    {editForm.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {type === "notifications" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifikasi Transaksi</h4>
                    <p className="text-sm text-gray-500">Pemberitahuan untuk top up, tarik, dan kirim saldo</p>
                  </div>
                  <Switch
                    checked={notifications.transactions}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, transactions: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifikasi Saldo</h4>
                    <p className="text-sm text-gray-500">Pemberitahuan perubahan saldo</p>
                  </div>
                  <Switch
                    checked={notifications.balance}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, balance: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifikasi Promosi</h4>
                    <p className="text-sm text-gray-500">Penawaran dan promosi menarik</p>
                  </div>
                  <Switch
                    checked={notifications.promotions}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, promotions: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifikasi Keamanan</h4>
                    <p className="text-sm text-gray-500">Peringatan keamanan dan aktivitas mencurigakan</p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, security: checked }))}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button 
                  onClick={handleNotificationSave}
                  className="flex-1 whatsapp-green hover:bg-green-700"
                >
                  Simpan
                </Button>
              </div>
            </div>
          )}

          {type === "security" && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Lock className="text-blue-600" size={16} />
                  <span className="font-medium text-blue-800">Keamanan Akun</span>
                </div>
                <p className="text-sm text-blue-700">
                  PIN Anda melindungi semua transaksi. Jangan bagikan PIN kepada siapapun.
                </p>
              </div>

              <Form {...pinForm}>
                <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-4">
                  <FormField
                    control={pinForm.control}
                    name="currentPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Saat Ini</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showCurrentPin ? "text" : "password"}
                              placeholder="Masukkan PIN saat ini"
                              maxLength={6}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowCurrentPin(!showCurrentPin)}
                            >
                              {showCurrentPin ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={pinForm.control}
                    name="newPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PIN Baru</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showNewPin ? "text" : "password"}
                              placeholder="Masukkan PIN baru"
                              maxLength={6}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowNewPin(!showNewPin)}
                            >
                              {showNewPin ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={pinForm.control}
                    name="confirmPin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konfirmasi PIN Baru</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPin ? "text" : "password"}
                              placeholder="Ulangi PIN baru"
                              maxLength={6}
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={() => setShowConfirmPin(!showConfirmPin)}
                            >
                              {showConfirmPin ? <EyeOff size={16} /> : <Eye size={16} />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={onClose}
                      className="flex-1"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 whatsapp-green hover:bg-green-700"
                      disabled={pinForm.formState.isSubmitting}
                    >
                      {pinForm.formState.isSubmitting ? "Mengubah..." : "Ubah PIN"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}