import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { UserPlus, Pencil, Trash2, X, ShieldAlert, UserCog } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<UserProfile>>({
    name: '', email: '', role: 'guru'
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    setUsers(snap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentUser.uid) {
        // Edit
        await setDoc(doc(db, 'users', currentUser.uid), {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role
        }, { merge: true });
      } else {
        // Create new via a separate mechanism or just Firestore for now
        // NOTE: In a real app, creating full firebase auth users for others requires Admin SDK.
        // For this demo, we'll store them in Firestore. 
        // Note: Actual login still needs Firebase Auth record.
        alert('Fitur tambah user baru memerlukan setup Cloud Functions. Data disimpan di database tapi login tetap menggunakan akun yang sudah terdaftar di Firebase Auth.');
        const fakeUid = 'user-' + Date.now();
        await setDoc(doc(db, 'users', fakeUid), {
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        });
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert('Gagal menyimpan data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (confirm('Hapus user ini?')) {
      await deleteDoc(doc(db, 'users', uid));
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog size={28} className="text-primary" /> User Management
          </h1>
          <p className="text-sm text-gray-500">Kelola hak akses dan profil Guru serta Tenaga Kependidikan.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentUser({ name: '', email: '', role: 'guru' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
        >
          <UserPlus size={20} /> Tambah User
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Nama</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.uid} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{u.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                      u.role === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                      u.role === 'guru' ? 'bg-green-50 text-green-600 border-green-100' : 
                      'bg-gray-50 text-gray-600 border-gray-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setCurrentUser(u);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(u.uid)}
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

      <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex gap-4">
        <ShieldAlert size={24} className="text-primary flex-shrink-0" />
        <div className="text-xs text-red-800 leading-relaxed">
          <p className="font-bold mb-1">Catatan Keamanan:</p>
          <p>Login Guru & Admin menggunakan akun email yang terdaftar di sistem Firebase Authentication. Perubahan nama dan role di sini akan mensinkronisasi data di database untuk keperluan otorisasi di dalam aplikasi.</p>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl p-10 overflow-hidden"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900"><X size={24} /></button>

              <h2 className="text-2xl font-bold mb-8">Kelola Profil User</h2>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase px-1">Nama Lengkap</label>
                  <input required value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase px-1">Alamat Email</label>
                  <input required type="email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase px-1">Role Akun</label>
                  <select value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value as any})} className="w-full mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="guru">Guru</option>
                    <option value="staff">Staff / Tenaga Kependidikan</option>
                    <option value="admin">Admin System</option>
                  </select>
                </div>

                <div className="pt-6">
                  <button disabled={loading} className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan User'}
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
