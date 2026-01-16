
import React, { useState, useCallback } from 'react';
import { ImageFile, TryOnResult } from './types';
import ImageUploader from './components/ImageUploader';
import ResultCard from './components/ResultCard';
import { performTryOn } from './services/geminiService';

const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<ImageFile | null>(null);
  const [clothingItems, setClothingItems] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<TryOnResult[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const handleModelUpload = (files: ImageFile[]) => {
    if (files.length > 0) setModelImage(files[0]);
  };

  const handleClothingUpload = (files: ImageFile[]) => {
    setClothingItems((prev) => [...prev, ...files]);
  };

  const removeClothing = (id: string) => {
    setClothingItems((prev) => prev.filter(item => item.id !== id));
  };

  const runTryOn = useCallback(async () => {
    if (!modelImage || clothingItems.length === 0) return;

    setIsProcessingAll(true);
    
    // Initialize results as pending
    const initialResults: TryOnResult[] = clothingItems.map(item => ({
      clothingId: item.id,
      clothingName: item.name,
      imageUrl: '',
      status: 'pending'
    }));
    
    setResults(initialResults);

    // Process each item
    for (const item of clothingItems) {
      setResults(prev => prev.map(r => 
        r.clothingId === item.id ? { ...r, status: 'processing' } : r
      ));

      try {
        const generatedUrl = await performTryOn(
          modelImage.data,
          modelImage.mimeType,
          item.data,
          item.mimeType,
          item.name
        );

        setResults(prev => prev.map(r => 
          r.clothingId === item.id ? { ...r, status: 'completed', imageUrl: generatedUrl } : r
        ));
      } catch (err: any) {
        setResults(prev => prev.map(r => 
          r.clothingId === item.id ? { ...r, status: 'error', error: err.message } : r
        ));
      }
    }

    setIsProcessingAll(false);
  }, [modelImage, clothingItems]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
            <span className="text-black font-serif text-xl">V</span>
          </div>
          <h1 className="text-lg font-serif tracking-tight">Vogue<span className="font-sans font-light opacity-50 italic">AI Studio</span></h1>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] tracking-[0.2em] font-medium text-white/40">
          <a href="#" className="hover:text-white transition-colors">COLLECTIONS</a>
          <a href="#" className="hover:text-white transition-colors">VIRTUAL ATELIER</a>
          <a href="#" className="hover:text-white transition-colors">ABOUT</a>
        </div>

        <button 
          onClick={runTryOn}
          disabled={!modelImage || clothingItems.length === 0 || isProcessingAll}
          className={`px-8 py-2 rounded-full text-xs font-bold tracking-widest transition-all ${
            !modelImage || clothingItems.length === 0 || isProcessingAll
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            : 'bg-white text-black hover:bg-zinc-200 active:scale-95'
          }`}
        >
          {isProcessingAll ? 'PROCESSING...' : 'GENERATE LOOKS'}
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-4 space-y-12">
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-serif mb-2">The Model</h2>
              <p className="text-sm text-gray-500">Select the person image who will try on the garments. Studio backgrounds or plain walls work best.</p>
            </div>
            <ImageUploader 
              label="Subject Image" 
              onUpload={handleModelUpload}
              currentImages={modelImage ? [modelImage] : []}
              onRemove={() => setModelImage(null)}
            />
          </section>

          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-serif mb-2">The Wardrobe</h2>
              <p className="text-sm text-gray-500">Upload multiple clothing assets. These will be fitted individually to your model.</p>
            </div>
            <ImageUploader 
              label="Clothing Assets" 
              onUpload={handleClothingUpload}
              multiple={true}
              currentImages={clothingItems}
              onRemove={removeClothing}
            />
          </section>
        </div>

        {/* Right Panel: Results */}
        <div className="lg:col-span-8">
          <div className="mb-8 flex items-baseline justify-between border-b border-white/5 pb-4">
            <h2 className="text-2xl font-serif">Try-On Results</h2>
            <span className="text-xs text-zinc-500 uppercase tracking-widest">{results.length} Concepts</span>
          </div>

          {results.length === 0 ? (
            <div className="h-[600px] border border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-12 bg-zinc-900/20">
              <div className="w-16 h-16 border border-white/10 rounded-full flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-serif mb-3 text-zinc-400">Ready to Visualize</h3>
              <p className="text-sm text-zinc-600 max-w-sm">
                Upload a model image and your desired clothing items to start the virtual try-on engine. 
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
              {results.map((result) => (
                <ResultCard key={result.clothingId} result={result} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Bar for Mobile */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
        <button 
          onClick={runTryOn}
          disabled={!modelImage || clothingItems.length === 0 || isProcessingAll}
          className={`w-full py-4 rounded-xl text-xs font-bold tracking-[0.3em] shadow-2xl transition-all ${
            !modelImage || clothingItems.length === 0 || isProcessingAll
            ? 'bg-zinc-800 text-zinc-500 opacity-50'
            : 'bg-white text-black hover:scale-[1.02] active:scale-95'
          }`}
        >
          {isProcessingAll ? 'GENERATING LOOKS...' : 'RENDER COLLECTION'}
        </button>
      </div>

      <footer className="border-t border-white/5 py-8 px-6 text-[10px] text-white/20 tracking-widest uppercase flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; 2024 VOGUE AI STUDIO - POWERED BY GEMINI VISION</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white">TERMS</a>
          <a href="#" className="hover:text-white">PRIVACY</a>
          <a href="#" className="hover:text-white">API DOCUMENTATION</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
