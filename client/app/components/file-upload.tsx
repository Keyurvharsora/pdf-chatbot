'use client'
import { Upload } from 'lucide-react'
import * as React from 'react'

const FileUploadComponent: React.FC = () => {

    const handleFileUpload = () => {
        const el = document.createElement('input');
        el.setAttribute('type', 'file');
        el.setAttribute('accept', 'application/pdf');
        el.addEventListener('change', async (e) => {
            if(!!el.files?.length){
                const file = el?.files?.item(0);
                if(file){
                    const formData = new FormData();
                    formData.append('pdf', file);   
                    const response = await fetch('http://localhost:8000/upload/pdf', {
                        method: "POST",
                        body: formData
                    })
                    if(response) console.log("file uploaded",response)
                }
            }
        })
        el.click()
    }

    return (
        <div className="bg-gradient-to-br from-amber-400 to-amber-500 flex justify-center items-center p-8 rounded-2xl shadow-2xl hover:shadow-amber-300 transition-shadow duration-300 w-full max-w-md mx-auto">
            <div className="flex flex-col items-center w-full">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 drop-shadow">📄 Upload PDF</h2>
                <div className="bg-white rounded-full p-4 shadow-md mb-4 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-amber-500" />
                </div>
                    <div className="inline-block w-full text-center bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg cursor-pointer shadow transition-colors duration-200" onClick={handleFileUpload }>Choose PDF</div>
            </div>
        </div>
    )
}

export default FileUploadComponent