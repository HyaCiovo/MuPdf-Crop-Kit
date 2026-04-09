import { useRef, useState, useEffect, useCallback } from "react";
import toast, { Toaster } from 'react-hot-toast';

type SplitType = 'vertical' | 'horizontal';

interface Progress {
  current: number;
  total: number;
  phase: 'loading' | 'cropping';
}

const MuPdf = () => {
  const workerRef = useRef<Worker>();
  const fileRef = useRef<File>();
  const resultSectionRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<string[]>([]);
  const [cropPages, setCropPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [splitType, setSplitType] = useState<SplitType>('vertical');
  const [resultBuffer, setResultBuffer] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    // Initialize worker
    const worker = new Worker(new URL('./mupdf.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      const { type, payload } = e.data;

      switch (type) {
        case "PROGRESS":
          setProgress(payload);
          break;

        case "DOC_LOADED": {
          const { pageBlobs } = payload;
          const urls = pageBlobs.map((blob: Blob) => URL.createObjectURL(blob));
          setPages(urls);
          setIsProcessing(false);
          setProgress(null);
          toast.success('File loaded successfully!');
          break;
        }

        case "DOC_CROPPED": {
          const { cropPageBlobs, buffer } = payload;
          const urls = cropPageBlobs.map((blob: Blob) => URL.createObjectURL(blob));
          setCropPages(urls);
          setResultBuffer(buffer);
          setIsProcessing(false);
          setProgress(null);
          toast.success('Cropping completed!');
          // Auto scroll to result
          setTimeout(() => {
            resultSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
          break;
        }

        case "ERROR":
          setIsProcessing(false);
          setProgress(null);
          toast.error(payload.message || 'An error occurred during processing');
          break;
      }
    };

    return () => {
      worker.terminate();
    };
  }, []);

  const handleFileChange = (info: React.ChangeEvent<HTMLInputElement>) => {
    const files = info.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      fileRef.current = file;
      setPages([]);
      setCropPages([]);
      setResultBuffer(null);
      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        workerRef.current?.postMessage({
          type: "LOAD_DOC",
          payload: { arrayBuffer }
        }, [arrayBuffer]);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const convert = () => {
    if (!pages.length) return toast.error('Please upload a PDF file first!');
    setIsProcessing(true);
    setCropPages([]);
    setResultBuffer(null);

    workerRef.current?.postMessage({
      type: "CROP_DOC",
      payload: { splitType }
    });
  };

  const download = () => {
    if (!resultBuffer) return toast.error('Please crop the file first!');
    const blob = new Blob([resultBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = fileRef.current?.name?.split('.').slice(0, -1).join('.') || 'result';
    link.download = `${fileName}_cropped.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clear = useCallback(() => {
    pages.forEach(url => URL.revokeObjectURL(url));
    cropPages.forEach(url => URL.revokeObjectURL(url));
  }, [pages, cropPages]);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <Toaster containerClassName='min-w-[250px]' />
      
      {/* Action Controls */}
      <div className="flex flex-wrap justify-center items-center gap-4 mb-10">
        <div className="hover:scale-105 transition-transform">
          <label className="cursor-pointer font-bold bg-linear-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-8 rounded-xl shadow-lg inline-flex items-center gap-2" htmlFor="upload">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {pages.length > 0 ? 'Change File' : 'Upload PDF'}
          </label>
          <input className="hidden" id="upload" type="file" onChange={handleFileChange} accept=".pdf" disabled={isProcessing} />
        </div>

        {pages.length > 0 && (
          <div className="flex items-center gap-4 p-2 bg-white/50 backdrop-blur-sm rounded-xl border border-orange-100 shadow-sm">
            <span className="text-sm font-bold text-gray-600 ml-2">Split Mode:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setSplitType('vertical')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all cursor-pointer ${splitType === 'vertical' ? 'bg-white shadow-sm text-[#FD4D07]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Vertical (A3→A4)
              </button>
              <button 
                onClick={() => setSplitType('horizontal')}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all cursor-pointer ${splitType === 'horizontal' ? 'bg-white shadow-sm text-[#FD4D07]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Horizontal
              </button>
            </div>

            <button 
              className={`font-bold bg-linear-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-2 px-6 rounded-lg shadow-md transition-all cursor-pointer inline-flex items-center gap-2 ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
              onClick={convert}
              disabled={isProcessing}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
              {isProcessing ? 'Processing...' : 'Crop Now'}
            </button>

            <button 
              className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
              onClick={() => {
                setPages([]);
                setCropPages([]);
                setResultBuffer(null);
                fileRef.current = undefined;
              }}
              title="Clear All"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isProcessing && progress && (
        <div className="w-full max-w-md mx-auto mb-8">
          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1 capitalize">
            <span>{progress.phase === 'loading' ? 'Loading' : 'Cropping'}...</span>
            <span>{Math.round((progress.current / progress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-linear-to-r from-[#FD8F2F] to-[#FD4D07] h-full transition-all duration-300" 
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="space-y-12">
        {/* Source Pages */}
        {pages.length > 0 && (
          <section>
            <h2 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-[#FD4D07] flex items-center justify-center text-sm font-bold shadow-sm">1</span>
              Source Document ({pages.length} pages)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-white/30 rounded-2xl border border-white/50 shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
              {pages.map((page, index) => (
                <div key={index} className="group relative bg-white p-1 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <img src={page} alt={`Page ${index + 1}`} className="w-full h-auto rounded" />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    Page {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Cropped Pages */}
        {cropPages.length > 0 && (
          <section ref={resultSectionRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-[#FD4D07] flex items-center justify-center text-sm font-bold shadow-sm">2</span>
                Cropped Result ({cropPages.length} pages)
              </h2>
              <button 
                className="font-bold cursor-pointer bg-linear-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-2 px-6 rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                onClick={download}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Result
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 bg-white/30 rounded-2xl border border-white/50 shadow-inner max-h-[500px] overflow-y-auto custom-scrollbar">
              {cropPages.map((page, index) => (
                <div key={index} className="group relative bg-white p-1 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <img src={page} alt={`Result ${index + 1}`} className="w-full h-auto rounded" />
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                    Result {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MuPdf;
