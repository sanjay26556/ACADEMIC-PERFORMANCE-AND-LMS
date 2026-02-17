import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Sidebar from "@/components/dashboard/Sidebar";
import { Bell } from "lucide-react";
import { useState, useEffect } from "react";

const StudentNotifications = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('http://localhost:5000/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Sidebar role="student" />
            <main className="ml-64 p-8">
                <header className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl">
                        <Bell className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-display font-bold">Notifications</h1>
                        <p className="text-muted-foreground">Stay updated with latest announcements</p>
                    </div>
                </header>

                <div className="grid gap-4 max-w-4xl">
                    {loading ? <p>Loading...</p> : notifications.length === 0 ? (
                        <p className="text-muted-foreground">No updates yet.</p>
                    ) : notifications.map(n => (
                        <Card key={n.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{n.title}</CardTitle>
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                                        {new Date(n.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{n.message}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default StudentNotifications;
