
import React, { useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getStudents } from '../services/supabase';
import { generateQuestion, generateSpeech } from '../services/geminiService';
import { Student, Question, HistoryItem } from '../types';
import StudentSelectorModal from './StudentSelectorModal';
import Timer from './Timer';
import ConversationMode from './ConversationMode';
import ManagementDashboard from './ManagementDashboard';
import { LogoutIcon, SparklesIcon, TimerIcon, QuestionIcon, MicIcon, PlayIcon, Cog8ToothIcon } from './icons';
import { decode, decodeAudioData } from '../services/audioUtils';

// Define HistoryPanel component inside Dashboard.tsx but outside Dashboard function
const HistoryPanel: React.FC<{ history: HistoryItem[] }> = ({ history }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
    <h3 className="font-display text-2xl text-purple-700 mb-4">Pick History</h3>
    <ul className="space-y-2 max-h-48 overflow-y-auto">
      {history.length === 0 ? (
        <p className="text-gray-500">No students picked yet!</p>
      ) : (
        history.map((item, index) => (
          <li key={index} className="flex justify-between items-center text-gray-700 text-sm p-2 bg-purple-50 rounded-lg">
            <span>{item.studentName}</span>
            <span className="text-xs text-gray-400">{item.timestamp.toLocaleTimeString()}</span>
          </li>
        ))
      )}
    </ul>
  </div>
);


const Dashboard: React.FC<{ session: Session }> = ({ session }) => {
  const { user } = session;
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isConversationMode, setIsConversationMode] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isManagementMode, setIsManagementMode] = useState(false);

  useEffect(() => {
    setAudioContext(new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }));
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const data = await getStudents(user.id);
      setStudents(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  }, [user.id]);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setHistory(prev => [{ studentName: student.name, timestamp: new Date() }, ...prev].slice(0, 5));
  };
  
  const handleGenerateQuestion = async () => {
    setLoadingQuestion(true);
    setQuestion(null);
    const q = await generateQuestion();
    setQuestion(q);
    setLoadingQuestion(false);
  };
  
  const playQuestionAudio = async () => {
    if (!question || !question.text || !audioContext) return;
    const base64Audio = await generateSpeech(question.text);
    if (base64Audio) {
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  };

  if (isManagementMode) {
    return <ManagementDashboard 
      user={user} 
      students={students}
      onStudentsUpdate={fetchStudents}
      onExit={() => setIsManagementMode(false)} 
    />;
  }

  if (isConversationMode) {
    return <ConversationMode user={user} onExit={() => setIsConversationMode(false)} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-display text-4xl text-gray-800">Classroom FunTime</h1>
          <p className="text-gray-600">Welcome, {user.email}!</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsManagementMode(true)}
            className="flex items-center gap-2 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
          >
            <Cog8ToothIcon className="w-5 h-5" />
            Manage
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition-colors"
          >
            <LogoutIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <h2 className="font-display text-3xl text-blue-700 mb-4">Meet the Class!</h2>
            {loadingStudents ? (
              <p>Loading students...</p>
            ) : students.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {students.map(student => (
                  <div key={student.id} className="text-center group">
                    <img src={student.avatar_url || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="w-16 h-16 rounded-full mx-auto border-4 border-white shadow-lg group-hover:border-blue-400 transition-all transform group-hover:scale-110" />
                    <p className="text-xs mt-2 font-medium text-gray-700 truncate">{student.name}</p>
                  </div>
                ))}
              </div>
            ) : (
                <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No students have been added yet.</p>
                    <button onClick={() => setIsManagementMode(true)} className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors">
                        Add Students
                    </button>
                </div>
            )}
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md">
            <h3 className="font-display text-2xl text-green-700 mb-4">Today's Question</h3>
            {loadingQuestion ? (
              <div className="flex items-center justify-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : question ? (
              <div>
                <p className="text-lg mb-4">{question.text}</p>
                {question.sources && question.sources.length > 0 && (
                   <div className="text-xs text-gray-500 mt-2">
                     <strong>Sources:</strong>
                     {/* FIX: Add check for s.web.uri as it is now optional, and provide a fallback for the link text. */}
                     {question.sources.map((s, i) => s.web?.uri && <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="ml-2 underline">{s.web.title || s.web.uri}</a>)}
                   </div>
                )}
                <button onClick={playQuestionAudio} className="mt-2 flex items-center gap-2 bg-green-100 text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-200 transition-colors">
                  <PlayIcon className="w-5 h-5" />
                  Read Aloud
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Generate a question to get started!</p>
            )}
          </div>
        </div>
        
        <div className="space-y-8">
           <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-md text-center">
             <h3 className="font-display text-2xl text-yellow-700 mb-4">Let's Go!</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
               <button onClick={() => setIsSelectorOpen(true)} disabled={students.length === 0} className="flex w-full justify-center items-center gap-2 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all disabled:bg-gray-400">
                 <SparklesIcon className="w-6 h-6" /> Pick a Student
               </button>
               <button onClick={handleGenerateQuestion} disabled={loadingQuestion} className="flex w-full justify-center items-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all disabled:bg-gray-400">
                 <QuestionIcon className="w-6 h-6" /> New Question
               </button>
               <button onClick={() => setIsTimerRunning(true)} disabled={isTimerRunning} className="flex w-full justify-center items-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all disabled:bg-gray-400">
                 <TimerIcon className="w-6 h-6" /> Start Timer
               </button>
                <button onClick={() => setIsConversationMode(true)} className="flex w-full justify-center items-center gap-2 bg-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all">
                 <MicIcon className="w-6 h-6" /> Talk with AI
               </button>
             </div>
           </div>
           
           <HistoryPanel history={history} />
           
           {isTimerRunning && <Timer duration={60} onComplete={() => setIsTimerRunning(false)} />}
        </div>
      </main>

      {isSelectorOpen && (
        <StudentSelectorModal
          students={students}
          onClose={() => setIsSelectorOpen(false)}
          onStudentSelected={handleSelectStudent}
        />
      )}
    </div>
  );
};

export default Dashboard;
