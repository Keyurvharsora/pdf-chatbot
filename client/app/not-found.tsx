'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Home, History, Sparkles, ShieldAlert, Cpu } from 'lucide-react';

export default function NotFound() {
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(100);

    const messages = [
        "Scanning neural pathways...",
        "Error: Reference void detected.",
        "Attempting data recovery...",
        "Neural link offline."
    ];

    useEffect(() => {
        let ticker = setInterval(() => {
            tick();
        }, typingSpeed);

        return () => { clearInterval(ticker); };
    }, [displayText, typingSpeed]);

    const tick = () => {
        let i = loopNum % messages.length;
        let fullText = messages[i];
        let updatedText = isDeleting 
            ? fullText.substring(0, displayText.length - 1) 
            : fullText.substring(0, displayText.length + 1);

        setDisplayText(updatedText);

        if (isDeleting) {
            setTypingSpeed(prev => prev / 1.5);
        }

        if (!isDeleting && updatedText === fullText) {
            setIsDeleting(true);
            setTypingSpeed(2000); // Pause at end
        } else if (isDeleting && updatedText === '') {
            setIsDeleting(false);
            setLoopNum(loopNum + 1);
            setTypingSpeed(500);
        }
    };

    return (
        <div className="not-found-container">
            <style jsx>{`
                .not-found-container {
                    --bg-color: #02020a;
                    --accent-blue: #3b82f6;
                    --accent-purple: #a855f7;
                    --text-primary: #ffffff;
                    --text-dim: #64748b;
                    --panel-bg: rgba(255, 255, 255, 0.02);
                    --border-glow: rgba(59, 130, 246, 0.3);

                    min-height: 100vh;
                    width: 100vw;
                    background: var(--bg-color);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Inter', sans-serif;
                    position: fixed;
                    top: 0;
                    left: 0;
                    z-index: 9999;
                    overflow: hidden;
                    color: white;
                }

                /* --- High-End Background --- */
                .background-mesh {
                    position: absolute;
                    inset: 0;
                    background-image: 
                        radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 100% 0%, rgba(168, 85, 247, 0.05) 0%, transparent 40%);
                    z-index: 0;
                }

                .grid {
                    position: absolute;
                    inset: 0;
                    background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
                    background-size: 50px 50px;
                    mask-image: radial-gradient(circle at center, black, transparent 80%);
                    z-index: 1;
                }

                /* --- Floating Glows --- */
                .glow {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    border-radius: 50%;
                    filter: blur(120px);
                    opacity: 0.15;
                    z-index: 0;
                    animation: move 20s infinite alternate-reverse linear;
                }

                @keyframes move {
                    from { transform: translate(-10%, -10%) scale(1); }
                    to { transform: translate(10%, 10%) scale(1.1); }
                }

                /* --- The Glass Terminal --- */
                .terminal-card {
                    position: relative;
                    z-index: 10;
                    width: 90%;
                    max-width: 680px;
                    background: var(--panel-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 28px;
                    box-shadow: 0 40px 100px -20px rgba(0,0,0,0.8);
                    animation: cardIn 1s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes cardIn {
                    from { opacity: 0; transform: translateY(40px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                .header {
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    background: rgba(255, 255, 255, 0.01);
                }

                .dots { display: flex; gap: 8px; }
                .dot { width: 10px; height: 10px; border-radius: 50%; opacity: 0.5; }
                .r { background: #ef4444; } .y { background: #f59e0b; } .g { background: #10b981; }

                .sys-info {
                    margin-left: auto;
                    font-family: monospace;
                    font-size: 11px;
                    letter-spacing: 2px;
                    color: var(--text-dim);
                    text-transform: uppercase;
                }

                .body {
                    padding: 60px 40px;
                    text-align: center;
                }

                .big-404 {
                    font-size: 140px;
                    font-weight: 900;
                    line-height: 0.8;
                    margin-bottom: 20px;
                    background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.1) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    letter-spacing: -8px;
                    position: relative;
                    user-select: none;
                }

                .big-404::after {
                    content: '404';
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    -webkit-text-fill-color: transparent;
                    -webkit-text-stroke: 1px rgba(255,255,255,0.1);
                    z-index: -1;
                    transform: translateY(10px);
                }

                .typing-area {
                    font-family: 'Fira Code', 'Courier New', monospace;
                    font-size: 18px;
                    color: var(--accent-blue);
                    min-height: 30px;
                    margin: 30px 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }

                .cursor {
                    width: 8px;
                    height: 20px;
                    background: var(--accent-blue);
                    animation: blink 0.8s infinite;
                    box-shadow: 0 0 10px var(--accent-blue);
                }

                @keyframes blink { 50% { opacity: 0; } }

                .description {
                    font-size: 16px;
                    color: var(--text-dim);
                    max-width: 400px;
                    margin: 0 auto 50px;
                    line-height: 1.6;
                }

                /* --- Futuristic Buttons --- */
                .actions {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    margin-top: 20px;
                }

                .btn-wrapper {
                    position: relative;
                    group;
                }

                .p-btn {
                    position: relative;
                    padding: 2px;
                    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
                    border-radius: 16px;
                    text-decoration: none;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    display: block;
                    overflow: hidden;
                }

                .p-btn-inner {
                    padding: 14px 36px;
                    background: #fff;
                    color: #000;
                    border-radius: 14px;
                    font-weight: 800;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.4s;
                }

                .p-btn:hover {
                    transform: translateY(-4px) scale(1.02);
                    box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.5);
                }

                .p-btn:hover .p-btn-inner {
                    background: transparent;
                    color: #fff;
                }

                .s-btn {
                    position: relative;
                    padding: 16px 36px;
                    background: rgba(255, 255, 255, 0.03);
                    color: #fff;
                    border-radius: 16px;
                    font-weight: 600;
                    font-size: 16px;
                    text-decoration: none;
                    transition: all 0.4s;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    backdrop-filter: blur(10px);
                }

                .s-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.3);
                    transform: translateY(-4px);
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
                }

                .btn-glow {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
                    filter: blur(20px);
                    opacity: 0;
                    transition: opacity 0.4s;
                    z-index: -1;
                }

                .p-btn:hover + .btn-glow {
                    opacity: 0.6;
                }

                /* --- Scanlines --- */
                .scanline {
                    position: absolute;
                    width: 100%;
                    height: 100px;
                    background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.05), transparent);
                    top: -100px;
                    animation: scan 4s linear infinite;
                    z-index: 5;
                }

                @keyframes scan {
                    from { top: -100px; }
                    to { top: 100%; }
                }

                @media (max-width: 600px) {
                    .big-404 { font-size: 100px; }
                    .actions { flex-direction: column; width: 100%; }
                    .p-btn, .s-btn { justify-content: center; }
                    .terminal-card { padding: 0 10px; }
                }
            `}</style>

            <div className="background-mesh" />
            <div className="grid" />
            <div className="glow" style={{ background: 'var(--accent-blue)', top: '10%', left: '10%' }} />
            <div className="glow" style={{ background: 'var(--accent-purple)', bottom: '10%', right: '10%' }} />

            <div className="terminal-card">
                <div className="scanline" />
                <div className="header">
                    <div className="dots">
                        <div className="dot r" />
                        <div className="dot y" />
                        <div className="dot g" />
                    </div>
                    <div className="sys-info">
                        <Sparkles size={12} style={{ display: 'inline', marginRight: 8 }} />
                        Protocol_Missing
                    </div>
                </div>

                <div className="body">
                    <div className="big-404 italic-none">404</div>
                    
                    <div className="typing-area">
                        <span>{displayText}</span>
                        <div className="cursor" />
                    </div>

                    <p className="description">
                        The requested page you are looking for does not exist or has been moved.
                    </p>

                    <div className="actions">
                        <div className="btn-wrapper">
                            <Link href="/" className="p-btn">
                                <span className="p-btn-inner">
                                    <Home size={20} />
                                    Return Home
                                </span>
                            </Link>
                            <div className="btn-glow" />
                        </div>
                    </div>
                </div>

                {/* Decorative Bottom Bar */}
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '1px solid rgba(255,255,255,0.05)'
                }}>
                    <span>Neural_Link_Status: 404_VOID</span>
                    <span>Security_Level: CRITICAL</span>
                </div>
            </div>
        </div>
    );
}
