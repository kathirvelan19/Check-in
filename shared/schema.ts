import { z } from "zod";

// Staff/User schema
export const insertStaffSchema = z.object({
  code: z.string().min(1, "Staff code is required"),
  password: z.string().min(1, "Password is required"),
});

export const staffSchema = insertStaffSchema.extend({
  id: z.string(),
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = z.infer<typeof staffSchema>;

// Student schema
export const insertStudentSchema = z.object({
  regNo: z.string().min(1, "Registration number is required"),
  name: z.string().min(1, "Student name is required"),
  staffCode: z.string().min(1, "Staff code is required"),
});

export const studentSchema = insertStudentSchema.extend({
  id: z.string(),
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = z.infer<typeof studentSchema>;

// Attendance status enum
export const attendanceStatusSchema = z.enum(["P", "AB", "OD"]);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;

// Attendance record schema
export const insertAttendanceRecordSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  studentRegNo: z.string().min(1, "Student registration number is required"),
  status: attendanceStatusSchema,
  staffCode: z.string().min(1, "Staff code is required"),
});

export const attendanceRecordSchema = insertAttendanceRecordSchema.extend({
  id: z.string(),
});

export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

// Daily attendance summary
export const dailyAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  staffCode: z.string(),
  records: z.record(z.string(), attendanceStatusSchema), // regNo -> status
});

export type DailyAttendance = z.infer<typeof dailyAttendanceSchema>;
