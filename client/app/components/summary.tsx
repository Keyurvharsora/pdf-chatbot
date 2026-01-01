'use client';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Loader2, Download, Copy, Check, Zap, Brain, RefreshCw } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import * as React from 'react';
import Loader from './loader';

const SummaryComponent: React.FC = () => {
  const { user, isLoaded } = useUser();
  const [summary, setSummary] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const generateSummary = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          filename: 'Current Document'
        })
      });
      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      console.error('Error generating summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSummary('');
  };

  if (!isLoaded) return <div className="flex items-center justify-center h-full"><Loader /></div>;

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 w-full p-6 overflow-y-auto relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto w-full space-y-8 relative z-10">
        {/* Action Section */}
        {!summary && !loading && (
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
            <div className="relative flex flex-col items-center justify-center p-16 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-40 animate-pulse" />
                <div className="relative p-6 rounded-full bg-gradient-to-br from-blue-600/30 to-purple-600/30 border-2 border-blue-400/50">
                  <FileText className="w-16 h-16 text-blue-300" />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-white">Ready to Analyze</h3>
                <p className="text-slate-400 max-w-md">
                  Click below to unleash AI-powered analysis on your uploaded document. 
                  Get comprehensive insights in seconds.
                </p>
              </div>
              
              <Button 
                onClick={generateSummary}
                className="group/btn cursor-pointer relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-12 py-7 rounded-2xl text-lg font-bold shadow-2xl shadow-blue-600/30 flex items-center gap-3 transition-all hover:scale-105 hover:shadow-blue-600/50 border border-blue-400/30"
              >
                <Sparkles className="w-6 h-6" />
                Generate Intelligence
                {/* <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" /> */}
              </Button>
              
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span>Instant Results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur opacity-30 animate-pulse" />
            <div className="relative flex flex-col items-center justify-center p-16 rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl space-y-8">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin" />
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-40" />
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-xl font-semibold text-white">AI is analyzing your document...</p>
                <p className="text-sm text-slate-400 italic max-w-md">
                  "Processing complex patterns, extracting key insights, and generating comprehensive analysis"
                </p>
                
                <div className="flex gap-2 justify-center pt-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result Area */}
        {summary && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Result Header */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
              <div className="relative bg-slate-900/90 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <span className="text-sm font-bold uppercase tracking-widest text-emerald-400">Analysis Complete</span>
                    </div>
                    <div className="h-6 w-px bg-white/20" />
                    <span className="text-xs text-slate-500">Generated just now</span>
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
                    
                    <button className="px-4 py-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-2 text-sm font-medium border border-white/10 hover:border-white/20">
                      <Download className="w-4 h-4" />
                      Save PDF
                    </button>
                    
                    <button 
                      onClick={handleReset}
                      className="px-4 py-2 hover:bg-red-500/10 rounded-xl text-slate-400 hover:text-red-400 transition-all flex items-center gap-2 text-sm font-medium border border-white/10 hover:border-red-500/30"
                    >
                      <RefreshCw className="w-4 h-4" />
                      New
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Result Content */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
              <div className="relative bg-slate-900/90 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600" />
                
                <div className="p-10 prose prose-invert max-w-none">
                  <div className="text-slate-200 leading-relaxed whitespace-pre-wrap text-lg space-y-4">
                    {summary}
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 px-10 py-6 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-6">
                      <span>✨ Generated by AI</span>
                      <span>📄 {summary.split(' ').length} words</span>
                      <span>⚡ Instant processing</span>
                    </div>
                    <span>Powered by Advanced Language Models</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryComponent;