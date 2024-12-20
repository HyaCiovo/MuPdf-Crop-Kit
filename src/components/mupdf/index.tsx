import { useRef, useState } from "react";
import * as mupdfjs from "./dist/mupdf"
import toast, { Toaster } from 'react-hot-toast';
import { generateNewDoc, renderPage } from "./pdf";
const MuPdf = () => {
  const fileRef = useRef<File>();
  const docRef = useRef<mupdfjs.PDFDocument>();
  const mergedDocRef = useRef<mupdfjs.PDFDocument>();
  const [pages, setPages] = useState<string[]>([]);
  const [cropPages, setCropPages] = useState<string[]>([]);

  const handleFileChange = (info: any) => {
    const files = info.target.files;
    const loading = toast.loading('Loading PDF file...');

    if (files && files.length > 0) {
      fileRef.current = files[0];
      setPages([]);
      setCropPages([])
      docRef.current = undefined;
      mergedDocRef.current = undefined;
      const reader = new FileReader();

      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        docRef.current = new mupdfjs.PDFDocument(arrayBuffer);
        const count = docRef.current.countPages();
        const pageList = [];
        for (let i = 0; i < count; i++) {
          pageList.push(renderPage(i, docRef.current))
        }
        setPages(pageList);
        toast.dismiss(loading)
        toast.success('Loaded successfully!')
      };

      if (files[0]) {
        reader.readAsArrayBuffer(fileRef.current as Blob);
      } else {
        toast.dismiss(loading)
        toast.error('Please select a file!')
      }
    }
  }

  const convert = () => {
    if (!docRef.current)
      return toast.error('Please upload a PDF file first!');
    if (mergedDocRef.current)
      return toast.error('Already cropped!')
    const convertloading = toast.loading('Cropping PDF file...');
    mergedDocRef.current = generateNewDoc(docRef.current);

    const pageList = [];
    for (let i = 0; i < mergedDocRef.current.countPages(); i++) {
      pageList.push(renderPage(i, mergedDocRef.current))
    }
    setCropPages(pageList);
    toast.dismiss(convertloading)
    toast.success('Cropped successfully!')
  }

  const download = () => {
    if (!mergedDocRef.current)
      return toast.error('Please crop the PDF file first!')
    const res = mergedDocRef.current.saveToBuffer().asUint8Array();
    const blob = new Blob([res], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileRef.current?.name?.split('.')[0]}_A4.pdf`;
    link.click();
  }

  return <>
    <Toaster containerClassName='min-w-[250px]' />
    <div className="mb-8 hover:scale-105 hover:rotate-3 transition-all duration-300 ease-in-out">
      <label className="cursor-pointer font-semibold bg-gradient-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-6 my-10 rounded-xl 
            shadow-lg" htmlFor="upload" >Upload PDF File</label>
      <input className="hidden" id="upload" type="file" onChange={handleFileChange} accept=".pdf" />
    </div>
    <div className="grid mx-4 md:grid-cols-2 gap-x-2 md:gap-x-4 gap-y-4 w-full md:mx-8">
      {pages.map((page, index) => <img key={index} src={page} className="w-" alt={`Page ${index + 1}`} />)}
    </div>
    {pages.length > 0 && <button className="font-semibold bg-gradient-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-6 my-10 rounded-xl 
            shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-3" onClick={convert}>Convert</button>}
    <div className="grid mx-4 sm:grid-cols-2 md:grid-cols-4 md:mx-8 gap-x-2 md:gap-x-4 gap-y-4">
      {cropPages.map((page, index) => <img key={index} src={page} className="h-[400px]" alt={`Page ${index + 1}`} />)}
    </div>
    {cropPages.length > 0 && <button className="font-semibold bg-gradient-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-6 my-10 rounded-xl 
            shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-3" onClick={download}>Download</button>}
  </>
}

export default MuPdf;