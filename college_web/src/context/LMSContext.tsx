import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";

// Types
export interface Department {
    id: number;
    name: string;
    code: string;
}

export interface Student {
    id: number;
    user_id: number;
    name: string;
    register_number: string;
    email: string;
    department: string;
    role: 'student';
    enrolledCourses?: number[];
}

export interface Teacher {
    id: number;
    user_id: number;
    name: string;
    register_number: string;
    email: string;
    department: string;
    role: 'teacher';
}

export interface LMSContextType {
    students: Student[];
    teachers: Teacher[];
    departments: Department[];
    courses: any[];
    colleges: any[];
    refreshData: () => void;

    // Actions
    addStudent: (studentData: any) => Promise<void>;
    addTeacher: (teacherData: any) => Promise<void>;
    deleteUser: (userId: number) => Promise<void>;
    addStudentToClass: (registerNumber: string) => Promise<boolean>;

    // Loading State
    isLoading: boolean;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000';

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Helper to get headers with token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn("No token found in localStorage");
        }
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    };

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        // Only fetch global data if Admin
        if (token && user.role === 'admin') {
            setIsLoading(true);
            try {
                // Fetch Users (Students & Teachers)
                const usersRes = await fetch(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
                if (usersRes.ok) {
                    const users = await usersRes.json();
                    setStudents(users.filter((u: any) => u.role === 'student'));
                    setTeachers(users.filter((u: any) => u.role === 'teacher'));
                }

                // Fetch Departments
                const deptsRes = await fetch(`${API_URL}/admin/departments`, { headers: getAuthHeaders() });
                if (deptsRes.ok) {
                    setDepartments(await deptsRes.json());
                }

                // Fetch Courses
                const coursesRes = await fetch(`${API_URL}/admin/courses`, { headers: getAuthHeaders() });
                if (coursesRes.ok) {
                    setCourses(await coursesRes.json());
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load dashboard data");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addStudent = async (studentData: any) => {
        try {
            const res = await fetch(`${API_URL}/admin/create-user`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...studentData, role: 'student' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Student added successfully");
            fetchData(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || "Failed to add student");
            throw error;
        }
    };

    const addTeacher = async (teacherData: any) => {
        try {
            const res = await fetch(`${API_URL}/admin/create-user`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...teacherData, role: 'teacher' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            toast.success("Teacher added successfully");
            fetchData(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || "Failed to add teacher");
            throw error;
        }
    };

    // Teacher Specific Actions
    const addStudentToClass = async (registerNumber: string) => {
        try {
            const res = await fetch(`${API_URL}/teacher/add-student`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ register_number: registerNumber })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.success(data.message);
            return true;
        } catch (error: any) {
            toast.error(error.message || "Failed to add student");
            return false;
        }
    };

    const deleteUser = async (userId: number) => {
        try {
            const res = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error("Failed to delete user");

            toast.success("User removed successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    return (
        <LMSContext.Provider value={{
            students,
            teachers,
            departments,
            courses,
            colleges: [], // Kept as empty to prevent crashes in legacy components
            refreshData: fetchData,
            addStudent,
            addTeacher,
            deleteUser,
            addStudentToClass,
            isLoading
        }}>
            {children}
        </LMSContext.Provider>
    );
};

export const useLMS = () => {
    const context = useContext(LMSContext);
    if (context === undefined) {
        throw new Error('useLMS must be used within a LMSProvider');
    }
    return context;
};
