import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../App';
import { Search, Filter, CheckCircle2, XCircle, Clock, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { Student, AttendanceRecord } from '../types';

export default function AttendanceStudent() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const majors = ['TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'];
  const classes = ['X', 'XI', 'XII'];

  const fetchStudents = async () => {
    if (!selectedMajor || !selectedClass) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'students'),
        where('major', '==', selectedMajor),
        where('class', '==', selectedClass)
      );
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => doc.data() as Student);
      setStudents(data);
      
      // Reset attendance map
      const initialMap: Record<string, string> = {};
      data.forEach(s => initialMap[s.nis] = 'Hadir');
      setAttendanceMap(initialMap);
      setDone(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (nis: string, status: string) => {
    setAttendanceMap(prev => ({ ...prev, [nis]: status }));
  };

  const submitAttendance = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      const batchPromises = students.map(s => {
        const record: AttendanceRecord = {
          userId: s.nis,
          userName: s.name,
          userRole: 'siswa',
          date: today,
          time: time,
          status: attendanceMap[s.nis] as any,
          type: 'siswa',
          city: 'Tangerang Selatan',
          major: s.major
        };
        return addDoc(collection(db, 'attendance'), record);
      });

      await Promise.all(batchPromises);
      setDone(true);
    } catch (err) {
      alert('Gagal mengirim absensi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <UserCheck size={28} className="text-primary" /> Absensi Siswa
        </h1>

        <div className="flex flex-wrap gap-4 items-end bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">Jurusan</label>
            <select 
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="w-48 bg-white border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Pilih Jurusan</option>
              {majors.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase px-1">Kelas</label>
            <select 
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-48 bg-white border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="">Pilih Kelas</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button 
            onClick={fetchStudents}
            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center gap-2 h-[48px]"
          >
            <Search size={18} /> Cari Siswa
          </button>
        </div>
      </div>

      {students.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
            <h2 className="font-bold text-gray-900">
              Daftar Siswa - {selectedMajor} {selectedClass}
              <span className="ml-3 text-xs font-medium text-gray-500 px-2 py-1 bg-white border rounded-full">
                {students.length} Siswa
              </span>
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Clock size={14} /> {new Date().toLocaleTimeString('id-ID')}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">NIS</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase text-center">Status Kehadiran</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.nis} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500">{student.nis}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {['Hadir', 'Izin', 'Sakit', 'Alpa'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.nis, status)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                              attendanceMap[student.nis] === status 
                                ? (status === 'Hadir' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' : 
                                   status === 'Alpa' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 
                                   'bg-yellow-500 text-white border-yellow-500 shadow-lg shadow-yellow-500/20')
                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-gray-50 border-t flex justify-end">
            <button
              onClick={submitAttendance}
              disabled={loading || done}
              className={`px-10 py-4 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                done 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30'
              }`}
            >
              {done ? (
                <> <CheckCircle2 size={20} /> Berhasil Terkirim</>
              ) : (
                loading ? 'Mengirim...' : 'Simpan Absensi'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
