import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface DocFile {
  file_path: string;
  file_name: string;
  file_type?: string;
}

/**
 * Downloads files from Supabase storage, combines images into a single PDF,
 * and returns it as a File object ready for sharing/downloading.
 */
export async function createCombinedPdf(
  documents: DocFile[],
  pdfTitle: string
): Promise<File> {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  let isFirstPage = true;

  for (const doc of documents) {
    const { data, error } = await supabase.storage
      .from("scans")
      .download(doc.file_path);

    if (error || !data) {
      console.error(`Failed to download ${doc.file_name}:`, error);
      continue;
    }

    const fileType = doc.file_type || "";

    if (fileType.startsWith("image/")) {
      // Convert blob to base64 data URL
      const base64 = await blobToBase64(data);

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Get image dimensions to fit within page
      const imgProps = getImageDimensions(base64, pageWidth - margin * 2, pageHeight - margin * 2);

      // Center the image on the page
      const xOffset = margin + (pageWidth - margin * 2 - imgProps.width) / 2;
      const yOffset = margin + (pageHeight - margin * 2 - imgProps.height) / 2;

      const format = getImageFormat(fileType);
      pdf.addImage(base64, format, xOffset, yOffset, imgProps.width, imgProps.height);

      // Add filename as footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(doc.file_name, pageWidth / 2, pageHeight - 5, { align: "center" });
    } else if (fileType === "application/pdf") {
      // For PDF files, we can't easily merge them with jsPDF client-side,
      // so add a reference page
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      pdf.setFontSize(14);
      pdf.setTextColor(60);
      pdf.text(`PDF Document: ${doc.file_name}`, margin, margin + 20);
      pdf.setFontSize(10);
      pdf.setTextColor(120);
      pdf.text("This PDF document is included as a separate file.", margin, margin + 30);
    }
  }

  // If no pages were added, add a title page
  if (isFirstPage) {
    pdf.setFontSize(18);
    pdf.setTextColor(60);
    pdf.text(pdfTitle, pageWidth / 2, pageHeight / 2, { align: "center" });
  }

  const pdfBlob = pdf.output("blob");
  const safeTitle = pdfTitle.replace(/[^a-zA-Z0-9\s-_]/g, "").trim() || "scan";
  return new File([pdfBlob], `${safeTitle}.pdf`, { type: "application/pdf" });
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getImageFormat(mimeType: string): string {
  if (mimeType.includes("png")) return "PNG";
  if (mimeType.includes("webp")) return "WEBP";
  return "JPEG";
}

interface ImgDimensions {
  width: number;
  height: number;
}

function getImageDimensions(
  _base64: string,
  maxWidth: number,
  maxHeight: number
): ImgDimensions {
  // Default to A4-ish proportions; jsPDF will scale. Use max area.
  // We don't have sync access to image dimensions in jsPDF, so fill the page.
  return { width: maxWidth, height: maxHeight };
}

/**
 * Share a combined PDF via Web Share API, or download as fallback.
 */
export async function shareCombinedPdf(
  documents: DocFile[],
  title: string,
  toastFn: (opts: { title: string; description: string; variant?: "destructive" }) => void
) {
  try {
    toastFn({ title: "Preparing PDF...", description: "Combining documents into a single PDF." });

    const pdfFile = await createCombinedPdf(documents, title);

    if (navigator.share && navigator.canShare?.({ files: [pdfFile] })) {
      await navigator.share({
        title: title,
        text: `Shared scan: ${title}`,
        files: [pdfFile],
      });
    } else {
      // Fallback: download the PDF
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfFile.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toastFn({ title: "PDF Downloaded", description: `${pdfFile.name} has been downloaded.` });
    }
  } catch (err: any) {
    if (err.name !== "AbortError") {
      toastFn({ title: "Share failed", description: err.message || "Failed to create PDF.", variant: "destructive" });
    }
  }
}
