import { createClient } from '@supabase/supabase-js';
import { Student, School, Lesson } from '../types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from '../config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Student Functions ---

export async function getStudents(userId: string): Promise<Student[]> {
    if (!isSupabaseConfigured) {
        console.warn("Supabase is not configured. Returning an empty list of students. Please update your .env file.");
        return [];
    }
    const { data, error } = await supabase.from('students').select('*').eq('user_id', userId).order('created_at');
    if (error) {
        console.error('Error fetching students:', error.message);
        return [];
    }
    return data || [];
}

export async function addStudent(student: { name: string; avatar_url: string; user_id: string; }) {
    const { data, error } = await supabase.from('students').insert(student).select();
    if (error) throw error;
    return data[0];
}

export async function updateStudent(id: string, updates: { name?: string; avatar_url?: string; }) {
    const { data, error } = await supabase.from('students').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
}

export async function deleteStudent(id: string) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
}

// --- School Functions ---

export async function getSchool(userId: string): Promise<School | null> {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('schools').select('*').eq('user_id', userId).maybeSingle();
    if (error) {
        console.error('Error fetching school:', error.message);
        return null;
    }
    return data;
}

export async function addSchool(school: { name: string; user_id: string; }) {
    const { data, error } = await supabase.from('schools').insert(school).select();
    if (error) throw error;
    return data[0];
}

export async function updateSchool(id: string, updates: { name: string; }) {
    const { data, error } = await supabase.from('schools').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
}


// --- Lesson Functions ---

export async function getLessons(userId: string): Promise<Lesson[]> {
    if (!isSupabaseConfigured) return [];
    const { data, error } = await supabase.from('lessons').select('*').eq('user_id', userId).order('created_at');
    if (error) {
        console.error('Error fetching lessons:', error.message);
        return [];
    }
    return data || [];
}

export async function addLesson(lesson: { title: string; description?: string; user_id: string; }) {
    const { data, error } = await supabase.from('lessons').insert(lesson).select();
    if (error) throw error;
    return data[0];
}

export async function updateLesson(id: string, updates: { title?: string; description?: string; }) {
    const { data, error } = await supabase.from('lessons').update(updates).eq('id', id).select();
    if (error) throw error;
    return data[0];
}

export async function deleteLesson(id: string) {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (error) throw error;
}
