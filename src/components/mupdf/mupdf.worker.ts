import * as mupdfjs from "./dist/mupdf";

function renderPageToBlob(index: number, doc: mupdfjs.PDFDocument, zoom: number = 1.0) {
  const page = doc.loadPage(index);
  try {
    const png = page
      .toPixmap([zoom, 0, 0, zoom, 0, 0], mupdfjs.ColorSpace.DeviceRGB)
      .asPNG();
    return new Blob([png as BlobPart], { type: 'image/png' });
  } catch (error) {
    console.error("Failed to render at zoom", zoom, error);
    const lowZoom = Math.min(zoom, 1.0);
    const png = page
      .toPixmap([lowZoom, 0, 0, lowZoom, 0, 0], mupdfjs.ColorSpace.DeviceRGB)
      .asPNG();
    return new Blob([png as BlobPart], { type: 'image/png' });
  }
}

function merge(
  targetPDF: mupdfjs.PDFDocument,
  sourcePage: mupdfjs.PDFPage
) {
  const pageObj = sourcePage.getObject();
  const [x, y, width, height] = sourcePage.getBounds();
  const newPageObj = targetPDF.addPage(
    [x, y, width, height],
    0,
    targetPDF.newDictionary(),
    ""
  );
  const contents = pageObj.get("Contents");
  if (contents) newPageObj.put("Contents", targetPDF.graftObject(contents));
  const resources = pageObj.get("Resources");
  if (resources) newPageObj.put("Resources", targetPDF.graftObject(resources));
  targetPDF.insertPage(-1, newPageObj);
}

function generateNewDoc(PDF: mupdfjs.PDFDocument, splitType: 'vertical' | 'horizontal' = 'vertical') {
  const count = PDF.countPages();
  const mergedPDF = new mupdfjs.PDFDocument();
  for (let i = 0; i < count; i++) {
    const page = PDF.loadPage(i);
    merge(mergedPDF, page);
    merge(mergedPDF, page);
  }

  for (let i = 0; i < count * 2; i++) {
    const page = mergedPDF.loadPage(i);
    const [x, y, width, height] = page.getBounds();
    
    if (splitType === 'vertical') {
      if (i % 2 === 0)
        page.setPageBox("CropBox", [x, y, x + width / 2, y + height]);
      else 
        page.setPageBox("CropBox", [x + width / 2, y, x + width, y + height]);
    } else {
      if (i % 2 === 0)
        page.setPageBox("CropBox", [x, y, x + width, y + height / 2]);
      else 
        page.setPageBox("CropBox", [x, y + height / 2, x + width, y + height]);
    }

    page.setPageBox("TrimBox", [0, 0, 595.28, 841.89]);
  }
  return mergedPDF;
}

let currentDoc: mupdfjs.PDFDocument | null = null;
let currentMergedDoc: mupdfjs.PDFDocument | null = null;

const ctx: Worker = self as any;

ctx.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;

  try {
    switch (type) {
      case "LOAD_DOC": {
        const { arrayBuffer } = payload;
        currentDoc = new mupdfjs.PDFDocument(arrayBuffer);
        const count = currentDoc.countPages();
        
        // Render all pages for initial view
        const pageBlobs: Blob[] = [];
        for (let i = 0; i < count; i++) {
          pageBlobs.push(renderPageToBlob(i, currentDoc, 1.0));
          // Report progress
          ctx.postMessage({ type: "PROGRESS", payload: { current: i + 1, total: count, phase: 'loading' } });
        }
        
        ctx.postMessage({ type: "DOC_LOADED", payload: { count, pageBlobs } });
        break;
      }
      
      case "CROP_DOC": {
        if (!currentDoc) throw new Error("No document loaded");
        const { splitType = 'vertical' } = payload;
        
        currentMergedDoc = generateNewDoc(currentDoc, splitType);
        const count = currentMergedDoc.countPages();
        
        const cropPageBlobs: Blob[] = [];
        for (let i = 0; i < count; i++) {
          cropPageBlobs.push(renderPageToBlob(i, currentMergedDoc, 1.0));
          ctx.postMessage({ type: "PROGRESS", payload: { current: i + 1, total: count, phase: 'cropping' } });
        }
        
        const res = currentMergedDoc.saveToBuffer().asUint8Array();
        const outBuffer = new Uint8Array(res); // Create a copy as WASM heap is not transferable
        ctx.postMessage({ 
          type: "DOC_CROPPED", 
          payload: { 
            count, 
            cropPageBlobs,
            buffer: outBuffer.buffer 
          } 
        }, [outBuffer.buffer]);
        break;
      }
      
      case "SAVE_DOC": {
        if (!currentMergedDoc) throw new Error("No cropped document available");
        const res = currentMergedDoc.saveToBuffer().asUint8Array();
        const outBuffer = new Uint8Array(res); // Create a copy as WASM heap is not transferable
        ctx.postMessage({ type: "DOC_SAVED", payload: { buffer: outBuffer.buffer } }, [outBuffer.buffer]);
        break;
      }
    }
  } catch (error: any) {
    ctx.postMessage({ type: "ERROR", payload: { message: error.message } });
  }
};
