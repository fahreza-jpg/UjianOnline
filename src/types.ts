export type UserRole = 'admin' | 'guru' | 'staff' | 'siswa';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  major?: string;
  nis?: string;
}

export interface Student {
  nis: string;
  name: string;
  class: string;
  major: string;
  password?: string;
}

export interface AttendanceRecord {
  id?: string;
  userId: string;
  userName: string;
  userRole: string;
  date: string;
  time: string;
  status: 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  type: 'karyawan' | 'siswa';
  city: string;
  major?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'hard';
}

export interface Exam {
  id: string;
  title: string;
  major: string;
  duration: number; // minutes
  passingScore: number;
}

export interface TestResult {
  id?: string;
  studentNis: string;
  studentName: string;
  examId: string;
  examTitle: string;
  score: number;
  date: string;
  time: string;
  major: string;
}
