import { useEffect, useState } from "react";
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

type PreparedShareState = {
  error?: string;
  files: File[];
  status: "idle" | "loading" | "ready" | "error";
};

interface DownloadedDocument extends ShareDocument {
  blob: Blob;
}

const createInitialPreparedShares = (): Record<ShareFormat, PreparedShareState> => ({
  original: { files: [], status: "idle" },
  jpeg: { files: [], status: "idle" },
  png: { files: [], status: "idle" },
  pdf: { files: [], status: "idle" },
});

async function downloadDocument(document: ShareDocument): Promise<DownloadedDocument | null> {
  const { data, error } = await supabase.storage.from("scans").download(document.file_path);

  if (error || !data) {
    return null;
  }

  return {
    ...document,
    blob: data,
  };
}

function createFileFromBlob(blob: Blob, fileName: string, fallbackType?: string) {
  return new File([blob], fileName, {
    type: blob.type || fallbackType || "application/octet-stream",
  });
}

async function prepareOriginalFiles(downloadedDocuments: DownloadedDocument[]) {
  return downloadedDocuments.map((document) =>
    createFileFromBlob(document.blob, document.file_name, document.file_type)
  );
}

async function prepareConvertedFiles(
  downloadedDocuments: DownloadedDocument[],
  format: "jpeg" | "png"
) {
  return Promise.all(
    downloadedDocuments.map((document) =>
      convertBlobToFormat(document.blob, document.file_name, format)
    )
  );
}

async function convertBlobToFormat(blob: Blob, fileName: string, format: "jpeg" | "png"): Promise<File> {
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const ext = format === "jpeg" ? ".jpg" : ".png";

  // If it's not an image, return as-is
  if (!blob.type.startsWith("image/")) {
    return new File([blob], fileName, { type: blob.type });
  }

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(blob);

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
            URL.revokeObjectURL(objectUrl);
            resolve(new File([result], `${baseName}${ext}`, { type: mimeType }));
          } else {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Canvas conversion failed"));
          }
        },
        mimeType,
        0.92
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };
    img.src = objectUrl;
  });
}

const ShareDialog = ({ open, onOpenChange, documents, title }: ShareDialogProps) => {
  const { toast } = useToast();
  const [loadingFormat, setLoadingFormat] = useState<ShareFormat | null>(null);
  const [preparedShares, setPreparedShares] = useState<Record<ShareFormat, PreparedShareState>>(
    createInitialPreparedShares
  );

  useEffect(() => {
    if (!open) {
      setPreparedShares(createInitialPreparedShares());
      return;
    }

    let cancelled = false;

    const updatePreparedShare = (format: ShareFormat, nextState: PreparedShareState) => {
      if (cancelled) return;

      setPreparedShares((current) => ({
        ...current,
        [format]: nextState,
      }));
    };

    const prepareShares = async () => {
      setPreparedShares({
        original: { files: [], status: "loading" },
        jpeg: { files: [], status: "loading" },
        png: { files: [], status: "loading" },
        pdf: { files: [], status: "loading" },
      });

      const downloadedDocuments = (await Promise.all(documents.map(downloadDocument))).filter(
        (document): document is DownloadedDocument => Boolean(document)
      );

      if (!downloadedDocuments.length) {
        const errorState = {
          error: "We couldn't prepare these files for sharing.",
          files: [],
          status: "error" as const,
        };

        setPreparedShares({
          original: errorState,
          jpeg: errorState,
          png: errorState,
          pdf: errorState,
        });
        return;
      }

      const sharePreparationTasks: Array<Promise<void>> = [
        prepareOriginalFiles(downloadedDocuments)
          .then((files) => {
            updatePreparedShare("original", {
              files,
              status: files.length ? "ready" : "error",
              error: files.length ? undefined : "No files are ready to share in the original format.",
            });
          })
          .catch(() => {
            updatePreparedShare("original", {
              error: "Original files could not be prepared.",
              files: [],
              status: "error",
            });
          }),
        prepareConvertedFiles(downloadedDocuments, "jpeg")
          .then((files) => {
            updatePreparedShare("jpeg", {
              files,
              status: files.length ? "ready" : "error",
              error: files.length ? undefined : "JPEG files could not be prepared.",
            });
          })
          .catch(() => {
            updatePreparedShare("jpeg", {
              error: "JPEG files could not be prepared.",
              files: [],
              status: "error",
            });
          }),
        prepareConvertedFiles(downloadedDocuments, "png")
          .then((files) => {
            updatePreparedShare("png", {
              files,
              status: files.length ? "ready" : "error",
              error: files.length ? undefined : "PNG files could not be prepared.",
            });
          })
          .catch(() => {
            updatePreparedShare("png", {
              error: "PNG files could not be prepared.",
              files: [],
              status: "error",
            });
          }),
        createCombinedPdf(documents, title)
          .then((file) => {
            updatePreparedShare("pdf", {
              files: [file],
              status: "ready",
            });
          })
          .catch(() => {
            updatePreparedShare("pdf", {
              error: "The PDF could not be prepared.",
              files: [],
              status: "error",
            });
          }),
      ];

      await Promise.allSettled(sharePreparationTasks);
    };

    void prepareShares();

    return () => {
      cancelled = true;
    };
  }, [documents, open, title]);

  const handleShare = async (format: ShareFormat) => {
    if (documents.length === 0) {
      toast({ title: "No documents", description: "Nothing to share.", variant: "destructive" });
      return;
    }

    const preparedShare = preparedShares[format];

    if (preparedShare.status === "loading" || preparedShare.status === "idle") {
      toast({ title: "Preparing files", description: "Please wait a moment, then tap the format again." });
      return;
    }

    if (preparedShare.status === "error" || preparedShare.files.length === 0) {
      toast({
        title: "Share unavailable",
        description: preparedShare.error || "These files couldn't be prepared for direct sharing.",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.share) {
      toast({
        title: "Direct share not supported",
        description: "Open the published app in a supported mobile browser to share directly to WhatsApp, email, and more.",
        variant: "destructive",
      });
      return;
    }

    const canShareFiles = navigator.canShare?.({ files: preparedShare.files });

    if (canShareFiles === false) {
      toast({
        title: "This format can't be shared here",
        description:
          preparedShare.files.length > 1
            ? "Try PDF if you want to share multiple documents as one file."
            : "Try another format or use a supported mobile browser.",
        variant: "destructive",
      });
      return;
    }

    setLoadingFormat(format);

    try {
      await navigator.share({
        title,
        text: title,
        files: preparedShare.files,
      });
      onOpenChange(false);
    } catch (err: any) {
      if (err.name === "AbortError") return;

      console.error("Share error:", err);
      toast({
        title: "Couldn't open the share sheet",
        description: "Please try again from the published app in your browser so you can share to WhatsApp, email, and other apps.",
        variant: "destructive",
      });
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
            (() => {
              const preparedShare = preparedShares[format];
              const isPreparing = preparedShare.status === "loading" || preparedShare.status === "idle";
              const hasError = preparedShare.status === "error";

              return (
            <Button
              key={format}
              variant="outline"
              className="h-auto flex-col gap-2 py-4"
              disabled={loadingFormat !== null || isPreparing}
              onClick={() => handleShare(format)}
            >
              {loadingFormat === format || isPreparing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                icon
              )}
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground text-center">
                {isPreparing ? "Preparing..." : hasError ? preparedShare.error : desc}
              </span>
            </Button>
              );
            })()
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
