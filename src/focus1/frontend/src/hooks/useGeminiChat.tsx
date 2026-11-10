
import { useState, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export interface Message {
  role: 'user' | 'bot';
  text: string;
}

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      // 添加系统指令以符合 App 定位
      const systemInstruction = "You are the 'Focus Companion AI', a helpful and encouraging study partner. Your goal is to help users stay productive, explain complex concepts simply, and provide motivation using a calm, professional, and friendly tone. Keep responses relatively concise to avoid overwhelming the user during study.";

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: [
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
          topP: 0.95,
        }
      });

      let botText = "";
      // 先添加一个空的机器人消息占位
      setMessages(prev => [...prev, { role: 'bot', text: "" }]);

      for await (const chunk of responseStream) {
        const textChunk = chunk.text;
        botText += textChunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'bot') {
            return [...prev.slice(0, -1), { role: 'bot', text: botText }];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I encountered an issue connecting to my brain. Please try again or check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const clearChat = () => setMessages([]);

  return { messages, sendMessage, isTyping, clearChat };
};
