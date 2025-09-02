import { Student, DailyAttendance, AttendanceStatus } from "@shared/schema";

declare global {
  interface Window {
    ExcelJS: any;
  }
}

export interface ExportOptions {
  includeColors: boolean;
  includeSummary: boolean;
}

export async function exportToExcel(
  roster: Student[],
  attendanceData: DailyAttendance[],
  startDate: string,
  endDate: string,
  staffCode: string,
  options: ExportOptions = { includeColors: true, includeSummary: true }
): Promise<void> {
  if (!window.ExcelJS) {
    throw new Error("ExcelJS library not loaded");
  }

  const workbook = new window.ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance');

  // Get all dates in range
  const dates = getDateRange(startDate, endDate);
  
  // Create attendance map for quick lookup
  const attendanceMap = new Map<string, Record<string, AttendanceStatus>>();
  attendanceData.forEach(daily => {
    attendanceMap.set(daily.date, daily.records);
  });

  // Prepare headers
  const headers = ['Reg No', 'Name', ...dates];
  if (options.includeSummary) {
    headers.push('Total Present', 'Total Absent', 'Total On Duty');
  }

  // Add headers to worksheet
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE6F3FF' }
  };

  // Add student data
  roster.forEach(student => {
    const row: (string | number)[] = [student.regNo, student.name];
    let presentCount = 0;
    let absentCount = 0;
    let onDutyCount = 0;

    dates.forEach(date => {
      const dayAttendance = attendanceMap.get(date);
      const status = dayAttendance?.[student.regNo] || '';
      row.push(status);

      if (status === 'P') presentCount++;
      else if (status === 'AB') absentCount++;
      else if (status === 'OD') onDutyCount++;
    });

    if (options.includeSummary) {
      row.push(presentCount, absentCount, onDutyCount);
    }

    const dataRow = worksheet.addRow(row);

    // Apply colors if enabled
    if (options.includeColors) {
      dates.forEach((date, index) => {
        const cellIndex = index + 3; // 1-indexed, starting after RegNo and Name
        const cell = dataRow.getCell(cellIndex);
        const status = row[cellIndex - 1] as string;

        if (status === 'P') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF22C55E' }
          };
          cell.font = { color: { argb: 'FFFFFFFF' } };
        } else if (status === 'AB') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFEF4444' }
          };
          cell.font = { color: { argb: 'FFFFFFFF' } };
        } else if (status === 'OD') {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF59E0B' }
          };
          cell.font = { color: { argb: 'FFFFFFFF' } };
        }
      });
    }
  });

  // Auto-size columns
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const length = cell.value ? cell.value.toString().length : 0;
      if (length > maxLength) {
        maxLength = length;
      }
    });
    column.width = Math.min(maxLength + 2, 20);
  });

  // Generate filename and download
  const filename = `attendance_${staffCode}_${startDate}_to_${endDate}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  window.URL.revokeObjectURL(url);
}

function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
