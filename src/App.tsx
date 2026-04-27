import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth, db } from './lib/firebase';
import { UserProfile, UserRole } from './types';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AttendanceEmployee from './pages/AttendanceEmployee';
import AttendanceStudent from './pages/AttendanceStudent';
import RekapAbsensi from './pages/RekapAbsensi';
import DataSiswa from './pages/DataSiswa';
import UserManagement from './pages/UserManagement';
import UjianPortal from './pages/UjianPortal';
import ExamManagement from './pages/ExamManagement';
import TestResultsGuru from './pages/TestResultsGuru';
import AppLayout from './components/AppLayout';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Try to get role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: userDoc.data().name,
            role: userDoc.data().role,
          });
        } else {
          // AUTO-CREATE FIRST ADMIN IF NONE EXISTS
          // Note: This is just for initial setup convenience
          const usersSnap = await getDocs(collection(db, 'users'));
          if (usersSnap.empty) {
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: 'Administrator',
              role: 'admin' as UserRole,
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          } else {
            const storedProfile = localStorage.getItem('student_profile');
            if (storedProfile) {
              setUser(JSON.parse(storedProfile));
            } else {
              setUser(null);
            }
          }
        }
      } else {
        // Check student session
        const storedProfile = localStorage.getItem('student_profile');
        if (storedProfile) {
          setUser(JSON.parse(storedProfile));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    localStorage.removeItem('student_profile');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/app" /> : <LoginPage />} />
          
          <Route path="/app" element={user ? <AppLayout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            
            {/* Common for all employees */}
            <Route path="absensi-karyawan" element={<AttendanceEmployee />} />
            
            {/* Restricted to Admin & Guru */}
            {(user?.role === 'admin' || user?.role === 'guru') && (
              <>
                <Route path="absensi-siswa" element={<AttendanceStudent />} />
                <Route path="rekap" element={<RekapAbsensi />} />
                <Route path="kelola-ujian" element={<ExamManagement />} />
                <Route path="hasil-ujian" element={<TestResultsGuru />} />
              </>
            )}

            {/* Admin only */}
            {user?.role === 'admin' && (
              <>
                <Route path="siswa" element={<DataSiswa />} />
                <Route path="users" element={<UserManagement />} />
              </>
            )}

            {/* Student only */}
            {user?.role === 'siswa' && (
              <Route path="ujian" element={<UjianPortal />} />
            )}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
