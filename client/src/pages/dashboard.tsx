import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Student, DailyAttendance } from "@shared/schema";

interface DashboardProps {
  roster: Student[];
  attendanceData: DailyAttendance[];
  onQuickAction: (action: string) => void;
}

export default function Dashboard({ roster, attendanceData, onQuickAction }: DashboardProps) {
  const today = new Date().toISOString().split('T')[0];
  
  const todayStats = useMemo(() => {
    const todayAttendance = attendanceData.find(a => a.date === today);
    if (!todayAttendance) {
      return { present: 0, absent: 0, onDuty: 0 };
    }

    const records = todayAttendance.records;
    return {
      present: Object.values(records).filter(status => status === 'P').length,
      absent: Object.values(records).filter(status => status === 'AB').length,
      onDuty: Object.values(records).filter(status => status === 'OD').length,
    };
  }, [attendanceData, today]);

  const recentAttendance = useMemo(() => {
    return attendanceData
      .slice(-5)
      .reverse()
      .map(attendance => {
        const records = attendance.records;
        return {
          date: attendance.date,
          present: Object.values(records).filter(status => status === 'P').length,
          absent: Object.values(records).filter(status => status === 'AB').length,
          onDuty: Object.values(records).filter(status => status === 'OD').length,
          total: Object.keys(records).length,
        };
      });
  }, [attendanceData]);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-students">
                  {roster.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-check text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-present-today">
                  {todayStats.present}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-times text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Absent Today</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-absent-today">
                  {todayStats.absent}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-briefcase text-orange-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">On Duty</p>
                <p className="text-2xl font-bold text-foreground" data-testid="text-on-duty-today">
                  {todayStats.onDuty}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => onQuickAction('attendance')}
              className="p-4 h-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center flex flex-col items-center space-y-2"
              data-testid="button-mark-attendance"
            >
              <i className="fas fa-clipboard-check text-2xl"></i>
              <span className="font-medium">Mark Today's Attendance</span>
            </Button>
            
            <Button
              onClick={() => onQuickAction('roster')}
              variant="secondary"
              className="p-4 h-auto text-center flex flex-col items-center space-y-2"
              data-testid="button-view-roster"
            >
              <i className="fas fa-users text-2xl"></i>
              <span className="font-medium">View Student Roster</span>
            </Button>
            
            <Button
              onClick={() => onQuickAction('reports')}
              variant="outline"
              className="p-4 h-auto text-center flex flex-col items-center space-y-2"
              data-testid="button-export-report"
            >
              <i className="fas fa-download text-2xl"></i>
              <span className="font-medium">Export Excel Report</span>
            </Button>
            
            <Button
              onClick={() => onQuickAction('reports')}
              variant="outline"
              className="p-4 h-auto text-center flex flex-col items-center space-y-2"
              data-testid="button-view-history"
            >
              <i className="fas fa-history text-2xl"></i>
              <span className="font-medium">View Attendance History</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Attendance */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Attendance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Present</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Absent</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">On Duty</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.length > 0 ? (
                  recentAttendance.map((record, index) => (
                    <tr key={record.date} className="border-b border-border" data-testid={`row-attendance-${index}`}>
                      <td className="py-3 px-4 text-foreground">{record.date}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {record.present}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {record.absent}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {record.onDuty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-foreground">{record.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No attendance records found. Start marking attendance to see data here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
