import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, setDoc, doc, deleteDoc, addDoc, query, where } from 'firebase/firestore';
import { Plus, Pencil, Trash2, BookOpen, Save, X, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exam, Question } from '../types';

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  
  const [currentExam, setCurrentExam] = useState<Partial<Exam>>({
    title: '', major: 'TKJ', duration: 60, passingScore: 50
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    text: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 'easy'
  });

  const majors = ['TKJ', 'DKV', 'AK', 'BC', 'MPLB', 'BD'];

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const snap = await getDocs(collection(db, 'exams'));
    setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam)));
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentExam.id) {
        await setDoc(doc(db, 'exams', currentExam.id), currentExam);
      } else {
        await addDoc(collection(db, 'exams'), currentExam);
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err) {
      alert('Gagal menyimpan ujian.');
    } finally {
      setLoading(false);
    }
  };

  const openQuestionManager = async (exam: Exam) => {
    setCurrentExam(exam);
    setIsQuestionModalOpen(true);
    // Fetch questions for this exam
    const qSnap = await getDocs(collection(db, 'exams', exam.id, 'questions'));
    setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question)));
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentExam.id) return;
    setLoading(true);
    try {
      if (currentQuestion.id) {
        await setDoc(doc(db, 'exams', currentExam.id, 'questions', currentQuestion.id), currentQuestion);
      } else {
        await addDoc(collection(db, 'exams', currentExam.id, 'questions'), currentQuestion);
      }
      // Refresh questions
      const qSnap = await getDocs(collection(db, 'exams', currentExam.id, 'questions'));
      setQuestions(qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question)));
      setCurrentQuestion({ text: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 'easy' });
    } catch (err) {
      alert('Gagal menyimpan soal.');
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (qId: string) => {
    if (!currentExam.id || !confirm('Hapus soal ini?')) return;
    await deleteDoc(doc(db, 'exams', currentExam.id, 'questions', qId));
    setQuestions(questions.filter(q => q.id !== qId));
  };

  const deleteExam = async (id: string) => {
    if (confirm('Hapus ujian ini beserta semua soalnya?')) {
      await deleteDoc(doc(db, 'exams', id));
      fetchExams();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <BookOpen size={28} className="text-primary" /> Manajemen Ujian
          </h1>
          <p className="text-sm text-gray-500">Buat soal dan atur jadwal ujian per jurusan.</p>
        </div>
        <button 
          onClick={() => {
            setCurrentExam({ title: '', major: 'TKJ', duration: 60, passingScore: 50 });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-xl transition-all"
        >
          <Plus size={20} /> Buat Ujian Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <motion.div 
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-red-50 text-primary text-[10px] font-black rounded-lg border border-red-100">
                {exam.major}
              </span>
              <div className="flex gap-1">
                <button onClick={() => { setCurrentExam(exam); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Pencil size={16} /></button>
                <button onClick={() => deleteExam(exam.id)} className="p-2 text-gray-400 hover:text-primary"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-2">{exam.title}</h3>
            <div className="text-xs text-gray-500 space-y-1 mb-6">
              <p>Durasi: {exam.duration} Menit</p>
              <p>KKM: {exam.passingScore}</p>
            </div>
            <button 
              onClick={() => openQuestionManager(exam)}
              className="w-full py-3 bg-gray-50 text-gray-900 border border-gray-100 rounded-xl font-bold text-sm hover:bg-gray-100 flex items-center justify-center gap-2"
            >
              <ListPlus size={18} /> Kelola {questions.length > 0 && currentExam.id === exam.id ? questions.length : ''} Soal
            </button>
          </motion.div>
        ))}
      </div>

      {/* Modal Exam */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-lg bg-white rounded-[40px] p-10 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Konfigurasi Ujian</h2>
              <form onSubmit={handleSaveExam} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase">Judul Ujian</label>
                  <input required value={currentExam.title} onChange={e => setCurrentExam({...currentExam, title: e.target.value})} className="w-full mt-2 p-3 bg-gray-50 border rounded-xl outline-none" placeholder="Contoh: UAS Kimia" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Jurusan</label>
                    <select value={currentExam.major} onChange={e => setCurrentExam({...currentExam, major: e.target.value})} className="w-full mt-2 p-3 bg-gray-50 border rounded-xl outline-none">
                      {majors.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase">Durasi (Menit)</label>
                    <input type="number" required value={currentExam.duration} onChange={e => setCurrentExam({...currentExam, duration: parseInt(e.target.value)})} className="w-full mt-2 p-3 bg-gray-50 border rounded-xl outline-none" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/30">Simpan Ujian</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Questions Management */}
      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsQuestionModalOpen(false)} />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[40px] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-8 border-b flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-2xl font-bold">Bank Soal: {currentExam.title}</h2>
                  <p className="text-sm text-gray-500">Edit pertanyaan dan opsi jawaban.</p>
                </div>
                <button onClick={() => setIsQuestionModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* List Questions */}
                <div className="w-1/2 overflow-y-auto p-8 border-r bg-gray-50">
                  <h3 className="font-bold text-gray-400 uppercase text-xs mb-4">Daftar Soal ({questions.length})</h3>
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <div key={q.id} className="p-4 bg-white rounded-2xl border flex justify-between items-center group">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-primary mb-1">Soal #{i+1}</p>
                          <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setCurrentQuestion(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={14} /></button>
                          <button onClick={() => deleteQuestion(q.id)} className="p-2 text-primary hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {questions.length === 0 && <p className="text-center py-12 text-gray-400 italic">Belum ada soal.</p>}
                  </div>
                </div>

                {/* Form Add/Edit */}
                <div className="flex-1 overflow-y-auto p-8 bg-white">
                  <h3 className="font-bold text-gray-400 uppercase text-xs mb-4">{currentQuestion.id ? 'Edit Soal' : 'Tambah Soal Baru'}</h3>
                  <form onSubmit={handleAddQuestion} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Pertanyaan</label>
                      <textarea required value={currentQuestion.text} onChange={e => setCurrentQuestion({...currentQuestion, text: e.target.value})} className="w-full mt-1 p-4 bg-gray-50 border rounded-xl min-h-[100px] outline-none" placeholder="Tulis soal di sini..." />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-gray-400 uppercase">Opsi Jawaban</label>
                       {currentQuestion.options?.map((opt, i) => (
                         <div key={i} className="flex gap-2 items-center">
                            <button type="button" onClick={() => setCurrentQuestion({...currentQuestion, correctIndex: i})} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${currentQuestion.correctIndex === i ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-gray-200'}`}>
                              {String.fromCharCode(65 + i)}
                            </button>
                            <input required value={opt} onChange={e => {
                              const newOpts = [...currentQuestion.options!];
                              newOpts[i] = e.target.value;
                              setCurrentQuestion({...currentQuestion, options: newOpts});
                            }} className="flex-1 p-3 bg-gray-50 border rounded-xl text-sm outline-none" placeholder={`Opsi ${String.fromCharCode(65 + i)}`} />
                         </div>
                       ))}
                    </div>
                    <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setCurrentQuestion({ text: '', options: ['', '', '', ''], correctIndex: 0, difficulty: 'easy' })} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm">Reset</button>
                      <button type="submit" className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20">Simpan Soal</button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
