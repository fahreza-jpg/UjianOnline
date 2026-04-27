import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogIn, User, Shield, GraduationCap, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoginPage() {
  const [type, setType] = useState<'karyawan' | 'siswa'>('karyawan');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nis, setNis] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleKaryawanLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app');
    } catch (err: any) {
      setError('Email atau password salah.');
    } finally {
      setLoading(false);
    }
  };

  const handleSiswaLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'students'), where('nis', '==', nis));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('NIS tidak ditemukan');
      }

      const studentData = querySnapshot.docs[0].data();
      // Simple password check (user requested "Siswa username dan password")
      if (studentData.password !== password) {
        throw new Error('Password salah');
      }

      // Store in session
      const profile = {
        uid: `siswa-${nis}`,
        email: `${nis}@smkpu.sch.id`,
        name: studentData.name,
        role: 'siswa',
        major: studentData.major,
        nis: studentData.nis
      };
      localStorage.setItem('student_profile', JSON.stringify(profile));
      
      // We manually trigger auth state change by setting it in storage or just navigation
      // Our App.tsx checks for this
      window.location.href = '/app';
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 pb-4">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary/30">
              PU
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Portal Akademik</h2>
          <p className="text-gray-500 text-center mb-8">SMK Prima Unggul Tangerang Selatan</p>
          
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setType('karyawan')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'karyawan' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Guru / Staff
            </button>
            <button 
              onClick={() => setType('siswa')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${type === 'siswa' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
            >
              Siswa
            </button>
          </div>

          <AnimatePresence mode="wait">
            {type === 'karyawan' ? (
              <motion.form 
                key="emp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleKaryawanLogin} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="email@sekolah.id" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="••••••••" 
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Memproses...' : 'Login Karyawan'} <LogIn size={20} />
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="stu"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleSiswaLogin} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIS (Nomor Induk Siswa)</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="text" 
                      value={nis}
                      onChange={(e) => setNis(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Contoh: 12345" 
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="••••••••" 
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                <button 
                  disabled={loading}
                  type="submit" 
                  className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Memproses...' : 'Login Siswa'} <LogIn size={20} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
        <div className="p-4 bg-gray-50 border-t flex justify-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-gray-500 text-sm flex items-center gap-1 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Kembali ke Landing Page
          </button>
        </div>
      </motion.div>
    </div>
  );
}
