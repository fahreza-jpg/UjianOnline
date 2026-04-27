import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { Trophy, Search, Clock, GraduationCap, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { TestResult } from '../types';

export default function TestResultsGuru() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('ALL');

  const majors = ['ALL', 'TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'];

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'test_results'), orderBy('date', 'desc'));
      const snap = await getDocs(q);
      setResults(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TestResult)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || r.studentNis.includes(searchTerm);
    const matchesMajor = selectedMajor === 'ALL' || r.major === selectedMajor;
    return matchesSearch && matchesMajor;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Trophy size={28} className="text-yellow-500" /> Hasil Ujian Online
          </h1>
          <p className="text-sm text-gray-500">Monitor nilai dan kejujuran siswa dalam pengerjaan ujian.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:flex gap-4 items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Cari nama atau NIS siswa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select 
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-sm"
            >
              {majors.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
        </div>
        <div className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 flex items-center gap-2">
            <GraduationCap size={16} /> {filteredResults.length} Peserta
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b">
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Informasi Siswa</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Ujian</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Waktu Pengerjaan</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Nilai Akhir</th>
                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result, i) => (
                <motion.tr 
                  key={result.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                        {result.studentName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{result.studentName}</p>
                        <p className="text-xs text-gray-500">NIS: {result.studentNis} • {result.major}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <p className="text-sm font-bold text-gray-700">{result.examTitle}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-medium text-gray-600">{result.date}</span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><Clock size={10} /> {result.time}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-2xl font-black ${result.score >= 50 ? 'text-green-500' : 'text-primary'}`}>
                      {result.score}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                      result.score >= 50 
                        ? 'bg-green-50 text-green-600 border-green-100' 
                        : 'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {result.score >= 50 ? 'LULUS' : 'REMEDIAL'}
                    </span>
                  </td>
                </motion.tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 italic">
                    Belum ada data nilai pengerjaan ujian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
