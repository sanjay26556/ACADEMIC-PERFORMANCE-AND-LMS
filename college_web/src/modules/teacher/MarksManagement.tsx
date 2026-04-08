import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Save, Upload, Download, Loader2, FileSpreadsheet, AlertTriangle, CheckCircle, Search } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const fetchWithAuth = async (url: string, options: any = {}) => {
    const res = await fetch(url, options);
    if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/lms/teacher/login';
        throw new Error('Unauthorized');
    }
    return res;
};


const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function MarksManagement() {
    // Filters
    const [year, setYear] = useState("All");
    const [semester, setSemester] = useState("All");
    const [section, setSection] = useState("All");

    // Data
    const [allCourses, setAllCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");

    // Marks Data
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Import State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importPreview, setImportPreview] = useState([]);
    const [importErrors, setImportErrors] = useState(false);
    const [validating, setValidating] = useState(false);
    const [importing, setImporting] = useState(false);

    // Initial Load - Get All Courses
    useEffect(() => {
        fetchWithAuth(`${API_URL}/teacher/courses`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllCourses(data);
                    setFilteredCourses(data);
                }
            })
            .catch(err => toast.error("Failed to load courses"));
    }, []);

    // Filter Courses
    useEffect(() => {
        let filtered = allCourses;
        if (year !== "All") filtered = filtered.filter(c => c.year === year);
        if (semester !== "All") filtered = filtered.filter(c => c.semester === semester);
        if (section !== "All") filtered = filtered.filter(c => c.section === section);
        setFilteredCourses(filtered);

        // Reset selection if current selection is hidden
        if (selectedCourseId && !filtered.find(c => String(c.id) === selectedCourseId)) {
            setSelectedCourseId("");
            setStudents([]);
        }
    }, [year, semester, section, allCourses]);

    // Load Marks Data when Course Selected
    useEffect(() => {
        if (!selectedCourseId) return;
        setLoading(true);
        fetchWithAuth(`${API_URL}/teacher/marks/${selectedCourseId}`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setStudents(data);
                else setStudents([]);
            })
            .catch(err => toast.error("Failed to load marks"))
            .finally(() => setLoading(false));
    }, [selectedCourseId]);

    // Handle Mark Change
    const handleMarkChange = (studentId, examType, value) => {
        const upperVal = value.toUpperCase();
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                return {
                    ...s,
                    marks: {
                        ...s.marks,
                        [examType]: upperVal
                    }
                };
            }
            return s;
        }));
    };

    // Save Marks
    const handleSave = async (dataToSave = null) => {
        const isImport = !!dataToSave;
        if (!isImport) setSaving(true);
        else setImporting(true);

        try {
            let marksData = [];

            if (isImport) {
                // From Import Preview
                dataToSave.forEach(row => {
                    Object.entries(row.marks).forEach(([type, score]) => {
                        if (score !== undefined && score !== null && score !== "") {
                            let isAbsent = score === 'AB';
                            let val = isAbsent ? 0 : parseFloat(String(score));

                            marksData.push({
                                student_id: row.student_id,
                                exam_type: type,
                                marks_obtained: val,
                                is_absent: isAbsent,
                                max_marks: type === 'Assignment' ? 10 : 100
                            });
                        }
                    });
                });
            } else {
                // From Manual Entry
                if (Array.isArray(students)) {
                    students.forEach(s => {
                        Object.entries(s.marks).forEach(([type, score]) => {
                            if (score !== "" && score !== undefined && score !== null) {
                                let val = String(score).toUpperCase();
                                let isAbsent = val === 'AB';
                                let numVal = isAbsent ? 0 : parseFloat(val);

                                if (!isAbsent && (isNaN(numVal) || numVal < 0 || numVal > 100)) return;

                                marksData.push({
                                    student_id: s.id,
                                    exam_type: type,
                                    marks_obtained: numVal,
                                    is_absent: isAbsent,
                                    max_marks: type === 'Assignment' ? 10 : 100
                                });
                            }
                        });
                    });
                }
            }

            if (marksData.length === 0) {
                toast.info("No marks to save");
                setSaving(false);
                setImporting(false);
                return;
            }

            const res = await fetchWithAuth(`${API_URL}/teacher/marks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify({
                    course_id: parseInt(selectedCourseId),
                    marks_data: marksData
                })
            });

            if (res.ok) {
                toast.success("Marks saved successfully");
                if (isImport) {
                    setImportModalOpen(false);
                    setImportPreview([]);
                    setImportFile(null);
                }
                // Refresh
                const refresh = await fetchWithAuth(`${API_URL}/teacher/marks/${selectedCourseId}`, { headers: getAuthHeaders() });
                const data = await refresh.json();
                setStudents(data);
            }
            else throw new Error();
        } catch (err) {
            toast.error("Failed to save marks");
        } finally {
            setSaving(false);
            setImporting(false);
        }
    };

    // Export Excel
    const handleExportExcel = async () => {
        try {
            const res = await fetchWithAuth(`${API_URL}/teacher/marks/export?course_id=${selectedCourseId}`, {
                headers: getAuthHeaders()
            });
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const course = allCourses.find(c => String(c.id) === selectedCourseId);
            a.download = `Marks_${course?.code || 'Course'}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            toast.error("Failed to export marks");
        }
    };

    // Validate Import File
    const handleValidateImport = async () => {
        if (!importFile) return;
        setValidating(true);
        setImportPreview([]);

        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('course_id', selectedCourseId);

        try {
            const res = await fetchWithAuth(`${API_URL}/teacher/marks/validate-import`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setImportPreview(data.validatedRows);
                setImportErrors(data.hasErrors);
                if (data.validatedRows.length === 0) toast.warning("No valid data found in file");
            } else {
                toast.error(data.message || "Validation failed");
            }
        } catch (err) {
            toast.error("Failed to validate file");
        } finally {
            setValidating(false);
        }
    };

    // PDF Export
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const course = allCourses.find(s => String(s.id) === selectedCourseId);

        // Header
        doc.setFontSize(18);
        doc.text("COLLEGE OF ENGINEERING", 105, 15, { align: "center" });
        doc.setFontSize(12);
        doc.text("Department of Computer Science and Engineering", 105, 22, { align: "center" });
        doc.setFontSize(10);
        doc.text(`Internal Marks Report - ${course?.name} (${course?.code})`, 105, 28, { align: "center" });
        doc.text(`Semester: ${course?.semester} | Section: ${course?.section} | Year: ${course?.year}`, 105, 33, { align: "center" });

        // Table
        const tableColumn = ["Register No", "Name", "UT1", "UT2", "UT3", "Model", "Assign", "Overall (40)"];
        const tableRows = [];

        if (Array.isArray(students)) students.forEach(student => {
            const marks = student.marks || {};
            const row = [
                student.register_number,
                student.name,
                marks['UT1'] || '-',
                marks['UT2'] || '-',
                marks['UT3'] || '-',
                marks['Model Exam 1'] || '-',
                marks['Assignment'] || '-',
                calculateOverall(marks)
            ];
            tableRows.push(row);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [22, 163, 74] }
        });

        doc.save(`Marks_${course?.code}_Report.pdf`);
    };

    const calculateOverall = (marks: any) => {
        const ut1 = parseFloat(marks['UT1']) || 0;
        const ut2 = parseFloat(marks['UT2']) || 0;
        const ut3 = parseFloat(marks['UT3']) || 0;
        const model = parseFloat(marks['Model Exam 1']) || 0;
        const assignment = parseFloat(marks['Assignment']) || 0;
        
        const calculated = (ut1 / 10) + (ut2 / 10) + (ut3 / 10) + (model / 20) + (assignment / 2);
        return isNaN(calculated) ? 0 : Math.round(calculated * 10) / 10;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Marks Management</h2>
                    <p className="text-neutral-400">Manage student marks for your courses.</p>
                </div>

                {/* Filters & Course Selection */}
                <div className="flex flex-wrap gap-4 items-center bg-neutral-900/50 p-4 rounded-lg border border-neutral-800">
                    <div className="flex gap-2 items-center">
                        <Label>Filter:</Label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="w-[100px] bg-neutral-950 border-neutral-700">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Yrs</SelectItem>
                                <SelectItem value="1">1st Year</SelectItem>
                                <SelectItem value="2">2nd Year</SelectItem>
                                <SelectItem value="3">3rd Year</SelectItem>
                                <SelectItem value="4">4th Year</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={semester} onValueChange={setSemester}>
                            <SelectTrigger className="w-[100px] bg-neutral-950 border-neutral-700">
                                <SelectValue placeholder="Sem" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Sems</SelectItem>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select value={section} onValueChange={setSection}>
                            <SelectTrigger className="w-[100px] bg-neutral-950 border-neutral-700">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Secs</SelectItem>
                                <SelectItem value="A">Sec A</SelectItem>
                                <SelectItem value="B">Sec B</SelectItem>
                                <SelectItem value="C">Sec C</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 h-8 border-l border-neutral-700 mx-2 hidden md:block"></div>

                    <div className="flex gap-2 items-center flex-1">
                        <Label className="whitespace-nowrap">Select Course:</Label>
                        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                            <SelectTrigger className="w-full max-w-[400px] bg-neutral-950 border-neutral-700">
                                <SelectValue placeholder={filteredCourses.length ? "Select a course" : "No courses match filter"} />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCourses.map(c => (
                                    <SelectItem key={c.id} value={String(c.id)}>
                                        {c.name} ({c.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            {selectedCourseId ? (
                <Card className="bg-neutral-900/40 border-neutral-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg text-emerald-400">
                            {allCourses.find(c => String(c.id) === selectedCourseId)?.name} - Marks Entry
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setImportModalOpen(true)} className="border-neutral-700 hover:bg-neutral-800">
                                <Upload className="mr-2 h-4 w-4" /> Import Excel
                            </Button>

                            <div className="flex gap-1">
                                <Button variant="outline" size="icon" onClick={handleExportExcel} className="border-neutral-700 hover:bg-neutral-800" title="Export Excel">
                                    <FileSpreadsheet className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleExportPDF} className="border-neutral-700 hover:bg-neutral-800" title="Export PDF">
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button onClick={() => handleSave(null)} disabled={saving} className="bg-white text-black hover:bg-neutral-200 ml-2">
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
                                            <TableHead className="text-center text-emerald-400 font-bold">Overall (40)</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {!Array.isArray(students) || students.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-12 text-neutral-500">
                                                    No students enrolled in this course yet.
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
                                                                type="text"
                                                                className="h-8 w-20 mx-auto text-center bg-transparent border-neutral-800 focus:border-emerald-500 hover:bg-neutral-900"
                                                                placeholder="-"
                                                                value={student.marks?.[type] || ''}
                                                                onChange={(e) => handleMarkChange(student.id, type, e.target.value)}
                                                            />
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className="p-1 text-center font-bold text-emerald-400">
                                                        {calculateOverall(student.marks)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800 border-dashed">
                    Select a course to view or enter marks.
                </div>
            )}

            {/* Import Modal */}
            <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
                <DialogContent className="max-w-4xl bg-neutral-950 border-neutral-800">
                    <DialogHeader>
                        <DialogTitle className="text-white">Import Marks from Excel</DialogTitle>
                        <DialogDescription className="text-neutral-400">
                            Upload an Excel file with 'Register Number' and exam columns (UT1, UT2, etc.)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        {!importFile ? (
                            <div className="border-2 border-dashed border-neutral-800 rounded-xl p-8 text-center hover:border-emerald-500/50 transition-colors">
                                <Upload className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                                <p className="text-neutral-300 font-medium">Drag & Drop or Click to Upload</p>
                                <p className="text-sm text-neutral-500 mt-2">Supports .xlsx, .xls</p>
                                <Input
                                    type="file"
                                    className="hidden"
                                    id="file-upload"
                                    accept=".xlsx, .xls"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setImportFile(e.target.files[0]);
                                            setImportPreview([]); // Reset preview
                                        }
                                    }}
                                />
                                <Button variant="secondary" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                                    Select File
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-neutral-900 p-4 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="text-emerald-500" />
                                        <span className="text-white font-medium">{importFile.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setImportFile(null)}>Change</Button>
                                        {!importPreview.length && (
                                            <Button size="sm" onClick={handleValidateImport} disabled={validating} className="bg-emerald-600 text-white hover:bg-emerald-700">
                                                {validating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Validate & Preview
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {importPreview.length > 0 && (
                                    <div className="border border-neutral-800 rounded-lg overflow-hidden max-h-[400px] flex flex-col">
                                        <div className="bg-neutral-900 p-3 border-b border-neutral-800 flex justify-between items-center sticky top-0">
                                            <h3 className="font-semibold text-neutral-300">Preview Data ({importPreview.length} rows)</h3>
                                            {importErrors && (
                                                <div className="flex items-center text-red-400 text-xs px-2 py-1 bg-red-950/30 rounded border border-red-900/50">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Errors found.
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-auto flex-1">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-neutral-800 bg-neutral-900/50">
                                                        <TableHead className="text-neutral-400">Register No</TableHead>
                                                        <TableHead className="text-neutral-400">Name</TableHead>
                                                        <TableHead className="text-center text-neutral-400">Marks Preview</TableHead>
                                                        <TableHead className="text-right text-neutral-400">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {importPreview.map((row, idx) => (
                                                        <TableRow key={idx} className="border-neutral-800">
                                                            <TableCell className="font-mono text-neutral-300">{row.register_number}</TableCell>
                                                            <TableCell className="text-neutral-300">{row.name}</TableCell>
                                                            <TableCell className="text-center text-xs text-neutral-500">
                                                                {Object.entries(row.marks).map(([k, v]) => `${k}:${v}`).join(', ')}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {row.isValid ? (
                                                                    <span className="text-emerald-500 flex items-center justify-end gap-1">
                                                                        <CheckCircle className="w-3 h-3" /> Valid
                                                                    </span>
                                                                ) : (
                                                                    <div className="text-red-400 text-xs flex flex-col items-end">
                                                                        {row.errors.map((err, i) => <span key={i}>{err}</span>)}
                                                                    </div>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImportModalOpen(false)} className="border-neutral-700">Cancel</Button>
                        <Button
                            onClick={() => handleSave(importPreview.filter(r => r.isValid))}
                            disabled={!importPreview.length || importing}
                            className="bg-white text-black hover:bg-neutral-200"
                        >
                            {importing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Import {importPreview.filter(r => r.isValid).length} Valid Rows
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
