import { Staff, Student, DailyAttendance, AttendanceStatus } from "@shared/schema";

export class LocalStorage {
  private getKey(prefix: string, staffCode?: string): string {
    return staffCode ? `${prefix}_${staffCode}` : prefix;
  }

  // Staff management
  saveStaff(staff: Staff): void {
    const existingStaff = this.getAllStaff();
    const updatedStaff = existingStaff.filter(s => s.code !== staff.code);
    updatedStaff.push(staff);
    localStorage.setItem('staff_accounts', JSON.stringify(updatedStaff));
  }

  getStaffByCode(code: string): Staff | null {
    const staff = this.getAllStaff();
    return staff.find(s => s.code === code) || null;
  }

  getAllStaff(): Staff[] {
    const data = localStorage.getItem('staff_accounts');
    return data ? JSON.parse(data) : [];
  }

  // Current user session
  setCurrentUser(staff: Staff): void {
    localStorage.setItem('currentUser', JSON.stringify(staff));
  }

  getCurrentUser(): Staff | null {
    const data = localStorage.getItem('currentUser');
    return data ? JSON.parse(data) : null;
  }

  clearCurrentUser(): void {
    localStorage.removeItem('currentUser');
  }

  // Roster management
  saveRoster(staffCode: string, roster: Student[]): void {
    const key = this.getKey('roster', staffCode);
    localStorage.setItem(key, JSON.stringify(roster));
  }

  getRoster(staffCode: string): Student[] {
    const key = this.getKey('roster', staffCode);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  // Attendance management
  saveAttendance(staffCode: string, attendance: DailyAttendance): void {
    const allAttendance = this.getAllAttendance(staffCode);
    const updatedAttendance = allAttendance.filter(a => a.date !== attendance.date);
    updatedAttendance.push(attendance);
    
    const key = this.getKey('attendance', staffCode);
    localStorage.setItem(key, JSON.stringify(updatedAttendance));
  }

  getAttendanceByDate(staffCode: string, date: string): DailyAttendance | null {
    const allAttendance = this.getAllAttendance(staffCode);
    return allAttendance.find(a => a.date === date) || null;
  }

  getAllAttendance(staffCode: string): DailyAttendance[] {
    const key = this.getKey('attendance', staffCode);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  getAttendanceInDateRange(staffCode: string, startDate: string, endDate: string): DailyAttendance[] {
    const allAttendance = this.getAllAttendance(staffCode);
    return allAttendance.filter(a => a.date >= startDate && a.date <= endDate);
  }

  // Clear all data for a staff member
  clearAllData(staffCode: string): void {
    localStorage.removeItem(this.getKey('roster', staffCode));
    localStorage.removeItem(this.getKey('attendance', staffCode));
  }
}

export const localStorage_instance = new LocalStorage();
