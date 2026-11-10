
import { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface UseGeminiLiveOptions {
  model?: string;
  systemInstruction?: string;
  voiceName?: string;
  onTranscriptionUpdate?: (text: string, role: 'user' | 'bot', isFinal: boolean) => void;
}

export const useGeminiLive = ({
  model = 'gemini-2.5-flash-native-audio-preview-12-2025',
  systemInstruction = 'You are a calm study partner. LISTEN to the user carefully. WAIT until the user completely finishes their thought before you respond. DO NOT interrupt.',
  voiceName = 'Kore',
  onTranscriptionUpdate
}: UseGeminiLiveOptions) => {
  const [isActive, setIsActive] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  
  // 用于累加文字，防止“碎字”展示，实现“一句一答”
  const currentInputText = useRef('');
  const currentOutputText = useRef('');
  const isConnected = useRef(false);

  const encodePCM = (data: Float32Array): string => {
    const int16 = new Int16Array(data.length);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      sum += Math.abs(s);
    }
    setVolume(Math.round((sum / data.length) * 500));
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decodeAudioData = async (base64: string, ctx: AudioContext): Promise<AudioBuffer> => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const stopAudio = useCallback(() => {
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    setIsAiSpeaking(false);
  }, []);

  const disconnect = useCallback(() => {
    isConnected.current = false;
    setIsActive(false);
    setVolume(0);
    if (sessionRef.current) { try { sessionRef.current.close(); } catch(e){} sessionRef.current = null; }
    if (inputContextRef.current) { try { inputContextRef.current.close(); } catch(e){} inputContextRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    stopAudio();
    currentInputText.current = '';
    currentOutputText.current = '';
  }, [stopAudio]);

  const connect = useCallback(async () => {
    disconnect();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      await audioContextRef.current.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      streamRef.current = stream;
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputContextRef.current = inputCtx;
      await inputCtx.resume();

      const sessionPromise = ai.live.connect({
        model,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
          systemInstruction: systemInstruction + " IMPORTANT: Only answer one complete sentence at a time.",
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            isConnected.current = true;
            setIsActive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              // 关键守卫：确保连接已开启才发送数据
              if (!isConnected.current) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBase64 = encodePCM(inputData);
              sessionPromise.then(s => {
                if (s && isConnected.current) s.sendRealtimeInput({ media: { data: pcmBase64, mimeType: 'audio/pcm;rate=16000' } });
              }).catch(() => {});
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // 文字累加展示逻辑：由 currentInputText/currentOutputText 管理
            if (msg.serverContent?.inputTranscription) {
              currentInputText.current += msg.serverContent.inputTranscription.text;
              onTranscriptionUpdate?.(currentInputText.current, 'user', false);
            }
            if (msg.serverContent?.outputTranscription) {
              currentOutputText.current += msg.serverContent.outputTranscription.text;
              onTranscriptionUpdate?.(currentOutputText.current, 'bot', false);
            }

            // 回合结束逻辑：触发 Final 状态
            if (msg.serverContent?.turnComplete) {
              onTranscriptionUpdate?.(currentInputText.current, 'user', true);
              onTranscriptionUpdate?.(currentOutputText.current, 'bot', true);
              currentInputText.current = '';
              currentOutputText.current = '';
            }

            // 音频流处理
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              setIsAiSpeaking(true);
              const buffer = await decodeAudioData(audioData, audioContextRef.current);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              const now = audioContextRef.current.currentTime;
              const startAt = Math.max(now, nextStartTimeRef.current);
              source.start(startAt);
              nextStartTimeRef.current = startAt + buffer.duration;
              activeSourcesRef.current.add(source);
              source.onended = () => {
                activeSourcesRef.current.delete(source);
                if (activeSourcesRef.current.size === 0) setIsAiSpeaking(false);
              };
            }

            if (msg.serverContent?.interrupted) stopAudio();
          },
          onclose: () => setIsActive(false),
          onerror: (err) => { 
            console.error("Live Error:", err); 
            setIsActive(false); 
            isConnected.current = false;
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsActive(false);
      throw err;
    }
  }, [model, systemInstruction, voiceName, onTranscriptionUpdate, stopAudio, disconnect]);

  useEffect(() => () => disconnect(), [disconnect]);

  return { isActive, isAiSpeaking, volume, connect, disconnect };
};
