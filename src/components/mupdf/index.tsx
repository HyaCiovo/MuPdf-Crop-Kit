import { useRef, useState } from "react";
import * as mupdfjs from "./dist/mupdf"
import toast, { Toaster } from 'react-hot-toast';
const MuPdf = () => {
  const fileRef = useRef<File>();
  const docRef = useRef<mupdfjs.PDFDocument>();
  const mergedDocRef = useRef<mupdfjs.PDFDocument>();
  const [pages, setPages] = useState<string[]>([]);
  const [cropPages, setCropPages] = useState<string[]>([]);

  function renderPage(index: number, doc: mupdfjs.PDFDocument) {
    const page = doc.loadPage(index);
    const zoom = window.devicePixelRatio;
    const png = page
      .toPixmap([zoom, 0, 0, zoom, 0, 0], mupdfjs.ColorSpace.DeviceRGB)
      .asPNG();
    return URL.createObjectURL(new Blob([png]));
  }
  
  function merge(
    targetPDF: mupdfjs.PDFDocument,
    sourcePage: mupdfjs.PDFPage
  ) {
    const pageObj = sourcePage.getObject();
    const [x, y, width, height] = sourcePage.getBounds();
    // Create a new page in the target document
    const newPageObj = targetPDF.addPage(
      [x, y, width, height],
      0,
      targetPDF.newDictionary(),
      ""
    );
    // Copy page contents
    const contents = pageObj.get("Contents");
    if (contents) newPageObj.put("Contents", targetPDF.graftObject(contents));
    // Copy page resources
    const resources = pageObj.get("Resources");
    if (resources) newPageObj.put("Resources", targetPDF.graftObject(resources));
    // Insert the new page at the specified position
    targetPDF.insertPage(-1, newPageObj);
  }
  
  function generateNewDoc(PDF: mupdfjs.PDFDocument) {
    const count = PDF.countPages();
    const mergedPDF = new mupdfjs.PDFDocument();
    for (let i = 0; i < count; i++) {
      const page = PDF.loadPage(i);
      merge(mergedPDF, page);
      merge(mergedPDF, page);
    }
  
    for (let i = 0; i < count * 2; i++) {
      const page = mergedPDF.loadPage(i); // 使用 mergedPDF 的页码
      const [x, y, width, height] = page.getBounds();
      if (i % 2 === 0)
        page.setPageBox("CropBox", [x, y, x + width / 2, y + height]);
      else page.setPageBox("CropBox", [x + width / 2, y, x + width, y + height]);
  
      page.setPageBox("TrimBox", [0, 0, 595.28, 841.89]);
    }
    return mergedPDF;
  }

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
      <label className="cursor-pointer font-semibold bg-linear-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-6 my-10 rounded-xl 
            shadow-lg" htmlFor="upload" >Upload PDF File</label>
      <input className="hidden" id="upload" type="file" onChange={handleFileChange} accept=".pdf" />
    </div>
    <div className="grid mx-4 md:grid-cols-2 gap-x-2 md:gap-x-4 gap-y-4 w-full md:mx-8">
      {pages.map((page, index) => <img key={index} src={page} alt={`Page ${index + 1}`} />)}
    </div>
    {pages.length > 0 && <button className="font-semibold bg-linear-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-6 my-10 rounded-xl 
            shadow-lg transition-all duration-300 cursor-pointer ease-in-out hover:scale-105 hover:rotate-3" onClick={convert}>Crop</button>}
    <div className="grid mx-4 sm:grid-cols-2 md:grid-cols-4 md:mx-8 gap-x-2 md:gap-x-4 gap-y-4">
      {cropPages.map((page, index) => <img key={index} src={page} className="h-[400px]" alt={`Page ${index + 1}`} />)}
    </div>
    {cropPages.length > 0 && <button className="font-semibold cursor-pointer bg-linear-to-r from-[#FD8F2F] to-[#FD4D07] text-white py-3 px-6 my-10 rounded-xl 
            shadow-lg transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-3" onClick={download}>Download</button>}
  </>
}

export default MuPdf;