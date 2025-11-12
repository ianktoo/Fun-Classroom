import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Lesson } from '../types';
import { getLessons, addLesson, updateLesson, deleteLesson } from '../services/supabase';
import { PlusIcon, PencilIcon, TrashIcon } from './icons';

interface Props {
  user: User;
}

const LessonManager: React.FC<Props> = ({ user }) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLessons();
    }, []);

    const fetchLessons = async () => {
        const data = await getLessons(user.id);
        setLessons(data);
    };

    const openAddModal = () => {
        setEditingLesson(null);
        setTitle('');
        setDescription('');
        setError('');
        setIsModalOpen(true);
    };

    const openEditModal = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setTitle(lesson.title);
        setDescription(lesson.description);
        setError('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingLesson(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (editingLesson) {
                await updateLesson(editingLesson.id, { title, description });
            } else {
                await addLesson({ title, description, user_id: user.id });
            }
            fetchLessons();
            closeModal();
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (lessonId: string) => {
        if (window.confirm('Are you sure you want to delete this lesson?')) {
            try {
                await deleteLesson(lessonId);
                fetchLessons();
            } catch (err: any) {
                alert('Failed to delete lesson: ' + err.message);
            }
        }
    };

    const Modal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Lesson Title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-100 rounded-lg border focus:outline-none focus:border-blue-400"
                            required
                        />
                        <textarea
                            placeholder="Lesson Description (optional)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-100 rounded-lg border focus:outline-none focus:border-blue-400 h-24 resize-none"
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
                <h3 className="text-2xl font-display text-gray-700">Manage Lessons</h3>
                <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition-colors">
                    <PlusIcon className="w-5 h-5" /> Add Lesson
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3">Title</th>
                            <th className="p-3">Description</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lessons.map(lesson => (
                            <tr key={lesson.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{lesson.title}</td>
                                <td className="p-3 text-gray-600 truncate max-w-xs">{lesson.description}</td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => openEditModal(lesson)} className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-100" aria-label={`Edit ${lesson.title}`}>
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(lesson.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-100" aria-label={`Delete ${lesson.title}`}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {lessons.length === 0 && <p className="text-center text-gray-500 py-8">No lessons added yet. Click 'Add Lesson' to create one!</p>}
            </div>
            {isModalOpen && <Modal />}
        </div>
    );
};

export default LessonManager;
