import Image from "next/image";
import FileUploadComponent from "./components/file-upload";
import ChatComponent from "./components/chat";

export default function Home() {
  return (
    <div className="min-h-screen w-screen flex bg-[#0d0d0d] text-white">
  {/* Left Panel – Upload PDF */}
  <div className="w-[30vw] min-h-screen border-r border-gray-700 p-6" style={{display: "flex", alignItems: "center"}}>
    <FileUploadComponent />
  </div>

  {/* Right Panel – Chat Area */}
  <div className="w-[70vw] min-h-screen p-6">
    <h2 className="text-2xl font-semibold mb-4">💬 Chat</h2>
    <div className="bg-gray-900 rounded-lg h-[80vh] p-4 overflow-y-auto">
      <ChatComponent />
    </div>
  </div>
</div> 
  );
}
