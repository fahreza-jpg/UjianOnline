import { useAuth } from '../App';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  ClipboardCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { user } = useAuth();
  
  const stats = [
    { name: 'Total Siswa', value: '850', icon: Users, color: 'bg-blue-500' },
    { name: 'Hadir Hari Ini', value: '98%', icon: UserCheck, color: 'bg-green-500' },
    { name: 'Guru & Staff', value: '45', icon: ClipboardCheck, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Selamat Pagi, {user?.name}!</h1>
        <p className="text-gray-500">Berikut adalah ringkasan data akademik SMK Prima Unggul hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6"
          >
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold">Informasi Sekolah</h2>
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <MapPin size={16} /> Tangerang Selatan
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase">Tahun Ajaran</p>
                <p className="text-sm font-bold">2023/2024 Genap</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">KKM Ujian</p>
                <p className="text-xs text-gray-500 text-pretty">Nilai minimum untuk kelulusan mata pelajaran.</p>
              </div>
              <span className="text-2xl font-bold text-primary">50</span>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-bold mb-4">Jurusan Tersedia</h3>
              <div className="flex flex-wrap gap-2">
                {['TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'].map(j => (
                  <span key={j} className="px-3 py-1 bg-red-50 text-primary text-xs font-bold rounded-lg border border-red-100">
                    {j}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-primary mb-4">Akses Cepat</h2>
            <p className="text-sm text-gray-600 mb-8 max-w-xs">Lakukan absensi harian dengan satu klik atau cek rekapitulasi data terbaru.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-white rounded-2xl shadow-sm border border-primary/10 text-left hover:shadow-md transition-all active:scale-95">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white mb-3">
                  <UserCheck size={16} />
                </div>
                <p className="font-bold text-sm">Absen Sekarang</p>
              </button>
              <button className="p-4 bg-white rounded-2xl shadow-sm border border-primary/10 text-left hover:shadow-md transition-all active:scale-95">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white mb-3">
                  <TrendingUp size={16} />
                </div>
                <p className="font-bold text-sm">Lihat Rekap</p>
              </button>
            </div>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform"></div>
        </div>
      </div>
    </div>
  );
}
