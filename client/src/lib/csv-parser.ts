import { Student } from "@shared/schema";

export interface CSVParseResult {
  success: boolean;
  students: Student[];
  errors: string[];
}

export function parseCSV(csvData: string, staffCode: string): CSVParseResult {
  const result: CSVParseResult = {
    success: false,
    students: [],
    errors: []
  };

  if (!csvData.trim()) {
    result.errors.push("CSV data is empty");
    return result;
  }

  const lines = csvData.trim().split('\n');
  const students: Student[] = [];
  const regNumbers = new Set<string>();

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const parts = trimmedLine.split(',').map(part => part.trim());
    
    if (parts.length < 2) {
      result.errors.push(`Line ${index + 1}: Missing data. Expected format: RegNo,Name`);
      return;
    }

    const [regNo, name, ...extraParts] = parts;
    
    if (!regNo) {
      result.errors.push(`Line ${index + 1}: Registration number is empty`);
      return;
    }

    if (!name) {
      result.errors.push(`Line ${index + 1}: Student name is empty`);
      return;
    }

    if (regNumbers.has(regNo)) {
      result.errors.push(`Line ${index + 1}: Duplicate registration number: ${regNo}`);
      return;
    }

    regNumbers.add(regNo);
    students.push({
      id: `${staffCode}_${regNo}_${Date.now()}`,
      regNo,
      name,
      staffCode
    });
  });

  result.students = students;
  result.success = result.errors.length === 0 && students.length > 0;

  if (students.length === 0 && result.errors.length === 0) {
    result.errors.push("No valid student data found");
  }

  return result;
}

export function exportRosterToCSV(students: Student[]): string {
  if (students.length === 0) {
    return "";
  }

  const csvLines = students.map(student => `${student.regNo},${student.name}`);
  return csvLines.join('\n');
}
