import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useAuth } from '../App';
import { FileDown, Calendar, Search, Filter } from 'lucide-react';
import { AttendanceRecord } from '../types';

export default function RekapAbsensi() {
  const { user } = useAuth();
  const [data, setData] = useState<AttendanceRecord[]>([]);
  const [type, setType] = useState<'siswa' | 'karyawan'>('siswa');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'attendance'),
        where('type', '==', type),
        orderBy('date', 'desc')
      );
      const snap = await getDocs(q);
      setData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Rekapitulasi Absensi</h1>
          <p className="text-sm text-gray-500">Laporan kehadiran harian {type}.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all">
          <FileDown size={18} /> Export Excel
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setType('siswa')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'siswa' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
          >
            Absensi Siswa
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setType('karyawan')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${type === 'karyawan' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Absensi Karyawan
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari nama..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
          </div>
          <button className="p-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-100">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Waktu</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">{type === 'siswa' ? 'NIS' : 'UID'}</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Nama</th>
                {type === 'siswa' && <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Jurusan</th>}
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record) => (
                <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{record.date}</td>
                  <td className="px-6 py-4 text-gray-500">{record.time}</td>
                  <td className="px-6 py-4 text-gray-500">{record.userId}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{record.userName}</td>
                  {type === 'siswa' && <td className="px-6 py-4 text-gray-500 font-bold">{record.major}</td>}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      record.status === 'Hadir' ? 'bg-green-100 text-green-600' :
                      record.status === 'Alpa' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Data tidak ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
