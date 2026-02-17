
import { useState, useEffect } from "react";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
    Trophy,
    Award,
    Medal,
    Star,
    Zap,
    Flame,
    CheckCircle2,
    Lock,
    Download,
    Share2,
    Calendar,
    BookOpen,
    Code2,
    GraduationCap
} from "lucide-react";

// --- MOCK DATA ---

const ACHIEVEMENT_DATA = {
    xp: 2450,
    level: 12,
    levelTitle: "Scholar",
    nextLevelXp: 3000,
    totalAchievements: 27,
    academicStreak: 14,
    bestSemester: "Sem 5 (GPA 8.9)",
    certificatesEarned: 6,

    categories: {
        academic: [
            { id: "ac1", name: "Top 10% - Sem 5", description: "Ranked in top 10% of the class based on GPA.", date: "2026-01-12", level: "Gold", status: "Earned", icon: Trophy },
            { id: "ac2", name: "DSA Final Excellence", description: "Scored 95%+ in Data Structures Final Exam.", date: "2026-01-20", level: "Platinum", status: "Earned", icon: Zap },
            { id: "ac3", name: "Model Test Improve", description: "Improved summary score by 15% vs Unit Tests.", date: "2025-11-15", level: "Silver", status: "Earned", icon: TrendingUp },
            { id: "ac4", name: "Perfect Attendance", description: "100% attendance in a full semester.", level: "Gold", status: "Locked", condition: "Attend all classes in Sem 6", progress: 85, icon: Calendar }
        ],
        lms: [
            { id: "lm1", name: "30-Day Streak", description: "Logged in and learned for 30 consecutive days.", date: "2025-12-10", level: "Epic", status: "Earned", streak: 30, icon: Flame },
            { id: "lm2", name: "OS Master", description: "Completed 100% of Operating Systems modules.", date: "2025-10-05", level: "Gold", status: "Earned", icon: CheckCircle2 },
            { id: "lm3", name: "Quiz Whiz", description: "Attempt 20 Quizzes with passing grade.", level: "Silver", status: "In Progress", progress: 60, condition: "12/20 Quizzes", icon: BookOpen },
            { id: "lm4", name: "Marathon Runner", description: "Study for 4 continuous hours in one session.", level: "Rare", status: "Locked", condition: "Record a 4h session", icon: Clock }
        ],
        activities: [
            { id: "ev1", name: "Hackathon Warrior", description: "Participated in the Annual College Hackathon.", date: "2025-09-15", level: "Silver", status: "Earned", icon: Code2 },
            { id: "ev2", name: "Code Contest Winner", description: "First prize in Dept Coding Contest.", date: "2025-08-20", level: "Gold", status: "Earned", icon: Trophy },
            { id: "ev3", name: "Workshop: Cloud", description: "Completed AWS Cloud Basics workshop.", date: "2025-07-10", level: "Bronze", status: "Earned", icon: GraduationCap }
        ],
        skills: [
            { id: "sk1", name: "Algorithms", level: "Advanced", progress: 76, icon: BrainCircuit },
            { id: "sk2", name: "DBMS", level: "Intermediate", progress: 52, icon: Database },
            { id: "sk3", name: "System Design", level: "Beginner", progress: 30, icon: Layout }
        ],
        certificates: [
            { id: "cert1", title: "Cloud Computing Workshop", issuedBy: "CSE Dept", date: "2025-07-12", file: "cloud_cert.pdf", thumbnail: "bg-blue-900/20" },
            { id: "cert2", title: "Advanced Java Course", issuedBy: "EduPulse LMS", date: "2025-06-20", file: "java_cert.pdf", thumbnail: "bg-orange-900/20" },
            { id: "cert3", title: "Hackathon Participation", issuedBy: "Tech Club", date: "2025-09-18", file: "hack_cert.pdf", thumbnail: "bg-green-900/20" }
        ]
    }
};

// Import chart/icon dependencies that might be missing in default set
import { TrendingUp, Clock, BrainCircuit, Database, Layout } from "lucide-react";

// --- SUB-COMPONENTS ---

const LevelBadge = ({ level }: { level: string }) => {
    const colors = {
        Bronze: "bg-orange-700/20 text-orange-400 border-orange-700/50",
        Silver: "bg-slate-400/20 text-slate-300 border-slate-400/50",
        Gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
        Platinum: "bg-cyan-400/20 text-cyan-300 border-cyan-400/50",
        Epic: "bg-purple-500/20 text-purple-400 border-purple-500/50",
        Rare: "bg-blue-500/20 text-blue-400 border-blue-500/50",
        Legendary: "bg-red-500/20 text-red-500 border-red-500/50"
    };

    return (
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider h-5 px-1.5", colors[level as keyof typeof colors] || "bg-gray-800")}>
            {level}
        </Badge>
    );
};

const AchievementCard = ({ item }: { item: any }) => {
    const isLocked = item.status === "Locked";
    const isInProgress = item.status === "In Progress";

    return (
        <div className={cn(
            "relative group rounded-xl p-5 border transition-all duration-300 overflow-hidden",
            isLocked
                ? "bg-black/20 border-white/5 grayscale opacity-70 hover:opacity-100"
                : "bg-black/40 border-white/10 hover:border-primary/50 hover:bg-black/60 shadow-lg"
        )}>
            {/* Background Glow for Earned */}
            {!isLocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            )}

            <div className="flex items-start gap-4 relative z-10">
                {/* Icon Box */}
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner",
                    isLocked
                        ? "bg-white/5 border-white/5 text-muted-foreground"
                        : "bg-gradient-to-br from-white/10 to-white/5 border-white/10 text-primary"
                )}>
                    {isLocked ? <Lock className="w-6 h-6" /> : <item.icon className="w-7 h-7" />}
                </div>

                <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                        <h3 className={cn("font-bold text-base", isLocked ? "text-muted-foreground" : "text-white")}>
                            {item.name}
                        </h3>
                        {item.date && (
                            <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full">
                                {item.date}
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5em]">
                        {item.description}
                    </p>

                    <div className="flex items-center gap-2 mt-3">
                        <LevelBadge level={item.level} />
                        {item.streak && (
                            <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[10px] gap-1">
                                <Flame className="w-3 h-3" /> {item.streak} Day Streak
                            </Badge>
                        )}
                    </div>

                    {/* Progress Bar for Locked/In-Progress */}
                    {(isLocked || isInProgress) && item.condition && (
                        <div className="mt-3 space-y-1.5">
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>{item.condition}</span>
                                <span>{item.progress || 0}%</span>
                            </div>
                            <Progress value={item.progress || 0} className="h-1.5 bg-white/5" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CertificateCard = ({ cert }: { cert: any }) => {
    return (
        <div className="group relative bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300">
            <div className={cn("h-32 w-full flex items-center justify-center relative", cert.thumbnail)}>
                <Medal className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="text-[10px] opacity-70 uppercase tracking-widest">Certificate</div>
                    <div className="font-bold text-sm truncate">{cert.issuedBy}</div>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-white line-clamp-1" title={cert.title}>{cert.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Issued: {cert.date}</p>
                </div>

                <div className="pt-2 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1 hover:bg-primary hover:text-white border-white/10">
                        <Download className="w-3 h-3" /> Download
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-white">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

const SkillBar = ({ skill }: { skill: any }) => {
    return (
        <div className="bg-black/40 border border-white/10 rounded-xl p-5 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <skill.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-white">{skill.name}</h4>
                    <text className="text-xs text-muted-foreground">{skill.level}</text>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold">{skill.progress}%</div>
                </div>
            </div>
            <Progress value={skill.progress} className="h-2" indicatorClassName="bg-blue-500" />
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---

export default function StudentAchievements() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 800);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <DashboardSidebar role="student" />
            <main className="ml-64 p-8 min-h-screen">
                <div className="space-y-8 animate-in fade-in duration-500 pb-20">

                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-display glow-text">Achievements</h1>
                            <p className="text-muted-foreground mt-1">Celebrate your milestones and progress</p>
                        </div>

                        {/* XP & Level Summary */}
                        <div className="flex items-center gap-4 bg-black/40 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider">Level {ACHIEVEMENT_DATA.level}</div>
                                <div className="text-sm font-bold text-primary">{ACHIEVEMENT_DATA.levelTitle}</div>
                            </div>
                            <div className="h-10 w-10 relative flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
                                <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin-slow" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}></div>
                                <span className="text-[10px] font-bold">{Math.floor((ACHIEVEMENT_DATA.xp / ACHIEVEMENT_DATA.nextLevelXp) * 100)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* SUMMARY STATISTICS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 to-black/60 border border-purple-500/20 p-6">
                            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{ACHIEVEMENT_DATA.totalAchievements}</div>
                                    <div className="text-xs text-purple-200/60 font-medium">Badges Earned</div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/40 to-black/60 border border-blue-500/20 p-6">
                            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <Medal className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{ACHIEVEMENT_DATA.certificatesEarned}</div>
                                    <div className="text-xs text-blue-200/60 font-medium">Certificates</div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-900/40 to-black/60 border border-orange-500/20 p-6">
                            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                                    <Flame className="w-6 h-6 animate-pulse" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">{ACHIEVEMENT_DATA.academicStreak}</div>
                                    <div className="text-xs text-orange-200/60 font-medium">Day Streak</div>
                                </div>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900/40 to-black/60 border border-emerald-500/20 p-6">
                            <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Star className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">8.9</div>
                                    <div className="text-xs text-emerald-200/60 font-medium">Best Semester GPA</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* MAIN TABS CONTENT */}
                    <Tabs defaultValue="academic" className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            <TabsList className="bg-black/40 border border-white/10 p-1 rounded-xl h-auto flex-wrap">
                                <TabsTrigger value="academic" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2">Academic</TabsTrigger>
                                <TabsTrigger value="lms" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2">LMS</TabsTrigger>
                                <TabsTrigger value="activities" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2">Activities</TabsTrigger>
                                <TabsTrigger value="skills" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2">Skills</TabsTrigger>
                                <TabsTrigger value="certificates" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary rounded-lg px-4 py-2">Certificates</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="academic" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Academic Milestones</h2>
                                <div className="text-sm text-muted-foreground">Showing all available badges</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ACHIEVEMENT_DATA.categories.academic.map((badge, idx) => (
                                    <AchievementCard key={badge.id} item={badge} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="lms" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-semibold">Platform Engagement</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ACHIEVEMENT_DATA.categories.lms.map((badge, idx) => (
                                    <AchievementCard key={badge.id} item={badge} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="activities" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-semibold">Events & Participation</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ACHIEVEMENT_DATA.categories.activities.map((badge, idx) => (
                                    <AchievementCard key={badge.id} item={badge} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="skills" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-semibold">Skill Mastery</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {ACHIEVEMENT_DATA.categories.skills.map((skill) => (
                                    <SkillBar key={skill.id} skill={skill} />
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="certificates" className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                            <h2 className="text-xl font-semibold">Earned Certificates</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {ACHIEVEMENT_DATA.categories.certificates.map(cert => (
                                    <CertificateCard key={cert.id} cert={cert} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>
            </main>
        </div>
    );
}
