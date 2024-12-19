import { useRef, useState } from "react";
import * as mupdfjs from "./dist/mupdf"
import { renderPage } from "./pdf";
import { App } from "antd";
import jsPDF from "jspdf";

const MuPdf = () => {
  const { message } = App.useApp();
  const docRef = useRef<mupdfjs.PDFDocument>();
  const docCopyRef = useRef<mupdfjs.PDFDocument>();
  const [pages, setPages] = useState<string[]>([]);
  const [cropPages, setCropPage] = useState<string[]>([]);

  const handleFileChange = (info: any) => {
    const files = info.target.files;
    setCropPage([]);
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        docRef.current = new mupdfjs.PDFDocument(arrayBuffer);
        docCopyRef.current = new mupdfjs.PDFDocument(arrayBuffer);
        const count = docRef.current.countPages();
        const pageList = [];
        for (let i = 0; i < count; i++) {
          pageList.push(renderPage(i, docRef.current))
        }
        setPages(pageList);
      };

      reader.readAsArrayBuffer(file);
    }
  }

  const crop = async (pageNumber: number) => {
    if (!docRef.current || !docCopyRef.current)
      return message.error('Please upload a PDF file first!');
    const page = docRef.current.loadPage(pageNumber) as mupdfjs.PDFPage;
    const [x, y, width, height] = page.getBounds()
    const pageCopy = docCopyRef.current.loadPage(pageNumber) as mupdfjs.PDFPage;

    page.setPageBox("CropBox", [x, y, x + width / 2, y + height]);
    pageCopy.setPageBox("CropBox", [x + width / 2, y, x + width, y + height]);
  }

  const convert = async () => {
    if (!docRef.current || !docCopyRef.current)
      return message.error('Please upload a PDF file first!');
    const pageList = [];
    for (let i = 0; i < pages.length; i++) {
      await crop(i)
      pageList.push(renderPage(i, docRef.current), renderPage(i, docCopyRef.current))
    }
    setCropPage(pageList);
  }

  // const mergePdf = () => {
  //   if (!docRef.current || !docCopyRef.current)
  //     return message.error('Please upload a PDF file first!');
  //   for (let i = 0; i < docRef.current.countPages(); i++) {
  //     merge(docRef.current, docCopyRef.current, i, i + 1, i + 1)
  //   }
  //   const pageList = [];
  //   for (let i = 0; i < pages.length; i++) {
  //     pageList.push(renderPage(i, docRef.current))
  //   }
  //   setCropPage(pageList);
  // }

  const download = () => {
    if (!docRef.current || !docCopyRef.current)
      return message.error('Please upload a PDF file first!');
    // mergePdf()
    // message.warning('This feature is not available yet.')
    const pdf = new jsPDF();
    pdf.addImage(cropPages[0], 'JPEG', 0, 0, 210, 297);
    for (let i = 1; i < cropPages.length; i++) {
      pdf.addPage();
      pdf.addImage(cropPages[i], 'JPEG', 0, 0, 210, 297);
    }
    pdf.save("merged.pdf");
  }

  return <>
    <div className="mb-8 hover:scale-105 hover:rotate-3 transition-all duration-300 ease-in-out">
      <label className="cursor-pointer font-semibold bg-gradient-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-6 my-10 rounded-xl 
            shadow-lg" htmlFor="upload">Upload PDF File</label>
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