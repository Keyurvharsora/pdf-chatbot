'use client';
import { Button } from '@/components/ui/button';
import { Languages, Loader2, Download, Copy, Check, RefreshCw, Globe, ChevronRight, Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import * as React from 'react';
import Loader from './loader';
import { API_BASE_URL } from '@/lib/api';

const languages = [
  { id: 'english', name: 'English', icon: '🇺🇸', code: 'en' },
  { id: 'hindi', name: 'Hindi', icon: '🇮🇳', code: 'hi' },
  { id: 'german', name: 'German', icon: '🇩🇪', code: 'de' },
  { id: 'dutch', name: 'Dutch', icon: '🇳🇱', code: 'nl' },
  { id: 'russian', name: 'Russian', icon: '🇷🇺', code: 'ru' },
];

const TranslatorComponent: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [translation, setTranslation] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState(languages[0]);

  const generateTranslation = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          filename: 'Current Document',
          targetLanguage: selectedLanguage.name
        })
      });
      const data = await res.json();
      setTranslation(data.translatedText);
    } catch (err) {
      console.error('Error generating translation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setTranslation('');
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-full"><Loader /></div>;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 w-full p-6 overflow-y-auto relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">PDF Translator</h1>
            <p className="text-slate-400">Convert your document into multiple languages instantly with AI precision.</p>
        </div>

        {/* Action Section */}
        {!translation && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`
                    group relative p-6 rounded-2xl border transition-all duration-300 text-left
                    ${selectedLanguage.id === lang.id 
                      ? 'bg-blue-600/20 border-blue-500/50 ring-2 ring-blue-500/20' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{lang.icon}</span>
                    {selectedLanguage.id === lang.id && (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    )}
                  </div>
                  <h3 className="font-bold text-lg text-white">{lang.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">Translate to {lang.name}</p>
                </button>
              ))}
            </div>

            <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                <div className="relative flex flex-col items-center justify-center p-12 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl space-y-8">
                <Button 
                    onClick={generateTranslation}
                    className="group/btn cursor-pointer relative bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white px-12 py-7 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-600/30 flex items-center gap-3 transition-all hover:scale-105 hover:shadow-blue-600/50 border border-blue-400/30"
                >
                    <Languages className="w-6 h-6" />
                    Translate to {selectedLanguage.name}
                </Button>
                
                <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>High Precision</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Instant Delivery</span>
                    </div>
                </div>
                </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-3xl blur opacity-30 animate-pulse" />
            <div className="relative flex flex-col items-center justify-center p-16 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl space-y-8">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40" />
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-xl font-semibold text-white">Translating into {selectedLanguage.name}...</p>
                <div className="flex gap-2 justify-center pt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Area */}
        {translation && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Result Header */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-slate-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest text-emerald-400">{selectedLanguage.name} Translation content Ready</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCopy}
                      className="group/copy px-4 py-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-medium border border-white/10 hover:border-white/20"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 group-hover/copy:scale-110 transition-transform" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    
                    <button 
                      onClick={handleReset}
                      className="px-4 py-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all flex items-center gap-2 text-sm font-medium border border-white/10 hover:border-red-500/30"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Translate New
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Content */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-emerald-600 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-600 to-cyan-600" />
                
                <div className="p-10">
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-lg space-y-4 font-light">
                    {translation}
                  </div>
                </div>
                
                <div className="bg-white/5 px-10 py-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                        <span>Language: <b>{selectedLanguage.name}</b></span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span>Source: PDF Context</span>
                    </div>
                    <span>AI Enhanced Translation</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslatorComponent;
