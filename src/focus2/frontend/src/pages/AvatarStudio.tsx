
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/Common';

// --- TYPES ---
interface GenerationState {
  isGenerating: boolean;
  error: string | null;
  resultUrl: string | null;
  status: string;
}

interface CustomizationOptions {
  faceShape: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  expression: string;
  outfit: string;
  accessory: string;
}

type AppMode = 'ai-transform' | 'manual-create';

const IOS_STYLE_INSTRUCTION = `
STYLE RULES (STRICT ADHERENCE):
- STYLE: Professional 3D Apple Memoji/Emoji sticker "soft-moe" (cute) aesthetic.
- CARTOONIZATION: This is NOT a realistic 3D scan. It MUST look like a designed animation character. 
- GEOMETRY: Ultra-smooth, highly rounded surfaces. Exaggerate "cute" proportions (e.g., larger head, softer rounded jawline).
- TEXTURE: Soft matte clay-like shaders with gentle ambient occlusion. Hair must be stylized into glossy rounded shapes.
- COLOR: High-saturation "macaron" color palette (pastels mixed with vibrant accents).
- CHARACTER: Extremely large expressive "shiny" eyes.
- FINISH: Thick white sticker border around the ensemble.
`;

const fileToDataPart = async (file: File): Promise<{ inlineData: { data: string, mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const transformPhotoToEmoji = async (imageFile: File): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const imagePart = await fileToDataPart(imageFile);
  
  const prompt = `
    TASK: Convert this photo into a stylized "Soft-Cute" 3D animated sticker.
    ${IOS_STYLE_INSTRUCTION}
    
    BACKGROUND REQUIREMENT: 
    - Identify the environment in the original photo (e.g., a room, office, library, or outdoor).
    - Generate a simplified, highly aesthetic 3D cartoon version of this specific background.
    - Keep the colors and atmosphere consistent with the original but rendered in macaron tones.
    
    FIDELITY: 
    Capture the core identity (hairstyle, expression) but transform into a lovable 3D cartoon character.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [imagePart, { text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Sticker generation failed. Try a clearer photo.");
};

const createManualEmoji = async (options: CustomizationOptions): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `
    TASK: Generate a high-resolution "Soft-Cute" 3D iOS Memoji sticker.
    - Face: ${options.faceShape}, Skin: ${options.skinTone}, Hair: ${options.hairStyle} (${options.hairColor})
    - Expression: ${options.expression}, Outfit: ${options.outfit}, Accessory: ${options.accessory}
    ${IOS_STYLE_INSTRUCTION}
    Include a beautiful soft pastel study room background.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Manual sticker creation failed.");
};

const ManualCustomizer: React.FC<{ options: CustomizationOptions; setOptions: React.Dispatch<React.SetStateAction<CustomizationOptions>> }> = ({ options, setOptions }) => {
  const categories = [
    { label: 'Face', key: 'faceShape', options: ['Soft Heart', 'Rounded Oval', 'Cute Circle'] },
    { label: 'Skin', key: 'skinTone', options: ['Fair Pink', 'Natural Peach', 'Deep Cocoa'] },
    { label: 'Hair', key: 'hairStyle', options: ['Puffy Bun', 'Soft Waves', 'Rounded Ponytail'] },
    { label: 'Color', key: 'hairColor', options: ['Macaron Brown', 'Strawberry Pink', 'Soft Black'] },
    { label: 'Outfit', key: 'outfit', options: ['Striped Hoodie', 'Pastel Polo', 'Soft Sweater'] },
  ];
  return (
    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {categories.map((cat) => (
        <div key={cat.key}>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{cat.label}</h4>
          <div className="flex flex-wrap gap-2">
            {cat.options.map((opt) => (
              <button
                key={opt}
                onClick={() => setOptions(prev => ({ ...prev, [cat.key]: opt }))}
                className={`px-4 py-2 rounded-2xl text-xs font-bold border-2 transition-all ${(options as any)[cat.key] === opt ? 'border-pink-400 bg-pink-50 text-pink-600' : 'border-slate-100 bg-white text-slate-500 hover:border-pink-100'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const AvatarStudio: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AppMode>('ai-transform');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [manualOptions, setManualOptions] = useState<CustomizationOptions>({
    faceShape: 'Soft Heart', skinTone: 'Natural Peach', hairStyle: 'Puffy Bun',
    hairColor: 'Macaron Brown', expression: 'Sweet Smile', outfit: 'Striped Hoodie', accessory: 'Curved Cap'
  });
  const [genState, setGenState] = useState<GenerationState>({ isGenerating: false, error: null, resultUrl: null, status: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = async () => {
    if (mode === 'ai-transform' && !selectedFile) return;
    setGenState({ isGenerating: true, error: null, resultUrl: null, status: 'Analyzing Identity...' });
    
    try {
      const result = mode === 'ai-transform' ? await transformPhotoToEmoji(selectedFile!) : await createManualEmoji(manualOptions);
      setGenState({ isGenerating: false, error: null, resultUrl: result, status: 'Complete!' });
    } catch (err: any) {
      setGenState({ isGenerating: false, error: err.message, resultUrl: null, status: 'Error' });
    }
  };

  const saveToProfile = () => {
    if (genState.resultUrl) {
      localStorage.setItem('user_custom_avatar_v2', genState.resultUrl);
      navigate('/my');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8FD] flex flex-col pb-20">
      <header className="sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between border-b border-pink-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/my')} className="p-2 text-pink-500 hover:bg-pink-50 rounded-full transition-colors">
            <i className="fas fa-chevron-left"></i>
          </button>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Identity Studio</h1>
        </div>
        <nav className="flex bg-slate-100 p-1 rounded-2xl">
          <button onClick={() => setMode('ai-transform')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'ai-transform' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>AI MAGIC</button>
          <button onClick={() => setMode('manual-create')} className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${mode === 'manual-create' ? 'bg-white shadow text-pink-600' : 'text-slate-500'}`}>MANUAL</button>
        </nav>
      </header>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white space-y-6">
            <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
               <span className="w-8 h-8 rounded-lg bg-pink-100 text-pink-500 flex items-center justify-center text-sm">1</span>
               {mode === 'ai-transform' ? 'Upload Photo' : 'Choose Base'}
            </h3>
            
            {mode === 'ai-transform' ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-pink-300 transition-all overflow-hidden bg-slate-50"
              >
                {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : (
                  <div className="text-center p-8">
                    <i className="fas fa-camera text-4xl text-slate-300 mb-4"></i>
                    <p className="text-sm font-bold text-slate-500">Pick a clear selfie</p>
                  </div>
                )}
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setSelectedFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                }} />
              </div>
            ) : <ManualCustomizer options={manualOptions} setOptions={setManualOptions} />}

            <button
              onClick={handleGenerate}
              disabled={genState.isGenerating}
              className="w-full h-16 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {genState.isGenerating ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className="fas fa-magic mr-2"></i>}
              Generate Identity
            </button>
          </div>

          <div className="flex flex-col gap-6">
             <h3 className="font-black text-xl text-slate-800 flex items-center gap-3">
               <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-500 flex items-center justify-center text-sm">2</span>
               Preview Result
            </h3>
            <div className="aspect-square bg-white rounded-[3rem] shadow-2xl border-[12px] border-white flex items-center justify-center relative overflow-hidden">
               {genState.resultUrl ? (
                 <div className="w-full h-full animate-in zoom-in duration-700">
                    <img src={genState.resultUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-x-0 bottom-8 flex justify-center">
                       <Button onClick={saveToProfile} className="px-10 h-14 bg-slate-900 text-white rounded-full shadow-2xl font-black uppercase tracking-widest">
                          Apply to Profile
                       </Button>
                    </div>
                 </div>
               ) : (
                 <div className="text-center opacity-20">
                    {genState.isGenerating ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 border-8 border-pink-100 border-t-pink-500 rounded-full animate-spin mx-auto"></div>
                        <p className="font-black text-slate-800">{genState.status}</p>
                      </div>
                    ) : <i className="fas fa-user-astronaut text-8xl"></i>}
                 </div>
               )}
            </div>
            <p className="text-[10px] text-center text-slate-400 font-black uppercase tracking-[0.2em] px-10">
               Your avatar background will be generated based on the context of your upload.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
