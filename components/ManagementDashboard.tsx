
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Student } from '../types';
import { ArrowLeftIcon, AcademicCapIcon, BuildingLibraryIcon, BookOpenIcon } from './icons';
import StudentManager from './StudentManager';
import SchoolManager from './SchoolManager';
import LessonManager from './LessonManager';

interface Props {
  user: User;
  students: Student[];
  onStudentsUpdate: () => void;
  onExit: () => void;
}

type ActiveTab = 'students' | 'school' | 'lessons';

const ManagementDashboard: React.FC<Props> = ({ user, students, onStudentsUpdate, onExit }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('students');

  const renderContent = () => {
    switch (activeTab) {
      case 'students':
        return <StudentManager user={user} students={students} onStudentsUpdate={onStudentsUpdate} />;
      case 'school':
        return <SchoolManager user={user} />;
      case 'lessons':
        return <LessonManager user={user} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: ActiveTab; label: string; icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-3 w-full p-3 rounded-lg text-left transition-colors ${
        activeTab === tabName ? 'bg-blue-500 text-white shadow' : 'hover:bg-blue-100'
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="font-display text-3xl text-gray-800">Management Dashboard</h1>
        <button
          onClick={onExit}
          className="flex items-center gap-2 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-50 border transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Classroom
        </button>
      </header>

      <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-6 overflow-y-auto">
        <nav className="md:col-span-1 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-md h-fit">
          <ul className="space-y-2">
            <li>
              <TabButton tabName="students" label="Students" icon={<AcademicCapIcon className="w-6 h-6" />} />
            </li>
            <li>
              <TabButton tabName="school" label="School" icon={<BuildingLibraryIcon className="w-6 h-6" />} />
            </li>
            <li>
              <TabButton tabName="lessons" label="Lessons" icon={<BookOpenIcon className="w-6 h-6" />} />
            </li>
          </ul>
        </nav>
        <main className="md:col-span-3">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ManagementDashboard;
