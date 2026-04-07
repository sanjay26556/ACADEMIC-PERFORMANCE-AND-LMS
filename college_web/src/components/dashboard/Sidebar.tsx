import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useLMS } from "@/context/LMSContext";
import {
  Building2,
  Layers,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Trophy,
  Bell,
  Settings,
  LogOut,
  Users,
  FolderOpen,
  ClipboardList,
  UserCog,
  LucideIcon
} from "lucide-react";

interface SidebarProps {
  role: "student" | "teacher" | "admin";
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  badge?: string;
}

const Sidebar = ({ role }: SidebarProps) => {
  const location = useLocation();
  const { students, teachers } = useLMS();
  const [userProfile, setUserProfile] = useState<{ name: string; initials: string; roleLabel: string }>({
    name: "User",
    initials: "US",
    roleLabel: role.charAt(0).toUpperCase() + role.slice(1)
  });

  useEffect(() => {
    const fetchProfile = () => {
      // 1. Try to get name from LocalStorage (Set during login)
      // 1. Try to get name from LocalStorage
      const storedName = localStorage.getItem("currentUserName");
      const userObj = localStorage.getItem("user");
      const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

      if (storedName) {
        setUserProfile({
          name: storedName,
          initials: storedName.substring(0, 2).toUpperCase(),
          roleLabel: roleLabel
        });
        return;
      }

      if (userObj) {
        try {
          const parsedUser = JSON.parse(userObj);
          if (parsedUser.name) {
            setUserProfile({
              name: parsedUser.name,
              initials: parsedUser.name.substring(0, 2).toUpperCase(),
              roleLabel: roleLabel
            });
            return;
          }
        } catch (e) {
          console.error("Failed to parse user object");
        }
      }

      // 2. Fallback to Context ID lookup (Backward compatibility)
      if (role === 'student') {
        const email = localStorage.getItem("currentStudentEmail");
        const found = students.find(s => s.email === email);
        if (found) {
          setUserProfile({
            name: found.name,
            initials: found.name.substring(0, 2).toUpperCase(),
            roleLabel: "Student"
          });
        }
      } else if (role === 'teacher') {
        const email = localStorage.getItem("currentTeacherEmail");
        const found = teachers.find(t => t.email === email);
        if (found) {
          setUserProfile({
            name: found.name,
            initials: found.name.substring(0, 2).toUpperCase(),
            roleLabel: "Teacher"
          });
        }
      }
    };

    fetchProfile();
  }, [role, students, teachers]);

  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      { icon: LayoutDashboard, label: "Dashboard", href: role === 'student' ? `/dashboard/student` : `/lms/${role}/dashboard` },
    ];

    const studentItems: NavItem[] = [
      { icon: BookOpen, label: "My Courses", href: `/dashboard/student/courses` },
      { icon: FileText, label: "Assignments", href: `/dashboard/student/assignments` },
      { icon: ClipboardList, label: "Assessments", href: `/dashboard/student/assessments` },
      { icon: Calendar, label: "Attendance", href: `/dashboard/student/attendance` },
      { icon: BarChart3, label: "Performance", href: `/dashboard/student/performance` },
      { icon: Trophy, label: "Achievements", href: `/dashboard/student/achievements` },
    ];

    const teacherItems: NavItem[] = [
      { icon: BookOpen, label: "My Courses", href: `/lms/teacher/dashboard?tab=courses` },
      { icon: Users, label: "Students", href: `/lms/teacher/dashboard?tab=students` },
      { icon: Calendar, label: "Attendance", href: `/lms/teacher/dashboard?tab=attendance` },
      { icon: ClipboardList, label: "Assessments", href: `/lms/teacher/dashboard?tab=assessments` },
      { icon: FileText, label: "Assignments", href: `/lms/teacher/dashboard?tab=assignments` },
      { icon: Trophy, label: "Marks", href: `/lms/teacher/dashboard?tab=marks` },
      { icon: BarChart3, label: "Reports & Analytics", href: `/lms/teacher/dashboard?tab=reports` },
    ];

    const adminItems: NavItem[] = [

      { icon: UserCog, label: "Users", href: `/lms/admin/dashboard?tab=users` },
      { icon: BarChart3, label: "Analytics", href: `/lms/admin/dashboard?tab=analytics` },
      { icon: Layers, label: "Departments", href: `/lms/admin/dashboard?tab=departments` },
      { icon: GraduationCap, label: "Teachers", href: `/lms/admin/dashboard?tab=teachers` },
      { icon: Users, label: "Students", href: `/lms/admin/dashboard?tab=students` },
    ];

    const roleItems = { student: studentItems, teacher: teacherItems, admin: adminItems };
    return [...baseItems, ...roleItems[role as keyof typeof roleItems]];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    localStorage.clear(); // Clear all
    window.location.href = "/";
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-display font-bold text-xl text-sidebar-foreground">
            Edu<span className="text-primary">Pulse</span>
          </span>
        </Link>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-semibold">{userProfile.initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate" title={userProfile.name}>{userProfile.name}</p>
            <Badge variant="glass" className="text-xs capitalize">{userProfile.roleLabel}</Badge>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => {
            const isActive = (item.href === (location.pathname + location.search)) ||
              (item.href === location.pathname && !location.search.includes('tab='));
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    isActive
                      ? "bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-[0_8px_20px_-8px_rgba(var(--primary),0.5)] translate-y-[-2px] scale-[1.02]"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300")} />
                  <span className="flex-1 tracking-wide">{item.label}</span>
                  {item.badge && (
                    <Badge variant="default" className="h-5 px-1.5 text-[10px] bg-primary/20 text-primary hover:bg-primary/30 border-0">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-1">

        <Link
          to={role === 'teacher' ? `/lms/teacher/dashboard?tab=notifications` : `/dashboard/${role}/notifications`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="flex-1">Notifications</span>
          <NotificationBadge />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Assuming the API returns notifications array
          if (Array.isArray(data)) {
            const unread = data.filter((n: any) => !n.is_read).length;
            setCount(unread);
          }
        }
      } catch (err) {
        // console.error("Failed to fetch notifications");
      }
    };
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <Badge variant="default" className="h-5 px-1.5 text-xs">{count}</Badge>
  );
}

export default Sidebar;
