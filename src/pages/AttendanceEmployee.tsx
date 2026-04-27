import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../App';
import { Calendar, Clock, MapPin, CheckCircle2, History } from 'lucide-react';
import { motion } from 'motion/react';
import { AttendanceRecord } from '../types';

export default function AttendanceEmployee() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [alreadyAbsen, setAlreadyAbsen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    const q = query(
      collection(db, 'attendance'),
      where('userId', '==', user.uid),
      where('type', '==', 'karyawan'),
      orderBy('date', 'desc'),
      limit(5)
    );
    const snap = await getDocs(q);
    const records = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
    setHistory(records);
    
    const checkedToday = records.some(r => r.date === today);
    setAlreadyAbsen(checkedToday);
  };

  const handleAbsen = async () => {
    if (!user || alreadyAbsen) return;
    setLoading(true);
    try {
      const now = new Date();
      const record: AttendanceRecord = {
        userId: user.uid,
        userName: user.name,
        userRole: user.role,
        date: today,
        time: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'Hadir',
        type: 'karyawan',
        city: 'Tangerang Selatan',
      };
      await addDoc(collection(db, 'attendance'), record);
      setAlreadyAbsen(true);
      fetchHistory();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim absensi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Clock size={160} />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">Absensi Mandiri Karyawan</h1>
          <p className="text-gray-500 mb-8">Silakan lakukan absensi harian Anda di bawah ini.</p>

          <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-gray-50 p-8 rounded-2xl border border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="text-primary" size={20} />
                <span className="font-bold">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="text-primary" size={20} />
                <span className="font-medium">Tangerang Selatan (Sekolah)</span>
              </div>
            </div>

            <button
              onClick={handleAbsen}
              disabled={loading || alreadyAbsen}
              className={`px-12 py-6 rounded-2xl font-bold text-lg transition-all transform active:scale-95 flex items-center gap-3 ${
                alreadyAbsen 
                  ? 'bg-green-100 text-green-600 cursor-default' 
                  : 'bg-primary text-white hover:bg-primary-dark shadow-xl shadow-primary/30'
              }`}
            >
              {alreadyAbsen ? (
                <>
                  <CheckCircle2 size={24} /> Anda Sudah Absen
                </>
              ) : (
                loading ? 'Memproses...' : 'Klik Untuk Absen'
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-900 px-2 font-bold">
          <History size={20} className="text-gray-400" />
          Riwayat Absensi Terakhir
        </div>
        
        <div className="grid gap-3">
          {history.length > 0 ? history.map((record, i) => (
            <motion.div 
              key={record.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-sm font-bold">
                  {record.status[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{record.date}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock size={12} /> {record.time} • <MapPin size={12} /> {record.city}
                  </div>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {record.status}
              </span>
            </motion.div>
          )) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400">
              Belum ada riwayat absensi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
