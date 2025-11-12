
import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Student } from '../types';
import { addStudent, updateStudent, deleteStudent } from '../services/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';

interface Props {
  user: User;
  students: Student[];
  onStudentsUpdate: () => void;
}

const StudentManager: React.FC<Props> = ({ user, students, onStudentsUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const openAddModal = () => {
        setEditingStudent(null);
        setName('');
        setAvatarUrl('');
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (student: Student) => {
        setEditingStudent(student);
        setName(student.name);
        setAvatarUrl(student.avatar_url);
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingStudent(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (editingStudent) {
                await updateStudent(editingStudent.id, { name, avatar_url: avatarUrl });
            } else {
                await addStudent({ name, avatar_url: avatarUrl, user_id: user.id });
            }
            onStudentsUpdate();
            closeModal();
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            try {
                await deleteStudent(studentId);
                onStudentsUpdate();
            } catch (err: any) {
                alert('Failed to delete student: ' + err.message);
            }
        }
    };

    const Modal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Student Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-100 rounded-lg border focus:outline-none focus:border-blue-400"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Avatar URL (optional)"
                            value={avatarUrl}
                            onChange={e => setAvatarUrl(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-100 rounded-lg border focus:outline-none focus:border-blue-400"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-300">
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-display text-gray-700">Manage Students</h3>
                <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors">
                    <PlusIcon className="w-5 h-5" /> Add Student
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3">Avatar</th>
                            <th className="p-3">Name</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    <img src={student.avatar_url || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                                </td>
                                <td className="p-3 font-medium">{student.name}</td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEditModal(student)} className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-100" aria-label={`Edit ${student.name}`}>
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-100" aria-label={`Delete ${student.name}`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {students.length === 0 && <p className="text-center text-gray-500 py-8">No students added yet. Click 'Add Student' to begin!</p>}
            </div>
            {isModalOpen && <Modal />}
        </div>
    );
};

export default StudentManager;
