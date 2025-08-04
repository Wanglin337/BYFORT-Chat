import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { X, UserPlus, Users, Phone, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const addContactSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  phoneNumber: z.string().min(10, "Nomor HP minimal 10 digit").regex(/^[0-9+]+$/, "Hanya angka dan +"),
});

const createGroupSchema = z.object({
  groupName: z.string().min(2, "Nama grup minimal 2 karakter"),
  description: z.string().optional(),
});

// Mock contacts data
const mockContacts = [
  { id: "1", name: "Andri Supratman", phoneNumber: "081234567890" },
  { id: "2", name: "Siti Nurhaliza", phoneNumber: "082345678901" },
  { id: "3", name: "Budi Santoso", phoneNumber: "083456789012" },
  { id: "4", name: "Diana Putri", phoneNumber: "084567890123" },
  { id: "5", name: "Eko Prasetyo", phoneNumber: "085678901234" },
];

interface ChatModalProps {
  type: "add-contact" | "create-group";
  onClose: () => void;
}

export default function ChatModal({ type, onClose }: ChatModalProps) {
  const { toast } = useToast();
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const addContactForm = useForm<z.infer<typeof addContactSchema>>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
  });

  const createGroupForm = useForm<z.infer<typeof createGroupSchema>>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      groupName: "",
      description: "",
    },
  });

  const onAddContactSubmit = async (values: z.infer<typeof addContactSchema>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Kontak berhasil ditambahkan",
        description: `${values.name} telah ditambahkan ke daftar kontak`,
      });
      addContactForm.reset();
      onClose();
    } catch (error) {
      toast({
        title: "Gagal menambahkan kontak",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      });
    }
  };

  const onCreateGroupSubmit = async (values: z.infer<typeof createGroupSchema>) => {
    if (selectedContacts.length === 0) {
      toast({
        title: "Pilih anggota grup",
        description: "Minimal pilih 1 kontak untuk membuat grup",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Grup berhasil dibuat",
        description: `Grup "${values.groupName}" telah dibuat dengan ${selectedContacts.length} anggota`,
      });
      createGroupForm.reset();
      setSelectedContacts([]);
      onClose();
    } catch (error) {
      toast({
        title: "Gagal membuat grup",
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      });
    }
  };

  const handleContactToggle = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {type === "add-contact" && (
              <>
                <UserPlus className="text-green-600" size={20} />
                <span>Tambah Kontak</span>
              </>
            )}
            {type === "create-group" && (
              <>
                <Users className="text-blue-600" size={20} />
                <span>Buat Grup</span>
              </>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </CardHeader>
        
        <CardContent>
          {type === "add-contact" && (
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="text-green-600" size={16} />
                  <span className="font-medium text-green-800">Tambah Kontak Baru</span>
                </div>
                <p className="text-sm text-green-700">
                  Tambahkan teman atau keluarga untuk mulai chat dan kirim saldo dengan mudah.
                </p>
              </div>

              <Form {...addContactForm}>
                <form onSubmit={addContactForm.handleSubmit(onAddContactSubmit)} className="space-y-4">
                  <FormField
                    control={addContactForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Kontak</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Budi Santoso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addContactForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor HP</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: 081234567890" {...field} />
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
                      disabled={addContactForm.formState.isSubmitting}
                    >
                      {addContactForm.formState.isSubmitting ? "Menambahkan..." : "Tambah Kontak"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {type === "create-group" && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="text-blue-600" size={16} />
                  <span className="font-medium text-blue-800">Buat Grup Chat</span>
                </div>
                <p className="text-sm text-blue-700">
                  Buat grup untuk chat bersama dan kirim saldo ke beberapa orang sekaligus.
                </p>
              </div>

              <Form {...createGroupForm}>
                <form onSubmit={createGroupForm.handleSubmit(onCreateGroupSubmit)} className="space-y-4">
                  <FormField
                    control={createGroupForm.control}
                    name="groupName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Grup</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Keluarga Besar" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={createGroupForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi Grup (Opsional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Ceritakan tentang grup ini..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>

              <div>
                <h4 className="font-medium mb-3 text-gray-800">Pilih Anggota Grup</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {mockContacts.map((contact) => (
                    <div 
                      key={contact.id} 
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleContactToggle(contact.id)}
                    >
                      <Checkbox 
                        checked={selectedContacts.includes(contact.id)}
                        onChange={() => handleContactToggle(contact.id)}
                      />
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedContacts.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {selectedContacts.length} kontak dipilih
                  </p>
                )}
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
                  onClick={createGroupForm.handleSubmit(onCreateGroupSubmit)}
                  className="flex-1 whatsapp-green hover:bg-green-700"
                  disabled={createGroupForm.formState.isSubmitting}
                >
                  {createGroupForm.formState.isSubmitting ? "Membuat..." : "Buat Grup"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}