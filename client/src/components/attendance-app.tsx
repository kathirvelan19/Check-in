import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { localStorage_instance } from "@/lib/storage";
import { parseCSV, exportRosterToCSV } from "@/lib/csv-parser";
import { exportToExcel } from "@/lib/excel-export";
import { Staff, Student, DailyAttendance, AttendanceStatus } from "@shared/schema";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";

export default function AttendanceApp() {
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [roster, setRoster] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<DailyAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [csvInput, setCsvInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [absentStudents, setAbsentStudents] = useState("");
  const [onDutyStudents, setOnDutyStudents] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeColors, setIncludeColors] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  
  const { toast } = useToast();

  // Initialize app
  useEffect(() => {
    const user = localStorage_instance.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadUserData(user.code);
    }
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    setAttendanceDate(today);
    setEndDate(today);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    setStartDate(startOfMonth.toISOString().split('T')[0]);
    
    setIsLoading(false);
  }, []);

  const loadUserData = (staffCode: string) => {
    const userRoster = localStorage_instance.getRoster(staffCode);
    const userAttendance = localStorage_instance.getAllAttendance(staffCode);
    setRoster(userRoster);
    setAttendanceData(userAttendance);
  };

  const handleLogin = (staff: Staff) => {
    setCurrentUser(staff);
    loadUserData(staff.code);
  };

  const handleLogout = () => {
    localStorage_instance.clearCurrentUser();
    setCurrentUser(null);
    setRoster([]);
    setAttendanceData([]);
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  const handleRosterImport = () => {
    if (!csvInput.trim()) {
      toast({
        title: "Error",
        description: "Please paste CSV data first!",
        variant: "destructive",
      });
      return;
    }

    const result = parseCSV(csvInput, currentUser!.code);
    
    if (result.success) {
      setRoster(result.students);
      localStorage_instance.saveRoster(currentUser!.code, result.students);
      setCsvInput("");
      toast({
        title: "Success",
        description: `Imported ${result.students.length} students successfully!`,
      });
    } else {
      toast({
        title: "Error",
        description: result.errors.join(', '),
        variant: "destructive",
      });
    }
  };

  const handleRosterExport = () => {
    if (roster.length === 0) {
      toast({
        title: "Error",
        description: "No roster data to export!",
        variant: "destructive",
      });
      return;
    }

    const csvContent = exportRosterToCSV(roster);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `roster_${currentUser!.code}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Roster exported successfully!",
    });
  };

  const handleClearRoster = () => {
    if (confirm('Are you sure you want to clear all roster data? This action cannot be undone.')) {
      setRoster([]);
      localStorage_instance.saveRoster(currentUser!.code, []);
      toast({
        title: "Success",
        description: "Roster cleared successfully!",
      });
    }
  };

  const removeStudent = (regNo: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      const updatedRoster = roster.filter(student => student.regNo !== regNo);
      setRoster(updatedRoster);
      localStorage_instance.saveRoster(currentUser!.code, updatedRoster);
      toast({
        title: "Success",
        description: "Student removed successfully!",
      });
    }
  };

  const handleAttendanceMarking = () => {
    if (!attendanceDate) {
      toast({
        title: "Error",
        description: "Please select a date!",
        variant: "destructive",
      });
      return;
    }

    const absentList = absentStudents.split(',').map(s => s.trim()).filter(s => s);
    const onDutyList = onDutyStudents.split(',').map(s => s.trim()).filter(s => s);

    const records: Record<string, AttendanceStatus> = {};
    roster.forEach(student => {
      if (absentList.includes(student.regNo)) {
        records[student.regNo] = 'AB';
      } else if (onDutyList.includes(student.regNo)) {
        records[student.regNo] = 'OD';
      } else {
        records[student.regNo] = 'P';
      }
    });

    const dailyAttendance: DailyAttendance = {
      date: attendanceDate,
      staffCode: currentUser!.code,
      records,
    };

    localStorage_instance.saveAttendance(currentUser!.code, dailyAttendance);
    
    const updatedAttendance = localStorage_instance.getAllAttendance(currentUser!.code);
    setAttendanceData(updatedAttendance);

    toast({
      title: "Success",
      description: "Attendance saved successfully!",
    });
  };

  const loadSavedAttendance = () => {
    if (!attendanceDate) {
      toast({
        title: "Error",
        description: "Please select a date first!",
        variant: "destructive",
      });
      return;
    }

    const savedAttendance = localStorage_instance.getAttendanceByDate(currentUser!.code, attendanceDate);
    if (savedAttendance) {
      const records = savedAttendance.records;
      const absentList = Object.entries(records)
        .filter(([_, status]) => status === 'AB')
        .map(([regNo, _]) => regNo);
      const onDutyList = Object.entries(records)
        .filter(([_, status]) => status === 'OD')
        .map(([regNo, _]) => regNo);
      
      setAbsentStudents(absentList.join(','));
      setOnDutyStudents(onDutyList.join(','));
      
      toast({
        title: "Success",
        description: "Saved attendance loaded successfully!",
      });
    } else {
      toast({
        title: "Warning",
        description: "No attendance data found for this date!",
        variant: "destructive",
      });
    }
  };

  const clearAttendanceForm = () => {
    setAbsentStudents("");
    setOnDutyStudents("");
  };

  const handleExcelExport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates!",
        variant: "destructive",
      });
      return;
    }

    if (roster.length === 0) {
      toast({
        title: "Error",
        description: "No roster data available for export!",
        variant: "destructive",
      });
      return;
    }

    try {
      const relevantAttendance = localStorage_instance.getAttendanceInDateRange(
        currentUser!.code,
        startDate,
        endDate
      );

      await exportToExcel(
        roster,
        relevantAttendance,
        startDate,
        endDate,
        currentUser!.code,
        { includeColors, includeSummary }
      );

      toast({
        title: "Success",
        description: "Excel report exported successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export Excel report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    setCurrentTab(action);
  };

  // Filtered roster for search
  const filteredRoster = useMemo(() => {
    if (!searchTerm) return roster;
    return roster.filter(student =>
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [roster, searchTerm]);

  // Attendance preview
  const attendancePreview = useMemo(() => {
    const absentList = absentStudents.split(',').map(s => s.trim()).filter(s => s);
    const onDutyList = onDutyStudents.split(',').map(s => s.trim()).filter(s => s);

    return roster.map(student => {
      let status: AttendanceStatus = 'P';
      if (absentList.includes(student.regNo)) {
        status = 'AB';
      } else if (onDutyList.includes(student.regNo)) {
        status = 'OD';
      }
      return { ...student, status };
    });
  }, [roster, absentStudents, onDutyStudents]);

  // Report preview data
  const reportData = useMemo(() => {
    const relevantAttendance = localStorage_instance.getAttendanceInDateRange(
      currentUser?.code || '',
      startDate,
      endDate
    );

    return roster.map(student => {
      const studentRecord = {
        ...student,
        dates: {} as Record<string, AttendanceStatus>,
        totalPresent: 0,
        totalAbsent: 0,
        totalOnDuty: 0,
      };

      relevantAttendance.forEach(daily => {
        const status = daily.records[student.regNo];
        if (status) {
          studentRecord.dates[daily.date] = status;
          if (status === 'P') studentRecord.totalPresent++;
          else if (status === 'AB') studentRecord.totalAbsent++;
          else if (status === 'OD') studentRecord.totalOnDuty++;
        }
      });

      return studentRecord;
    });
  }, [roster, startDate, endDate, currentUser?.code]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-clipboard-check text-primary-foreground"></i>
              </div>
              <h1 className="text-lg font-semibold text-foreground">Class Attendance</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, <span data-testid="text-staff-name">{currentUser.code}</span>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive/80"
                data-testid="button-logout"
              >
                <i className="fas fa-sign-out-alt mr-1"></i>Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation Tabs */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-home' },
              { id: 'roster', label: 'Manage Roster', icon: 'fas fa-users' },
              { id: 'attendance', label: 'Mark Attendance', icon: 'fas fa-clipboard-list' },
              { id: 'reports', label: 'Reports & Export', icon: 'fas fa-chart-bar' },
            ].map(tab => (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={() => setCurrentTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  currentTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
                data-testid={`button-tab-${tab.id}`}
              >
                <i className={`${tab.icon} mr-2`}></i>{tab.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Dashboard Tab */}
        {currentTab === 'dashboard' && (
          <Dashboard
            roster={roster}
            attendanceData={attendanceData}
            onQuickAction={handleQuickAction}
          />
        )}
        
        {/* Roster Management Tab */}
        {currentTab === 'roster' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Student Roster Management</h2>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="rosterImport" className="block text-sm font-medium text-foreground mb-2">
                      Import Roster (CSV Format)
                    </Label>
                    <Textarea
                      id="rosterImport"
                      rows={6}
                      value={csvInput}
                      onChange={(e) => setCsvInput(e.target.value)}
                      placeholder="Paste CSV data here:&#10;101,Arun Kumar&#10;102,Ganesh Raj&#10;103,Priya Sharma&#10;104,Meena Patel&#10;105,Rahul Singh"
                      data-testid="textarea-roster-import"
                    />
                  </div>
                  <div className="flex flex-col justify-end space-y-3">
                    <Button onClick={handleRosterImport} data-testid="button-import-roster">
                      <i className="fas fa-upload mr-2"></i>Import Roster
                    </Button>
                    <Button variant="secondary" onClick={handleRosterExport} data-testid="button-export-roster">
                      <i className="fas fa-download mr-2"></i>Export Roster
                    </Button>
                    <Button variant="destructive" onClick={handleClearRoster} data-testid="button-clear-roster">
                      <i className="fas fa-trash mr-2"></i>Clear All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Current Roster</h3>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">
                      Total Students: <span data-testid="text-roster-count">{roster.length}</span>
                    </span>
                    <Input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search students..."
                      className="w-48"
                      data-testid="input-search-students"
                    />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reg No</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoster.length > 0 ? (
                        filteredRoster.map((student, index) => (
                          <tr key={student.id} className="border-b border-border" data-testid={`row-student-${index}`}>
                            <td className="py-3 px-4 text-foreground font-mono">{student.regNo}</td>
                            <td className="py-3 px-4 text-foreground">{student.name}</td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStudent(student.regNo)}
                                className="text-destructive hover:text-destructive/80"
                                data-testid={`button-remove-student-${student.regNo}`}
                              >
                                <i className="fas fa-trash mr-1"></i>Remove
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-muted-foreground">
                            {roster.length === 0
                              ? "No students in roster. Import CSV data to get started."
                              : "No students match your search criteria."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Attendance Marking Tab */}
        {currentTab === 'attendance' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Mark Daily Attendance</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="attendanceDate" className="block text-sm font-medium text-foreground mb-2">
                      Select Date
                    </Label>
                    <Input
                      type="date"
                      id="attendanceDate"
                      value={attendanceDate}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                      data-testid="input-attendance-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="absentStudents" className="block text-sm font-medium text-foreground mb-2">
                      Absent Students (Reg Numbers)
                    </Label>
                    <Input
                      type="text"
                      id="absentStudents"
                      value={absentStudents}
                      onChange={(e) => setAbsentStudents(e.target.value)}
                      placeholder="e.g., 102,105"
                      data-testid="input-absent-students"
                    />
                  </div>
                  <div>
                    <Label htmlFor="onDutyStudents" className="block text-sm font-medium text-foreground mb-2">
                      On-Duty Students (Reg Numbers)
                    </Label>
                    <Input
                      type="text"
                      id="onDutyStudents"
                      value={onDutyStudents}
                      onChange={(e) => setOnDutyStudents(e.target.value)}
                      placeholder="e.g., 103,107"
                      data-testid="input-onduty-students"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <Button onClick={handleAttendanceMarking} data-testid="button-save-attendance">
                    <i className="fas fa-save mr-2"></i>Save Attendance
                  </Button>
                  <Button variant="secondary" onClick={loadSavedAttendance} data-testid="button-load-attendance">
                    <i className="fas fa-eye mr-2"></i>View Saved Attendance
                  </Button>
                  <Button variant="outline" onClick={clearAttendanceForm} data-testid="button-clear-attendance">
                    <i className="fas fa-refresh mr-2"></i>Clear Form
                  </Button>
                </div>
                
                {/* Status Legend */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-600 rounded mr-2"></div>
                    <span className="text-sm text-foreground">Present (P)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
                    <span className="text-sm text-foreground">Absent (AB)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-orange-600 rounded mr-2"></div>
                    <span className="text-sm text-foreground">On Duty (OD)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Attendance Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Reg No</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student Name</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendancePreview.length > 0 ? (
                        attendancePreview.map((student, index) => (
                          <tr key={student.id} className="border-b border-border" data-testid={`row-attendance-preview-${index}`}>
                            <td className="py-3 px-4 text-foreground font-mono">{student.regNo}</td>
                            <td className="py-3 px-4 text-foreground">{student.name}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  student.status === 'P'
                                    ? 'bg-green-600 text-white'
                                    : student.status === 'AB'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-orange-600 text-white'
                                }`}
                              >
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-muted-foreground">
                            Please select a date and ensure roster is loaded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Reports & Export Tab */}
        {currentTab === 'reports' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Reports & Excel Export</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <Label htmlFor="startDate" className="block text-sm font-medium text-foreground mb-2">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      data-testid="input-start-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-2">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      data-testid="input-end-date"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleExcelExport} className="w-full" data-testid="button-export-excel">
                      <i className="fas fa-file-excel mr-2"></i>Export Excel Report
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeColors"
                      checked={includeColors}
                      onCheckedChange={(checked) => setIncludeColors(checked as boolean)}
                      data-testid="checkbox-include-colors"
                    />
                    <Label htmlFor="includeColors" className="text-sm text-foreground">
                      Include colored cells in Excel
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeSummary"
                      checked={includeSummary}
                      onCheckedChange={(checked) => setIncludeSummary(checked as boolean)}
                      data-testid="checkbox-include-summary"
                    />
                    <Label htmlFor="includeSummary" className="text-sm text-foreground">
                      Include summary statistics
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Report Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Reg No</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Total P</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Total AB</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">Total OD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.length > 0 ? (
                        reportData.map((student, index) => (
                          <tr key={student.id} className="border-b border-border" data-testid={`row-report-${index}`}>
                            <td className="py-2 px-3 text-foreground font-mono">{student.regNo}</td>
                            <td className="py-2 px-3 text-foreground">{student.name}</td>
                            <td className="py-2 px-3 text-foreground">{student.totalPresent}</td>
                            <td className="py-2 px-3 text-foreground">{student.totalAbsent}</td>
                            <td className="py-2 px-3 text-foreground">{student.totalOnDuty}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No data available for the selected date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Summary Statistics */}
                {reportData.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600" data-testid="text-total-present-summary">
                        {reportData.reduce((sum, student) => sum + student.totalPresent, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Present</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600" data-testid="text-total-absent-summary">
                        {reportData.reduce((sum, student) => sum + student.totalAbsent, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Absent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600" data-testid="text-total-onduty-summary">
                        {reportData.reduce((sum, student) => sum + student.totalOnDuty, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total On Duty</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
