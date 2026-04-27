import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function LandingPage() {
  const majors = [
    { title: 'TKJ', full: 'Teknik Komputer & Jaringan', icon: '💻' },
    { title: 'DKV', full: 'Desain Komunikasi Visual', icon: '🎨' },
    { title: 'AK', full: 'Akuntansi', icon: '📊' },
    { title: 'BC', full: 'Broadcasting', icon: '🎥' },
    { title: 'MPLB', full: 'Manajemen Perkantoran & Layanan Bisnis', icon: '🏢' },
    { title: 'BD', full: 'Bisnis Digital', icon: '🛍️' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              PU
            </div>
            <span className="font-bold text-xl tracking-tight">SMK Prima Unggul</span>
          </div>
          <Link 
            to="/login" 
            className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
          >
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
          >
            Membangun Masa Depan <br />
            <span className="text-primary">Unggul & Berkarakter</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
          >
            Sistem Informasi Terintegrasi SMK Prima Unggul Tangerang Selatan. 
            Absensi, Ujian Online, dan Manajemen Data dalam satu platform.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg flex items-center gap-2 hover:shadow-xl transition-all">
              Mulai Sekarang <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16">Program Keahlian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {majors.map((m, i) => (
              <motion.div 
                key={m.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/20 hover:shadow-md transition-all text-left"
              >
                <div className="text-4xl mb-4">{m.icon}</div>
                <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                <p className="text-gray-500">{m.full}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Absensi Realtime</h3>
              <p className="text-gray-600">Pencatatan kehadiran siswa dan karyawan secara digital dan akurat.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Ujian Online</h3>
              <p className="text-gray-600">Pelaksanaan ujian berbasis web dengan beragam tingkat kesulitan.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">Manajemen User</h3>
              <p className="text-gray-600">Kelola data siswa, guru, dan admin dengan mudah dan tersinkronisasi.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center font-bold">PU</div>
            <span className="font-bold text-lg">SMK Prima Unggul</span>
          </div>
          <p className="text-gray-400 mb-4">Tangerang Selatan, Indonesia</p>
          <p className="text-gray-500 text-sm">&copy; 2026 SMK Prima Unggul. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
