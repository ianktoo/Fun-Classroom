
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
// FIX: Removed non-exported type 'LiveSession'.
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decode, decodeAudioData, createPcmBlob } from '../services/audioUtils';

interface Props {
  user: User | null;
  onExit: () => void;
}

type Transcription = {
    author: 'user' | 'model';
    text: string;
};

const ConversationMode: React.FC<Props> = ({ user, onExit }) => {
    const [isConnecting, setIsConnecting] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);

    // FIX: Replaced Promise<LiveSession> with a derived type to fix import error.
    const sessionPromiseRef = useRef<ReturnType<InstanceType<typeof GoogleGenAI>['live']['connect']> | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const currentInputTranscriptionRef = useRef('');
    const currentOutputTranscriptionRef = useRef('');

    const startConversation = useCallback(async () => {
        setIsConnecting(true);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        console.log('Session opened');
                        setIsConnecting(false);
                        setIsActive(true);
                        
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (event) => {
                            const inputData = event.inputBuffer.getChannelData(0);
                            const pcmBlob = createPcmBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        source.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                       try {
                         if (message.serverContent?.outputTranscription) {
                              currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                          }
                         if (message.serverContent?.inputTranscription) {
                              currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                          }
                         if (message.serverContent?.turnComplete) {
                              const fullInput = currentInputTranscriptionRef.current.trim();
                              const fullOutput = currentOutputTranscriptionRef.current.trim();
                              
                              const itemsToAdd: Transcription[] = [];
                              if (fullInput) itemsToAdd.push({ author: 'user', text: fullInput });
                              if (fullOutput) itemsToAdd.push({ author: 'model', text: fullOutput });
                              
                              if (itemsToAdd.length > 0) {
                                setTranscriptions(prev => [...prev, ...itemsToAdd]);
                              }

                              currentInputTranscriptionRef.current = '';
                              currentOutputTranscriptionRef.current = '';
                          }

                          const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                          if (base64Audio && outputAudioContextRef.current) {
                              const outputCtx = outputAudioContextRef.current;
                              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                              const source = outputCtx.createBufferSource();
                              source.buffer = audioBuffer;
                              source.connect(outputCtx.destination);
                              
                              source.addEventListener('ended', () => {
                                  sourcesRef.current.delete(source);
                              });

                              source.start(nextStartTimeRef.current);
                              nextStartTimeRef.current += audioBuffer.duration;
                              sourcesRef.current.add(source);
                          }

                          if (message.serverContent?.interrupted) {
                              for (const source of sourcesRef.current.values()) {
                                  source.stop();
                              }
                              sourcesRef.current.clear();
                              nextStartTimeRef.current = 0;
                          }
                        } catch (err) {
                           console.error("Error processing message:", err);
                           setError("An error occurred while processing the server response.");
                        }
                    },
                    onclose: () => {
                        console.log('Session closed');
                        setIsActive(false);
                    },
                    onerror: (e) => {
                        console.error('Session error', e);
                        setError('An error occurred during the session.');
                        setIsActive(false);
                        setIsConnecting(false);
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                    },
                    systemInstruction: 'You are a fun and encouraging classroom assistant. Keep your answers concise and cheerful, suitable for 6th graders.',
                },
            });

        } catch (err) {
            console.error(err);
            setError('Failed to get microphone permissions. Please allow access and try again.');
            setIsConnecting(false);
        }
    }, []);

    const stopConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        
        sessionPromiseRef.current = null;
        setIsActive(false);
        setIsConnecting(false);
    }, []);

    useEffect(() => {
        return () => {
            stopConversation();
        };
    }, [stopConversation]);

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500 flex flex-col p-4 sm:p-6 lg:p-8 text-white z-50">
            <header className="flex justify-between items-center mb-4">
                <h1 className="font-display text-3xl">AI Conversation</h1>
                <button onClick={onExit} className="bg-white/20 hover:bg-white/30 font-semibold py-2 px-4 rounded-lg">Exit</button>
            </header>

            <div className="flex-grow bg-black/20 rounded-2xl p-4 overflow-y-auto space-y-4">
                {transcriptions.map((t, i) => (
                    <div key={i} className={`flex ${t.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${t.author === 'user' ? 'bg-blue-500 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                            {t.text}
                        </p>
                    </div>
                ))}
                 {isConnecting && (
                    <div className="flex justify-center">
                        <p className="bg-gray-700/50 px-4 py-2 rounded-xl">Connecting to AI...</p>
                    </div>
                 )}
            </div>
            
            <footer className="mt-6 text-center">
                <div className="flex items-center justify-center h-24">
                  {isActive && (
                      <div className="relative flex items-center justify-center">
                          <div className="absolute h-24 w-24 bg-white/30 rounded-full animate-ping"></div>
                          <div className="h-20 w-20 bg-white/50 rounded-full flex items-center justify-center">
                              <div className="h-10 w-10 bg-red-500 rounded-full animate-pulse"></div>
                          </div>
                      </div>
                  )}
                </div>

                {!isActive && !isConnecting && (
                    <button onClick={startConversation} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-transform">
                        Start Talking
                    </button>
                )}
                {isConnecting && <p className="animate-pulse">Connecting...</p>}
                {isActive && (
                    <button onClick={stopConversation} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform hover:scale-105 transition-transform">
                        End Conversation
                    </button>
                )}
                {error && <p className="mt-4 text-yellow-300 bg-black/20 p-2 rounded-md">{error}</p>}
            </footer>
        </div>
    );
};

export default ConversationMode;
