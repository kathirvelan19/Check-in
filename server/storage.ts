import { type Staff, type InsertStaff, type Student, type InsertStudent, type AttendanceRecord, type InsertAttendanceRecord } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Staff methods
  getStaff(id: string): Promise<Staff | undefined>;
  getStaffByCode(code: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  
  // Student methods
  getStudentsByStaffCode(staffCode: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  deleteStudent(id: string): Promise<boolean>;
  clearRosterByStaffCode(staffCode: string): Promise<boolean>;
  
  // Attendance methods
  getAttendanceByStaffAndDateRange(staffCode: string, startDate: string, endDate: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  deleteAttendanceByStaffAndDate(staffCode: string, date: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private staff: Map<string, Staff>;
  private students: Map<string, Student>;
  private attendanceRecords: Map<string, AttendanceRecord>;

  constructor() {
    this.staff = new Map();
    this.students = new Map();
    this.attendanceRecords = new Map();
  }

  async getStaff(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async getStaffByCode(code: string): Promise<Staff | undefined> {
    return Array.from(this.staff.values()).find(staff => staff.code === code);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const staff: Staff = { ...insertStaff, id };
    this.staff.set(id, staff);
    return staff;
  }

  async getStudentsByStaffCode(staffCode: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(student => student.staffCode === staffCode);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = randomUUID();
    const student: Student = { ...insertStudent, id };
    this.students.set(id, student);
    return student;
  }

  async deleteStudent(id: string): Promise<boolean> {
    return this.students.delete(id);
  }

  async clearRosterByStaffCode(staffCode: string): Promise<boolean> {
    const studentsToDelete = Array.from(this.students.entries())
      .filter(([_, student]) => student.staffCode === staffCode)
      .map(([id, _]) => id);
    
    studentsToDelete.forEach(id => this.students.delete(id));
    return true;
  }

  async getAttendanceByStaffAndDateRange(staffCode: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter(record => 
      record.staffCode === staffCode && 
      record.date >= startDate && 
      record.date <= endDate
    );
  }

  async createAttendanceRecord(insertRecord: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = randomUUID();
    const record: AttendanceRecord = { ...insertRecord, id };
    this.attendanceRecords.set(id, record);
    return record;
  }

  async deleteAttendanceByStaffAndDate(staffCode: string, date: string): Promise<boolean> {
    const recordsToDelete = Array.from(this.attendanceRecords.entries())
      .filter(([_, record]) => record.staffCode === staffCode && record.date === date)
      .map(([id, _]) => id);
    
    recordsToDelete.forEach(id => this.attendanceRecords.delete(id));
    return recordsToDelete.length > 0;
  }
}

export const storage = new MemStorage();
