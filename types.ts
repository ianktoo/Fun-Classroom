
export interface Student {
  id: string;
  name: string;
  avatar_url: string;
  created_at: string;
  user_id: string;
}

export interface GroundingChunk {
  web?: {
    // FIX: Made uri and title optional to match the GroundingChunk type from the @google/genai library.
    uri?: string;
    title?: string;
  };
}

export interface Question {
  text: string;
  sources: GroundingChunk[];
}

export interface HistoryItem {
  studentName: string;
  timestamp: Date;
}

export interface School {
  id: string;
  name: string;
  user_id: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  user_id: string;
}
