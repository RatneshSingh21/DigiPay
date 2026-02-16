import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* =========================================================
   COPY STYLES
========================================================= */
const copyStyles = (sourceDoc, targetDoc) => {
  [...sourceDoc.styleSheets].forEach((sheet) => {
    try {
      if (sheet.href) {
        const link = sourceDoc.createElement("link");
        link.rel = "stylesheet";
        link.href = sheet.href;
        targetDoc.head.appendChild(link);
      } else if (sheet.cssRules) {
        const style = sourceDoc.createElement("style");
        [...sheet.cssRules].forEach((rule) => {
          style.appendChild(sourceDoc.createTextNode(rule.cssText));
        });
        targetDoc.head.appendChild(style);
      }
    } catch {
      // ignore cross-origin styles
    }
  });
};

/* =========================================================
   HELPERS
========================================================= */
const sanitizeColors = (root) => {
  root.querySelectorAll("*").forEach((el) => {
    const s = getComputedStyle(el);
    if (s.color.includes("oklch")) el.style.color = "#000";
    if (s.backgroundColor.includes("oklch")) el.style.backgroundColor = "#fff";
    if (s.borderColor.includes("oklch")) el.style.borderColor = "#000";
  });
};

const blobToBase64 = (blob) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });

const inlineAllImages = async (root) => {
  const imgs = root.querySelectorAll("img");
  await Promise.all(
    [...imgs].map(async (img) => {
      if (!img.src || img.src.startsWith("data:")) return;
      try {
        const res = await fetch(img.src, { mode: "cors" });
        const blob = await res.blob();
        img.src = await blobToBase64(blob);
      } catch {
        console.warn("⚠️ Image inline failed:", img.src);
      }
    })
  );
};

const waitForImages = (root, timeout = 5000) =>
  new Promise((resolve) => {
    const imgs = root.querySelectorAll("img");
    if (!imgs.length) return resolve();
    let loaded = 0;
    const timer = setTimeout(resolve, timeout);
    imgs.forEach((img) => {
      if (img.complete) loaded++;
      else {
        img.onload = img.onerror = () => {
          loaded++;
          if (loaded === imgs.length) {
            clearTimeout(timer);
            resolve();
          }
        };
      }
    });
    if (loaded === imgs.length) clearTimeout(timer), resolve();
  });

/* =========================================================
   MAIN FUNCTION — ADVANCED PIXEL PERFECT PDF
========================================================= */
export const generateLetterPdf = async (ref, options = {}) => {
  console.group("🖨️ PDF Generator (Advanced)");

  try {
    if (!ref.current) {
      console.error("❌ Ref is null");
      return null;
    }

    const { debug = false } = options;
    const previewWidth = ref.current.offsetWidth;

    // SANDBOX IFRAME
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-99999px";
    iframe.style.top = "0";
    iframe.style.width = `${previewWidth}px`;
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            * { box-shadow: none !important; }
            body { margin:0; padding:0; background:#fff; font-family:Arial, Helvetica, sans-serif; }
            img { image-rendering:auto; transform:none !important; }
          </style>
        </head>
        <body></body>
      </html>
    `);
    doc.close();

    copyStyles(document, doc);

    // CLONE REF
    const clone = ref.current.cloneNode(true);
    clone.style.width = `${previewWidth}px`;
    clone.style.maxWidth = `${previewWidth}px`;
    clone.style.transform = "none";
    doc.body.appendChild(clone);

    const componentFooter = clone.querySelector(".print-footer");
    if (componentFooter) componentFooter.style.display = "none";

    sanitizeColors(clone);
    await inlineAllImages(clone);
    await waitForImages(clone);

    const footerEl = clone.querySelector(".print-footer img");
    const FOOTER_HEIGHT = 113;
    const footerImage = footerEl ? footerEl.src : null;

    // HTML → CANVAS
    const canvas = await html2canvas(clone, {
      scale: 1,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: debug,
      windowWidth: previewWidth,
      windowHeight: clone.scrollHeight,
    });

    console.log("📸 Canvas size:", canvas.width, canvas.height);

    // PDF SETUP
    const A4_WIDTH_PX = 794;
    const A4_HEIGHT_PX = 1123;
    const MARGIN = { top: 24, bottom: 40 };
    const printableHeight =
      A4_HEIGHT_PX - MARGIN.top - MARGIN.bottom - FOOTER_HEIGHT;

    const pdf = new jsPDF({
      orientation: "p",
      unit: "px",
      format: [A4_WIDTH_PX, A4_HEIGHT_PX],
      compress: true,
    });

    let position = 0;
    let pageIndex = 0;

    while (position < canvas.height) {
      if (pageIndex > 0) pdf.addPage();

      const topOffset = pageIndex === 0 ? 0 : MARGIN.top;

      // Advanced slice calculation to avoid cutting text under footer
      const remainingHeight = canvas.height - position;
      const sliceHeight = Math.min(
        printableHeight - topOffset,
        remainingHeight
      );

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight + topOffset;

      const ctx = pageCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      ctx.drawImage(
        canvas,
        0,
        position,
        canvas.width,
        sliceHeight,
        0,
        topOffset,
        canvas.width,
        sliceHeight
      );

      const pageImg = pageCanvas.toDataURL("image/jpeg", 1.0);
      pdf.addImage(pageImg, "JPEG", 0, 0, A4_WIDTH_PX, pageCanvas.height);

      // Footer image
      if (footerImage) {
        pdf.addImage(
          footerImage,
          "JPEG",
          0,
          A4_HEIGHT_PX - FOOTER_HEIGHT,
          A4_WIDTH_PX,
          FOOTER_HEIGHT
        );
      }

      // Footer text
      pdf.setFontSize(12);
      pdf.setTextColor(80);
      pdf.text(
        "This is a system generated document",
        A4_WIDTH_PX / 2,
        A4_HEIGHT_PX - FOOTER_HEIGHT + 30,
        { align: "center" }
      );

      // Page number
      const totalPages = Math.ceil(canvas.height / printableHeight);
      pdf.setFontSize(10);
      pdf.setTextColor(120);
      pdf.text(
        `Page ${pageIndex + 1} of ${totalPages}`,
        A4_WIDTH_PX / 2,
        A4_HEIGHT_PX - FOOTER_HEIGHT + 50,
        { align: "center" }
      );

      position += sliceHeight;
      pageIndex++;
    }

    document.body.removeChild(iframe);

    const blob = pdf.output("blob");
    const url = URL.createObjectURL(blob);

    console.log("✅ PDF generated — advanced pixel perfect");
    return { blob, url };
  } catch (err) {
    console.error("❌ PDF Generation Error:", err);
    throw err;
  } finally {
    console.groupEnd();
  }
};
