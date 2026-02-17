import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, FileSpreadsheet, Upload, Download, Loader2, Users } from "lucide-react";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function MarksManagement() {
    // Filters
    const [year, setYear] = useState("1");
    const [section, setSection] = useState("A");
    const [semester, setSemester] = useState("1");

    // Data
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [students, setStudents] = useState([]);
    const [classStrength, setClassStrength] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load Subjects when Semester changes
    useEffect(() => {
        fetch(`${API_URL}/teacher/subjects?semester=${semester}`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setSubjects(data);
                if (data.length > 0) setSelectedSubject(String(data[0].id));
                else setSelectedSubject("");
            })
            .catch(err => toast.error("Failed to load subjects"));
    }, [semester]);

    // Load Class Strength
    useEffect(() => {
        // Map Year to Semester? Or just use Section + Semester logic?
        // Prompt says "Display Class Strength dynamically based on selected Year & Section".
        // But we also need to know if we are filtering students by Semester.
        // Let's pass all to backend.
        fetch(`${API_URL}/teacher/class-strength?year=${year}&section=${section}&semester=${semester}`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setClassStrength(data.strength))
            .catch(err => console.error(err));
    }, [year, section, semester]);

    // Load Marks Data when Subject/Section/Semester changes
    useEffect(() => {
        if (!selectedSubject) return;
        setLoading(true);
        fetch(`${API_URL}/teacher/marks/${selectedSubject}?section=${section}&semester=${semester}`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => setStudents(data))
            .catch(err => toast.error("Failed to load marks"))
            .finally(() => setLoading(false));
    }, [selectedSubject, section, semester]);

    // Handle Mark Change
    const handleMarkChange = (studentId, examType, value) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return {
                    ...s,
                    marks: {
                        ...s.marks,
                        [examType]: value
                    }
                };
            }
            return s;
        }));
    };

    // Save Marks
    const handleSave = async () => {
        setSaving(true);
        try {
            // Flatten data for API
            // API expects: [{ student_id, exam_type, marks_obtained, max_marks }]
            const marksData = [];
            students.forEach(s => {
                Object.entries(s.marks).forEach(([type, score]) => {
                    if (score !== "" && score !== undefined && score !== null) {
                        marksData.push({
                            student_id: s.id,
                            exam_type: type,
                            marks_obtained: parseFloat(score),
                            max_marks: type === 'Assignment' ? 10 : 100 // Example logic
                        });
                    }
                });
            });

            const res = await fetch(`${API_URL}/teacher/marks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    subject_id: parseInt(selectedSubject),
                    marks_data: marksData
                })
            });

            if (res.ok) toast.success("Marks saved successfully");
            else throw new Error();
        } catch (err) {
            toast.error("Failed to save marks");
        } finally {
            setSaving(false);
        }
    };

    // Export Excel
    const handleExport = async () => {
        try {
            const res = await fetch(`${API_URL}/teacher/marks/export?subject_id=${selectedSubject}&section=${section}&semester=${semester}`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Marks_Sem${semester}_Sec${section}_${subjects.find(s => s.id == selectedSubject)?.code}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            toast.error("Failed to export marks");
        }
    };

    // Import Excel
    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject_id', selectedSubject);

        // Toast promise?
        toast.promise(
            fetch(`${API_URL}/teacher/marks/import`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            }).then(async res => {
                if (!res.ok) throw new Error();
                // Reload data
                const refresh = await fetch(`${API_URL}/teacher/marks/${selectedSubject}?section=${section}&semester=${semester}`, { headers: getAuthHeaders() });
                const data = await refresh.json();
                setStudents(data);
                return "Import successful";
            }),
            {
                loading: 'Importing marks...',
                success: 'Marks imported successfully',
                error: 'Failed to import marks'
            }
        );

        // Reset file input
        e.target.value = null;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Marks Management</h2>
                    <p className="text-neutral-400">Manage student marks, imports, and exports.</p>
                </div>

                {/* Class Selection Controls */}
                <div className="flex flex-wrap gap-2 items-center bg-neutral-900/50 p-2 rounded-lg border border-neutral-800">
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px] bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1st Year</SelectItem>
                            <SelectItem value="2">2nd Year</SelectItem>
                            <SelectItem value="3">3rd Year</SelectItem>
                            <SelectItem value="4">4th Year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={section} onValueChange={setSection}>
                        <SelectTrigger className="w-[80px] bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Sec" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="A">Sec A</SelectItem>
                            <SelectItem value="B">Sec B</SelectItem>
                            <SelectItem value="C">Sec C</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger className="w-[100px] bg-neutral-950 border-neutral-700">
                            <SelectValue placeholder="Sem" />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Strength: {classStrength}
                    </div>
                </div>
            </div>

            {/* Subject Selection Tabs */}
            {subjects.length > 0 ? (
                <Tabs value={selectedSubject} onValueChange={setSelectedSubject} className="w-full">
                    <TabsList className="w-full justify-start bg-neutral-900/50 border border-neutral-800 p-1 flex-wrap h-auto">
                        {subjects.map(sub => (
                            <TabsTrigger
                                key={sub.id}
                                value={String(sub.id)}
                                className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                            >
                                {sub.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            ) : (
                <div className="text-center py-4 text-neutral-500">No subjects found for this semester.</div>
            )}

            {/* Content Area */}
            {selectedSubject && (
                <Card className="bg-neutral-900/40 border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg text-emerald-400">
                            {subjects.find(s => String(s.id) === selectedSubject)?.name} - Marks Entry
                        </CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={handleImport}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    accept=".xlsx, .xls"
                                />
                                <Button variant="outline" className="border-neutral-700 hover:bg-neutral-800">
                                    <Upload className="mr-2 h-4 w-4" /> Import Excel
                                </Button>
                            </div>
                            <Button variant="outline" onClick={handleExport} className="border-neutral-700 hover:bg-neutral-800">
                                <Download className="mr-2 h-4 w-4" /> Export Excel
                            </Button>
                            <Button onClick={handleSave} disabled={saving} className="bg-white text-black hover:bg-neutral-200">
                                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                            </div>
                        ) : (
                            <div className="rounded-md border border-neutral-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-neutral-900">
                                        <TableRow className="border-neutral-800 hover:bg-neutral-900">
                                            <TableHead className="w-[120px] text-neutral-400">Register No</TableHead>
                                            <TableHead className="w-[200px] text-neutral-400">Name</TableHead>
                                            <TableHead className="text-center text-neutral-400">UT1</TableHead>
                                            <TableHead className="text-center text-neutral-400">UT2</TableHead>
                                            <TableHead className="text-center text-neutral-400">UT3</TableHead>
                                            <TableHead className="text-center text-neutral-400">Model 1</TableHead>
                                            <TableHead className="text-center text-neutral-400">Assignment</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                                                    No students found in this Year/Section/Semester.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            students.map(student => (
                                                <TableRow key={student.id} className="border-neutral-800 hover:bg-neutral-900/50">
                                                    <TableCell className="font-mono text-neutral-300 font-medium">
                                                        {student.register_number}
                                                    </TableCell>
                                                    <TableCell className="text-neutral-300">
                                                        {student.name}
                                                    </TableCell>
                                                    {['UT1', 'UT2', 'UT3', 'Model Exam 1', 'Assignment'].map(type => (
                                                        <TableCell key={type} className="p-1">
                                                            <Input
                                                                type="number"
                                                                className="h-8 w-20 mx-auto text-center bg-transparent border-neutral-800 focus:border-emerald-500 hover:bg-neutral-900"
                                                                placeholder="-"
                                                                value={student.marks?.[type] || ''}
                                                                onChange={(e) => handleMarkChange(student.id, type, e.target.value)}
                                                            />
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
