import * as mupdfjs from "./dist/mupdf";

export function renderPage(index: number, doc: mupdfjs.PDFDocument) {
  const page = doc.loadPage(index);
  const zoom = window.devicePixelRatio;
  const png = page
    .toPixmap([zoom, 0, 0, zoom, 0, 0], mupdfjs.ColorSpace.DeviceRGB)
    .asPNG();
  return URL.createObjectURL(new Blob([png]));
}

export function merge(
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

export function generateNewDoc(PDF: mupdfjs.PDFDocument) {
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

