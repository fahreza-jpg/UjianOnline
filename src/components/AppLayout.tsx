import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  ClipboardCheck, 
  FileBox, 
  LogOut, 
  Menu, 
  X,
  FileSpreadsheet,
  GraduationCap,
  BookOpen,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', path: '/app', icon: LayoutDashboard, roles: ['admin', 'guru', 'staff', 'siswa'] },
    { name: 'Absensi Karyawan', path: '/app/absensi-karyawan', icon: ClipboardCheck, roles: ['admin', 'guru', 'staff'] },
    { name: 'Absensi Siswa', path: '/app/absensi-siswa', icon: UserSquare2, roles: ['admin', 'guru'] },
    { name: 'Rekap Absensi', path: '/app/rekap', icon: FileSpreadsheet, roles: ['admin', 'guru'] },
    { name: 'Kelola Ujian', path: '/app/kelola-ujian', icon: BookOpen, roles: ['admin', 'guru'] },
    { name: 'Hasil Ujian', path: '/app/hasil-ujian', icon: Trophy, roles: ['admin', 'guru'] },
    { name: 'Data Siswa', path: '/app/siswa', icon: Users, roles: ['admin'] },
    { name: 'User Management', path: '/app/users', icon: FileBox, roles: ['admin'] },
    { name: 'Ujian Online', path: '/app/ujian', icon: GraduationCap, roles: ['siswa'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role || ''));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-64 bg-white border-r z-40 lg:relative"
          >
            <div className="p-6 flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
                PU
              </div>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight">SMK Prima Unggul</h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Sistem Akademik</p>
              </div>
            </div>

            <nav className="px-4 space-y-1">
              {filteredMenu.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-6 left-6 right-6 p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] text-gray-400 uppercase font-bold mb-2">Tangerang Selatan</p>
              <p className="text-xs text-gray-600 font-medium">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b flex items-center justify-between px-8 z-30">
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role} {user?.major ? ` • ${user.major}` : ''}</p>
            </div>
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border">
              {user?.name?.[0].toUpperCase()}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-primary transition-colors ml-2"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
