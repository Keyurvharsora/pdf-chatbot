import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  ClerkLoading,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PDF Chatbot",
  description: "PDF Chatbot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-screen w-full overflow-hidden">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen w-full flex flex-col bg-[#0d0d0d]`}
        >
          <header className="flex-shrink-0 flex justify-between items-center px-6 h-16 border-b border-white/10 bg-black shadow-lg z-50">
            {/* Left side: App Logo */}
            {/* <span
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 
                         font-extrabold text-lg sm:text-2xl tracking-wide 
                         transform transition-transform duration-300 hover:scale-105"
            >
              PDF-CHATBOT
            </span> */}
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-purple-500/20">AI</div>
             <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
               PDF Chatbot
             </h1>
          </div>

            {/* Right side: Auth Buttons or User Button */}
            <div className="flex items-center gap-4 min-w-[100px] justify-end">
              <ClerkLoading>
                <div className="h-8 w-8 rounded-full bg-white/5 animate-pulse" />
              </ClerkLoading>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full font-medium text-sm h-10 px-6 shadow-lg shadow-blue-500/20 transition-all">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>

              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </header>

          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}