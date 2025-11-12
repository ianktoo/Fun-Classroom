
import React, { useState, useEffect, useCallback } from 'react';
import { Student } from '../types';
import Confetti from './Confetti';

interface Props {
  students: Student[];
  onClose: () => void;
  onStudentSelected: (student: Student) => void;
}

const StudentSelectorModal: React.FC<Props> = ({ students, onClose, onStudentSelected }) => {
  const [isSpinning, setIsSpinning] = useState(true);
  const [winner, setWinner] = useState<Student | null>(null);
  const [displayedStudent, setDisplayedStudent] = useState<Student>(students[0]);

  const selectWinner = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * students.length);
    const selectedWinner = students[randomIndex];
    setWinner(selectedWinner);
    onStudentSelected(selectedWinner);
  }, [students, onStudentSelected]);

  useEffect(() => {
    if (isSpinning) {
      const spinInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * students.length);
        setDisplayedStudent(students[randomIndex]);
      }, 100);

      const spinTimeout = setTimeout(() => {
        clearInterval(spinInterval);
        setIsSpinning(false);
        selectWinner();
      }, 4000);

      return () => {
        clearInterval(spinInterval);
        clearTimeout(spinTimeout);
      };
    }
  }, [isSpinning, students, selectWinner]);
  
  const finalStudent = winner || displayedStudent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {winner && <Confetti />}
      <div className="bg-gradient-to-br from-blue-300 to-purple-400 rounded-2xl shadow-2xl p-8 text-white w-full max-w-lg text-center transform scale-100 transition-transform duration-300">
        <h2 className="font-display text-4xl mb-6">{isSpinning ? "Picking a star..." : "Congratulations!"}</h2>
        
        <div className="relative h-48 w-48 mx-auto flex items-center justify-center mb-6">
           <div className={`absolute inset-0 bg-white/20 rounded-full ${isSpinning ? 'animate-ping' : ''}`}></div>
            <img 
              key={finalStudent.id}
              src={finalStudent.avatar_url || `https://i.pravatar.cc/150?u=${finalStudent.id}`} 
              alt={finalStudent.name} 
              className="w-40 h-40 rounded-full border-8 border-white shadow-xl transition-all duration-100"
            />
        </div>
        
        <p className="font-display text-5xl h-16 transition-all duration-300">
          {finalStudent.name}
        </p>

        <div className="mt-8 h-16">
          {!isSpinning && winner && (
            <button
              onClick={onClose}
              className="bg-white text-blue-500 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all animate-pulse"
            >
              Awesome!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSelectorModal;