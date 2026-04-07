import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function StudentNotificationsView() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications`, { headers: getAuthHeaders() });
            if (res.ok) {
                const data = await res.json();
                setNotifications(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/notifications/${id}/read`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            if (res.ok) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            }
        } catch (error) {
            toast.error("Error marking notification as read");
        }
    };

    const markAllRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        for (let id of unreadIds) {
            await markAsRead(id);
        }
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'WARNING': return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
            default: return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                    <Bell className="w-5 h-5" /> Notifications
                    {notifications.filter(n => !n.is_read).length > 0 && (
                        <Badge variant="destructive" className="ml-2 px-2 py-0">{notifications.filter(n => !n.is_read).length}</Badge>
                    )}
                </h2>
                <Button variant="outline" size="sm" onClick={markAllRead}>Mark all as read</Button>
            </div>

            {loading ? (
                <div className="text-center py-10">Checking for notifications...</div>
            ) : notifications.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 rounded-xl border border-dashed bg-white">
                    You're all caught up! No recent notifications.
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(n => (
                        <Card key={n.id} className={`transition-colors ${n.is_read ? 'opacity-70 bg-gray-50' : 'bg-white border-blue-200 shadow-sm'}`}>
                            <CardContent className="p-4 flex gap-4 items-start">
                                <div className={`p-2 rounded-full ${n.is_read ? 'bg-gray-100' : 'bg-blue-50'}`}>
                                    {renderIcon(n.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`font-semibold ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>{n.title}</h4>
                                        <span className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className={`text-sm ${n.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'}`}>{n.message}</p>

                                    {!n.is_read && (
                                        <div className="mt-3">
                                            <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700" onClick={() => markAsRead(n.id)}>
                                                <CheckCircle className="w-3 h-3 mr-1" /> Mark as read
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
