import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import type { Notification } from "@shared/schema";

export default function NotificationToast() {
  const { user } = useAuthStore();
  const [visibleNotification, setVisibleNotification] = useState<Notification | null>(null);
  const [lastNotificationId, setLastNotificationId] = useState<string>("");

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications", user?.id],
    enabled: !!user?.id,
    refetchInterval: 3000, // Check for new notifications every 3 seconds
  });

  useEffect(() => {
    if ((notifications as Notification[]).length > 0) {
      const latestNotification = (notifications as Notification[])[0];
      if (latestNotification.id !== lastNotificationId && !latestNotification.isRead) {
        setVisibleNotification(latestNotification);
        setLastNotificationId(latestNotification.id);
        
        // Auto hide after 5 seconds
        setTimeout(() => {
          setVisibleNotification(null);
        }, 5000);
      }
    }
  }, [notifications, lastNotificationId]);

  const hideNotification = () => {
    setVisibleNotification(null);
  };

  if (!visibleNotification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 max-w-md mx-auto bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 fade-in">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 whatsapp-green rounded-full flex items-center justify-center flex-shrink-0">
          <Bell className="text-white text-sm" size={16} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{visibleNotification.title}</h4>
          <p className="text-sm text-gray-600">{visibleNotification.message}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={hideNotification}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
