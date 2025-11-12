import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { School } from '../types';
import { getSchool, addSchool, updateSchool } from '../services/supabase';

interface Props {
  user: User;
}

const SchoolManager: React.FC<Props> = ({ user }) => {
    const [school, setSchool] = useState<School | null>(null);
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSchool();
    }, []);

    const fetchSchool = async () => {
        const schoolData = await getSchool(user.id);
        setSchool(schoolData);
        if (schoolData) {
            setName(schoolData.name);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            if (school) {
                await updateSchool(school.id, { name });
            } else {
                await addSchool({ name, user_id: user.id });
            }
            await fetchSchool(); // Refresh data from server
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md h-full">
            <h3 className="text-2xl font-display text-gray-700 mb-4">Manage School</h3>
            
            {school && !isEditing ? (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-lg">{school.name}</p>
                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
                        Edit
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSave}>
                    <p className="mb-2 text-gray-600">{school ? 'Edit your school name:' : 'Enter your school name to get started:'}</p>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="e.g., Galaxy Elementary"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-grow px-4 py-2 bg-white rounded-lg border focus:outline-none focus:border-blue-400"
                            required
                        />
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-300">
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                         {isEditing && (
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-semibold hover:bg-gray-300">
                                Cancel
                            </button>
                        )}
                    </div>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </form>
            )}
        </div>
    );
};

export default SchoolManager;
