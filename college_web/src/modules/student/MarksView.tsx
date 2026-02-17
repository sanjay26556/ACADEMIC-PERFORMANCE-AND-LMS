import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const API_URL = 'http://localhost:5000';
const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

export default function MarksView() {
    const [semester, setSemester] = useState("1");
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(false);

    // Process marks to group by subject
    const [processedMarks, setProcessedMarks] = useState([]);

    useEffect(() => {
        setLoading(true);
        fetch(`${API_URL}/student/marks?semester=${semester}`, { headers: getAuthHeaders() })
            .then(res => res.json())
            .then(data => {
                setMarks(data);
                processData(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [semester]);

    const processData = (data) => {
        // Group by subject
        // Data: [{ subject_name, subject_code, exam_type, marks_obtained, max_marks }]
        const subjects = {};
        data.forEach(m => {
            if (!subjects[m.subject_code]) {
                subjects[m.subject_code] = {
                    code: m.subject_code,
                    name: m.subject_name,
                    marks: {}
                };
            }
            subjects[m.subject_code].marks[m.exam_type] = m.marks_obtained;
        });
        setProcessedMarks(Object.values(subjects));
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.text(`Marks Statement - Semester ${semester}`, 14, 15);

        const tableColumn = ["Subject Code", "Subject Name", "UT1", "UT2", "UT3", "Model", "Assign"];
        const tableRows = processedMarks.map(sub => [
            sub.code,
            sub.name,
            sub.marks['UT1'] || '-',
            sub.marks['UT2'] || '-',
            sub.marks['UT3'] || '-',
            sub.marks['Model Exam 1'] || '-',
            sub.marks['Assignment'] || '-'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`Marks_Sem${semester}.pdf`);
    };

    const downloadExcel = () => {
        const data = processedMarks.map(sub => ({
            "Subject Code": sub.code,
            "Subject Name": sub.name,
            "UT1": sub.marks['UT1'] || '-',
            "UT2": sub.marks['UT2'] || '-',
            "UT3": sub.marks['UT3'] || '-',
            "Model Exam 1": sub.marks['Model Exam 1'] || '-',
            "Assignment": sub.marks['Assignment'] || '-'
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Marks");
        XLSX.writeFile(wb, `Marks_Sem${semester}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold">My Marks</h2>
                    <p className="text-muted-foreground">View your academic performance report.</p>
                </div>
                <div className="flex gap-2 items-center">
                    <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={downloadExcel} title="Download Excel">
                        <FileSpreadsheet className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={downloadPDF} title="Download PDF">
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="border-border/50">
                <CardHeader>
                    <CardTitle className="text-lg">Semester {semester} Results</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Subject Name</TableHead>
                                    <TableHead className="text-center">UT1</TableHead>
                                    <TableHead className="text-center">UT2</TableHead>
                                    <TableHead className="text-center">UT3</TableHead>
                                    <TableHead className="text-center">Model</TableHead>
                                    <TableHead className="text-center">Assign</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedMarks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No marks data found for this semester.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    processedMarks.map((sub, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell className="font-mono font-medium">{sub.code}</TableCell>
                                            <TableCell>{sub.name}</TableCell>
                                            <TableCell className="text-center">{sub.marks['UT1'] || '-'}</TableCell>
                                            <TableCell className="text-center">{sub.marks['UT2'] || '-'}</TableCell>
                                            <TableCell className="text-center">{sub.marks['UT3'] || '-'}</TableCell>
                                            <TableCell className="text-center">{sub.marks['Model Exam 1'] || '-'}</TableCell>
                                            <TableCell className="text-center">{sub.marks['Assignment'] || '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
