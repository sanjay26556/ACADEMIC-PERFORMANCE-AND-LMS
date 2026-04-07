import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { CalendarCheck, ShieldAlert } from "lucide-react";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function StudentAttendanceView() {
    const [attendanceData, setAttendanceData] = useState<any>({ list: [], overall: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await fetch(`${API_URL}/student/attendance`, { headers: getAuthHeaders() });
                if (res.ok) {
                    const data = await res.json();

                    // Group by subject_name
                    const grouped: any = {};
                    let totalClassesCount = 0;
                    let totalPresentCount = 0;

                    data.forEach((record: any) => {
                        const subj = record.subject_name;
                        if (!grouped[subj]) {
                            grouped[subj] = {
                                courseName: subj,
                                courseCode: record.subject_code,
                                total: 0,
                                present: 0
                            };
                        }
                        grouped[subj].total += 1;
                        totalClassesCount += 1;
                        if (record.status === 'Present') {
                            grouped[subj].present += 1;
                            totalPresentCount += 1;
                        }
                    });

                    const processedData = Object.keys(grouped).map(k => ({
                        ...grouped[k],
                        percentage: Math.round((grouped[k].present / grouped[k].total) * 100)
                    }));

                    setAttendanceData({ list: processedData, overall: totalClassesCount > 0 ? Math.round((totalPresentCount / totalClassesCount) * 100) : 0 });
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to fetch attendance data");
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    if (loading) return <div className="text-center py-10">Loading attendance...</div>;

    const dataList = (attendanceData as any).list || [];
    const overall = (attendanceData as any).overall || 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CalendarCheck className="w-6 h-6 text-blue-600" /> Attendance History
                </h2>
                <div className={`px-4 py-2 rounded-lg font-bold ${overall >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Overall: {overall}%
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Course-wise Attendance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    {dataList.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">No attendance records found.</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Course Code</TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead className="text-center">Total Classes</TableHead>
                                        <TableHead className="text-center">Attended</TableHead>
                                        <TableHead className="text-right">Percentage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dataList.map((row: any) => (
                                        <TableRow key={row.courseCode}>
                                            <TableCell className="font-medium">{row.courseCode}</TableCell>
                                            <TableCell>{row.courseName}</TableCell>
                                            <TableCell className="text-center">{row.total}</TableCell>
                                            <TableCell className="text-center text-blue-600 font-semibold">{row.present}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${row.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700 font-bold'}`}>
                                                    {row.percentage}%
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {overall < 75 && overall > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex gap-3 shadow-sm">
                    <ShieldAlert className="w-6 h-6 shrink-0" />
                    <div>
                        <h4 className="font-bold">Low Attendance Warning</h4>
                        <p className="text-sm">Your overall attendance is below the required 75%. Please attend upcoming classes to avoid disciplinary action.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
