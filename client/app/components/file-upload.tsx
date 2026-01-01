'use client';
import { Upload, CheckCircle, Loader2 } from 'lucide-react';
import * as React from 'react';
import { API_BASE_URL } from '@/lib/api';


const FileUploadComponent: React.FC = () => {
    const [isHovering, setIsHovering] = React.useState(false);
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'success' | 'error'>('idle');
    const [statusText, setStatusText] = React.useState('Click to upload or drag & drop');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            await uploadFile(file);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        setUploadStatus('idle');
        setStatusText('Uploading PDF...');
        
        const formData = new FormData();
        formData.append('pdf', file);
        
        try {
            const response = await fetch(`${API_BASE_URL}/upload/pdf`, {

                method: "POST",
                body: formData
            });

            if (response.ok) {
                const { jobId } = await response.json();
                
                // Start polling for processing status
                setStatusText('AI is analyzing and indexing...');
                
                const pollStatus = async () => {
                    try {
                        const statusRes = await fetch(`${API_BASE_URL}/upload-status/${jobId}`);

                        const { state } = await statusRes.json();
                        
                        if (state === 'completed') {
                            setUploadStatus('success');
                            setStatusText('Ready to chat!');
                            setIsUploading(false);
                            setTimeout(() => {
                                setUploadStatus('idle');
                                setStatusText('Click to upload or drag & drop');
                            }, 3000);
                        } else if (state === 'failed') {
                            setUploadStatus('error');
                            setStatusText('Processing failed');
                            setIsUploading(false);
                        } else {
                            // Continue polling every 1 second
                            setTimeout(pollStatus, 1000);
                        }
                    } catch (err) {
                        setUploadStatus('error');
                        setStatusText('Status check failed');
                        setIsUploading(false);
                    }
                };
                
                pollStatus();
            } else {
                setUploadStatus('error');
                setStatusText('Upload failed');
                setIsUploading(false);
            }
        } catch (err) {
            setUploadStatus('error');
            setStatusText('Connection error');
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full">
            <input 
                type="file" 
                ref={fileInputRef}
                accept="application/pdf" 
                className="hidden"
                onChange={handleFileChange}
            />
            
            <div 
                className={`
                    relative group cursor-pointer 
                    border-2 border-dashed rounded-2xl p-8 
                    transition-all duration-300 ease-in-out
                    flex flex-col items-center justify-center gap-4
                    ${isHovering 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    }
                `}
                onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsHovering(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        uploadFile(e.dataTransfer.files[0]);
                    }
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className={`
                    p-4 rounded-full transition-all duration-300
                    ${isUploading ? 'bg-blue-500/20 animate-pulse' : 'bg-white/10 group-hover:bg-blue-500/20 group-hover:scale-110'}
                `}>
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                    ) : uploadStatus === 'success' ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                    ) : (
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-400" />
                    )}
                </div>

                <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-slate-200">
                        {statusText}
                    </p>
                    {!isUploading && uploadStatus !== 'success' && (
                        <p className="text-xs text-slate-400">PDF only</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUploadComponent;