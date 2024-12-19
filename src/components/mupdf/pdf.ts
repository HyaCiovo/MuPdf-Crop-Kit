import * as mupdfjs from "./dist/mupdf";

export function renderPage(index: number, doc: mupdfjs.PDFDocument) {
  const page = doc.loadPage(index);
  const zoom = window.devicePixelRatio;
  const png = page
    .toPixmap([zoom, 0, 0, zoom, 0, 0], mupdfjs.ColorSpace.DeviceRGB)
    .asPNG();
  return URL.createObjectURL(new Blob([png]));
}


/* 使用内存占用过大，无法使用，待优化 */
export function merge(
  thisPDF: mupdfjs.PDFDocument,
  sourcePDF: mupdfjs.PDFDocument,
  fromPage = 0,
  toPage = -1,
  startAt = -1,
) {
  if (thisPDF.pointer === 0) {
    throw new Error("document closed");
  }
  if (sourcePDF.pointer === 0) {
    throw new Error("source document closed");
  }
  if (thisPDF === sourcePDF) {
    throw new Error("Cannot merge a document with itself");
  }
  const sourcePageCount = sourcePDF.countPages();
  const targetPageCount = thisPDF.countPages();
  // Normalize page numbers
  fromPage = Math.max(0, Math.min(fromPage, sourcePageCount - 1));
  toPage =
    toPage < 0 ? sourcePageCount - 1 : Math.min(toPage, sourcePageCount - 1);
  startAt = startAt < 0 ? targetPageCount : Math.min(startAt, targetPageCount);
  // Ensure fromPage <= toPage
  if (fromPage > toPage) {
    [fromPage, toPage] = [toPage, fromPage];
  }
  for (let i = fromPage; i <= toPage; i++) {
    const sourcePage = sourcePDF.loadPage(i);
    const pageObj = sourcePage.getObject();
    // Create a new page in the target document
    const newPageObj = thisPDF.addPage(
      sourcePage.getBounds(),
      0,
      thisPDF.newDictionary(),
      ""
    );
    // Copy page contents
    const contents = pageObj.get("Contents");
    if (contents) {
      newPageObj.put("Contents", thisPDF.graftObject(contents));
    }
    // Copy page resources
    const resources = pageObj.get("Resources");
    if (resources) {
      newPageObj.put("Resources", thisPDF.graftObject(resources));
    }
    // Insert the new page at the specified position
    thisPDF.insertPage(startAt + (i - fromPage), newPageObj);
  }
}
