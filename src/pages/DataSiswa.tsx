import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { UserPlus, Pencil, Trash2, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';

export default function DataSiswa() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Partial<Student>>({
    nis: '', name: '', class: 'X', major: 'TKJ', password: 'password123'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const snap = await getDocs(collection(db, 'students'));
    setStudents(snap.docs.map(doc => doc.data() as Student));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setDoc(doc(db, 'students', currentStudent.nis!), currentStudent);
      setIsModalOpen(false);
      fetchStudents();
    } catch (err) {
      alert('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (nis: string) => {
    if (confirm('Hapus data siswa ini?')) {
      await deleteDoc(doc(db, 'students', nis));
      fetchStudents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Data Siswa</h1>
          <p className="text-sm text-gray-500">Manajemen basis data siswa SMK Prima Unggul.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentStudent({ nis: '', name: '', class: 'X', major: 'TKJ', password: 'password123' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-xl transition-all"
        >
          <UserPlus size={20} /> Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">NIS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Kelas</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Jurusan</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.nis} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-500">{s.nis}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{s.name}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{s.class}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-red-50 text-primary text-[10px] font-black rounded-lg border border-red-100">
                      {s.major}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setCurrentStudent(s);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(s.nis)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"
              >
                <X size={24} />
              </button>

              <h2 className="text-2xl font-bold mb-8">Informasi Siswa</h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase px-1">NIS (Nomor Induk Siswa)</label>
                  <input 
                    required
                    value={currentStudent.nis}
                    onChange={e => setCurrentStudent({...currentStudent, nis: e.target.value})}
                    className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase px-1">Nama Lengkap</label>
                  <input 
                    required
                    value={currentStudent.name}
                    onChange={e => setCurrentStudent({...currentStudent, name: e.target.value})}
                    className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase px-1">Kelas</label>
                    <select 
                      value={currentStudent.class}
                      onChange={e => setCurrentStudent({...currentStudent, class: e.target.value})}
                      className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="X">X</option>
                      <option value="XI">XI</option>
                      <option value="XII">XII</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase px-1">Jurusan</label>
                    <select 
                      value={currentStudent.major}
                      onChange={e => setCurrentStudent({...currentStudent, major: e.target.value})}
                      className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      {['TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase px-1">Password Login</label>
                  <input 
                    type="password"
                    required
                    value={currentStudent.password}
                    onChange={e => setCurrentStudent({...currentStudent, password: e.target.value})}
                    className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="pt-6">
                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {loading ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
