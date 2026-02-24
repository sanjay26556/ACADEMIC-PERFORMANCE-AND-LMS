import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Shield, Zap, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function StudentAchievementsView() {
    const [achievements, setAchievements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const calculateAchievements = async () => {
            try {
                // Fetch stats to evaluate real achievements
                const attRes = await fetch(`${API_URL}/student/attendance`, { headers: getAuthHeaders() });
                const marksRes = await fetch(`${API_URL}/student/marks`, { headers: getAuthHeaders() });

                let unlocked = [];

                if (attRes.ok) {
                    const attData = await attRes.json();
                    let presentCount = 0;
                    attData.forEach((a: any) => { if (a.status === 'Present') presentCount++; });
                    const percentage = attData.length > 0 ? (presentCount / attData.length) * 100 : 0;

                    if (percentage >= 90) {
                        unlocked.push({
                            id: 1,
                            title: 'Perfect Attendance',
                            description: 'Maintained over 90% attendance across all courses.',
                            icon: <Shield className="w-8 h-8 text-green-500" />,
                            date: new Date().toISOString(),
                            tier: 'Gold'
                        });
                    }
                }

                if (marksRes.ok) {
                    const marksData = await marksRes.json();
                    let excellence = false;
                    let topRank = false;

                    marksData.forEach((m: any) => {
                        if ((m.marks_obtained / m.max_marks) >= 0.95) excellence = true;
                        // Simulating top rank
                        if (m.marks_obtained === m.max_marks) topRank = true;
                    });

                    if (excellence) {
                        unlocked.push({
                            id: 2,
                            title: 'Academic Excellence',
                            description: 'Scored 95% or higher in at least one assessment.',
                            icon: <Star className="w-8 h-8 text-yellow-500" />,
                            date: new Date().toISOString(),
                            tier: 'Platinum'
                        });
                    }

                    if (topRank) {
                        unlocked.push({
                            id: 3,
                            title: 'Top of the Class',
                            description: 'Achieved full marks (100%) in a course assessment.',
                            icon: <Trophy className="w-8 h-8 text-blue-500" />,
                            date: new Date().toISOString(),
                            tier: 'Diamond'
                        });
                    }
                }



                setAchievements(unlocked);
            } catch (error) {
                console.error(error);
                toast.error("Failed to evaluate achievements");
            } finally {
                setLoading(false);
            }
        };

        calculateAchievements();
    }, []);

    if (loading) return <div className="text-center py-10">Loading achievements...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-500" /> My Achievements</h2>

            {achievements.length === 0 ? (
                <div className="text-center py-12 text-neutral-500 bg-gray-50 rounded-xl border border-dashed">
                    Keep working hard to unlock achievements!
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.map(a => (
                        <Card key={a.id} className="hover:-translate-y-1 transition-transform border border-gray-100 shadow-sm hover:shadow-lg relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-2 h-full ${a.tier === 'Diamond' ? 'bg-blue-400' :
                                a.tier === 'Platinum' ? 'bg-slate-800' :
                                    a.tier === 'Gold' ? 'bg-yellow-400' : 'bg-gray-300'
                                }`}></div>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-gray-50 rounded-full shadow-inner border">
                                        {a.icon}
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">{a.title}</CardTitle>
                                        <Badge variant="secondary" className="mt-1">{a.tier}</Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">{a.description}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Earned on {new Date(a.date).toLocaleDateString()}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
