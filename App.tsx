import React, { useState } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { StoryDisplay } from './components/StoryDisplay';
import { Button } from './components/ui/Button';
import { generateStoryFromImage, fileToBase64 } from './services/geminiService';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [storyText, setStoryText] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleImageSelected = async (file: File) => {
    setImageFile(file);
    // Reset story when new image is picked
    setStoryText(""); 
  };

  const handleGenerate = async () => {
    if (!imageFile) return;

    setIsGenerating(true);
    setStoryText(""); // Clear previous story

    try {
      const base64 = await fileToBase64(imageFile);
      const story = await generateStoryFromImage(base64, imageFile.type);
      setStoryText(story);
    } catch (error) {
      console.error(error);
      setStoryText("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-slate-700 py-4 px-6 sm:px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">StoryCraft AI</h1>
          </div>
          <a 
            href="#" 
            className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block"
          >
            Powered by Gemini
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full gap-8">
        
        {/* Top Section: Introduction */}
        <div className="text-center max-w-2xl mx-auto py-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-4">
            Turn Images into Stories
          </h2>
          <p className="text-slate-400 text-lg">
            Upload an image and let our AI ghostwriter craft a compelling opening scene, then listen to it narrated by an expressive voice.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[600px]">
          
          {/* Left Column: Input */}
          <div className="flex flex-col gap-6 bg-card p-6 rounded-2xl shadow-xl shadow-black/20 border border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs">1</span>
                Visual Inspiration
              </h3>
            </div>
            
            <div className="flex-grow flex flex-col justify-center">
              <ImageUploader onImageSelected={handleImageSelected} isLoading={isGenerating} />
            </div>

            <div className="pt-2">
               <Button 
                className="w-full py-3 text-lg"
                onClick={handleGenerate}
                disabled={!imageFile || isGenerating}
                isLoading={isGenerating}
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                }
               >
                 {isGenerating ? 'Crafting Story...' : 'Ghostwrite Story'}
               </Button>
            </div>
          </div>

          {/* Right Column: Output */}
          <div className="flex flex-col gap-6 bg-card p-6 rounded-2xl shadow-xl shadow-black/20 border border-slate-700 relative overflow-hidden">
            <div className="flex items-center justify-between z-10">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700 text-xs">2</span>
                The Story
              </h3>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex-grow relative z-10 h-full overflow-hidden">
              <StoryDisplay storyText={storyText} isStoryLoading={isGenerating} />
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;