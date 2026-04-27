import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Timer, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  XCircle,
  FileText,
  BookOpen
} from 'lucide-react';
import { Question, TestResult, Exam } from '../types';

export default function UjianPortal() {
  const { user } = useAuth();
  const [step, setStep] = useState<'list' | 'intro' | 'exam' | 'result'>('list');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(3600); // Default 60 minutes
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'siswa') {
      fetchExams();
    }
  }, [user]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      // Filter by student's major
      const q = query(collection(db, 'exams'), where('major', '==', user?.major));
      const snap = await getDocs(q);
      setExams(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exam)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (examId: string) => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'exams', examId, 'questions'));
      const qData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      setQuestions(qData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (step === 'exam' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && step === 'exam') {
      finishExam();
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const selectExam = (exam: Exam) => {
    setSelectedExam(exam);
    fetchQuestions(exam.id);
    setStep('intro');
  };

  const startExam = () => {
    if (questions.length === 0) {
      alert('Maaf, ujian ini belum memiliki soal. Hubungi guru mata pelajaran.');
      return;
    }
    setStep('exam');
    setTimeLeft((selectedExam?.duration || 60) * 60);
    setAnswers({});
    setCurrentIdx(0);
  };

  const finishExam = async () => {
    setLoading(true);
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) correct++;
    });
    
    const finalScore = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setScore(finalScore);

    try {
      const result: TestResult = {
        studentNis: user?.nis || '',
        studentName: user?.name || '',
        examId: selectedExam?.id || '',
        examTitle: selectedExam?.title || '',
        score: finalScore,
        date: new Date().toLocaleDateString('id-ID'),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        major: user?.major || ''
      };
      await addDoc(collection(db, 'test_results'), result);
    } catch (err) {
      console.error('Failed to save result', err);
    }

    setStep('result');
    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (step === 'list') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Ujian Online Tersedia</h1>
          <p className="text-gray-500">Pilih ujian yang sesuai dengan jadwal Anda. Jurusan: {user?.major}</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">Memuat data ujian...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <motion.div 
                key={exam.id}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-[30px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-12 h-12 bg-red-50 text-primary rounded-2xl flex items-center justify-center mb-6 border border-red-100 group-hover:bg-primary group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{exam.title}</h3>
                <div className="flex flex-col gap-1 text-sm text-gray-500 mb-8">
                  <span className="flex items-center gap-2"><Timer size={14} /> {exam.duration} Menit</span>
                  <span className="flex items-center gap-2 font-bold text-primary"><AlertCircle size={14} /> KKM: {exam.passingScore}</span>
                </div>
                <button 
                  onClick={() => selectExam(exam)}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                >
                  Buka Ujian
                </button>
              </motion.div>
            ))}
            {exams.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400 font-medium">
                Belum ada ujian untuk jurusan {user?.major} saat ini.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-red-100 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-100/50">
            <FileText size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-4">{selectedExam?.title}</h1>
          <p className="text-gray-500 mb-10 leading-relaxed">
            Selamat datang di portal ujian SMK Prima Unggul. Pastikan koneksi internet stabil sebelum memulai.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Durasi</p>
              <p className="font-bold flex items-center gap-2 text-gray-800"><Timer size={16} /> {selectedExam?.duration} Menit</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase mb-1">Jumlah Soal</p>
              <p className="font-bold flex items-center gap-2 text-gray-800"><AlertCircle size={16} /> {questions.length} Butir</p>
            </div>
          </div>

          <button 
            onClick={startExam}
            className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary-dark shadow-xl shadow-primary/30 transform active:scale-[0.98] transition-all"
          >
            Mulai Mengerjakan
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === 'exam') {
    const q = questions[currentIdx];
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 text-primary rounded-xl">
              <Timer size={20} />
            </div>
            <div className="font-mono text-2xl font-black text-gray-800">{formatTime(timeLeft)}</div>
          </div>
          
          <div className="flex gap-2 max-w-[50%] flex-wrap justify-end">
            {questions.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIdx ? 'bg-primary w-6' : 
                  answers[idx] !== undefined ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-10 rounded-[30px] border border-gray-100 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <span className="px-4 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
              Soal {currentIdx + 1} of {questions.length}
            </span>
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              q.difficulty === 'easy' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
            }`}>
              {q.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">
            {q.text}
          </h2>

          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [currentIdx]: i })}
                className={`w-full p-6 text-left rounded-2xl border-2 transition-all flex items-center justify-between group ${
                  answers[currentIdx] === i 
                    ? 'border-primary bg-red-50/50' 
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className={`font-medium ${answers[currentIdx] === i ? 'text-primary' : 'text-gray-600'}`}>
                  {opt}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  answers[currentIdx] === i ? 'border-primary bg-primary' : 'border-gray-200'
                }`}>
                  {answers[currentIdx] === i && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex justify-between items-center px-4">
          <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(prev => prev - 1)}
            className="flex items-center gap-2 font-bold text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all"
          >
            <ChevronLeft /> Sebelumnya
          </button>
          
          {currentIdx === questions.length - 1 ? (
            <button 
              onClick={finishExam}
              disabled={loading}
              className="px-10 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl shadow-green-600/20 hover:bg-green-700 active:scale-95 transition-all"
            >
              Selesai & Kumpulkan
            </button>
          ) : (
            <button 
              onClick={() => setCurrentIdx(prev => prev + 1)}
              className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black active:scale-95 transition-all"
            >
              Selanjutnya <ChevronRight />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'result') {
    const isPassed = score >= (selectedExam?.passingScore || 50);
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-2xl text-center relative overflow-hidden"
        >
          {isPassed && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-400"></div>
          )}
          
          <div className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-8 bg-opacity-10 ${isPassed ? 'bg-green-500 text-green-500' : 'bg-primary text-primary'}`}>
            {isPassed ? <Trophy size={60} /> : <AlertCircle size={60} />}
          </div>

          <h1 className="text-4xl font-black mb-2">Hasil Ujian</h1>
          <p className="text-gray-500 mb-10 tracking-tight">Kalkulasi nilai akhir berdasarkan jawaban yang dikumpulkan.</p>

          <div className="flex justify-center items-center gap-8 mb-12">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Skor Anda</p>
              <div className={`text-7xl font-black ${isPassed ? 'text-green-500' : 'text-primary'}`}>
                {score}
              </div>
            </div>
            <div className="w-px h-20 bg-gray-100"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
              <div className={`text-2xl font-bold flex items-center gap-2 ${isPassed ? 'text-green-600' : 'text-primary'}`}>
                {isPassed ? (
                  <> <CheckCircle2 size={24} /> LULUS</>
                ) : (
                  <> <XCircle size={24} /> TIDAK LULUS</>
                )}
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-1">KKM: {selectedExam?.passingScore || 50}</p>
            </div>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              {isPassed 
                ? 'Selamat! Anda telah melampaui standar kelulusan KKM. Silakan melapor ke wali kelas untuk langkah selanjutnya.' 
                : 'Maaf, nilai Anda belum mencapai KKM. Silakan hubungi guru mata pelajaran untuk jadwal remedial.'}
            </p>
            <button 
              onClick={() => window.location.href = '/app'}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
