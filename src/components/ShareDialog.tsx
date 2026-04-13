import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createCombinedPdf } from "@/lib/pdfShare";
import { Loader2, FileImage, FileText, Image as ImageIcon, FileDown } from "lucide-react";

interface ShareDocument {
  file_path: string;
  file_name: string;
  file_type?: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: ShareDocument[];
  title: string;
}

type ShareFormat = "original" | "jpeg" | "png" | "pdf";

async function convertBlobToFormat(blob: Blob, fileName: string, format: "jpeg" | "png"): Promise<File> {
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const ext = format === "jpeg" ? ".jpg" : ".png";

  // If it's not an image, return as-is
  if (!blob.type.startsWith("image/")) {
    return new File([blob], fileName, { type: blob.type });
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      if (format === "jpeg") {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (result) => {
          if (result) {
            const baseName = fileName.replace(/\.[^.]+$/, "");
            resolve(new File([result], `${baseName}${ext}`, { type: mimeType }));
          } else {
            reject(new Error("Canvas conversion failed"));
          }
        },
        mimeType,
        0.92
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(blob);
  });
}

function downloadFile(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const ShareDialog = ({ open, onOpenChange, documents, title }: ShareDialogProps) => {
  const { toast } = useToast();
  const [loadingFormat, setLoadingFormat] = useState<ShareFormat | null>(null);

  const handleShare = async (format: ShareFormat) => {
    if (documents.length === 0) {
      toast({ title: "No documents", description: "Nothing to share.", variant: "destructive" });
      return;
    }

    setLoadingFormat(format);

    try {
      let filesToShare: File[] = [];

      if (format === "pdf") {
        const pdfFile = await createCombinedPdf(documents, title);
        filesToShare = [pdfFile];
      } else {
        // Fetch all files from Supabase
        for (const doc of documents) {
          const { data, error } = await supabase.storage.from("scans").download(doc.file_path);
          if (error || !data) continue;

          if (format === "original") {
            filesToShare.push(new File([data], doc.file_name, { type: doc.file_type || "application/octet-stream" }));
          } else {
            const converted = await convertBlobToFormat(data, doc.file_name, format);
            filesToShare.push(converted);
          }
        }
      }

      if (filesToShare.length === 0) {
        toast({ title: "Error", description: "Could not prepare files for sharing.", variant: "destructive" });
        return;
      }

      // Try native share
      if (navigator.share && navigator.canShare?.({ files: filesToShare })) {
        await navigator.share({ title, files: filesToShare });
        onOpenChange(false);
      } else {
        // Fallback: download files
        filesToShare.forEach(downloadFile);
        toast({ title: "Downloaded", description: "Files saved to your device." });
        onOpenChange(false);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return; // user cancelled share sheet
      console.error("Share error:", err);
      toast({ title: "Share failed", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setLoadingFormat(null);
    }
  };

  const options: { format: ShareFormat; label: string; icon: React.ReactNode; desc: string }[] = [
    { format: "original", label: "Original", icon: <FileText className="w-5 h-5" />, desc: "Share in original format" },
    { format: "jpeg", label: "JPEG", icon: <FileImage className="w-5 h-5" />, desc: "Convert images to JPEG" },
    { format: "png", label: "PNG", icon: <ImageIcon className="w-5 h-5" />, desc: "Convert images to PNG" },
    { format: "pdf", label: "PDF", icon: <FileDown className="w-5 h-5" />, desc: "Combine into a single PDF" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share as...</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {options.map(({ format, label, icon, desc }) => (
            <Button
              key={format}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              disabled={loadingFormat !== null}
              onClick={() => handleShare(format)}
            >
              {loadingFormat === format ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                icon
              )}
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground text-center">{desc}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
