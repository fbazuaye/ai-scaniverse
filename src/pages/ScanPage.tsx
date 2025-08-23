import { useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Camera, 
  Upload, 
  ArrowLeft, 
  Loader2, 
  FileText, 
  Sparkles,
  Languages,
  Eye,
  Download
} from "lucide-react";

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scanType = searchParams.get("type") || "document";
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setTitle(file.name.split('.')[0]);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const processScan = async () => {
    if (!selectedFile || !title) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a title.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Upload file to Supabase storage
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scans')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Process with AI
      const { data: aiResult, error: aiError } = await supabase.functions
        .invoke('process-scan', {
          body: {
            filePath: uploadData.path,
            contentType: scanType,
            title,
            description
          }
        });

      if (aiError) throw aiError;

      setScanResult(aiResult);
      
      toast({
        title: "Scan Processed Successfully",
        description: "Your file has been processed with AI analysis.",
      });

    } catch (error: any) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process scan.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveScan = async () => {
    if (!scanResult) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          title,
          description,
          content_type: scanType,
          file_path: scanResult.filePath,
          extracted_text: scanResult.extractedText,
          ai_summary: scanResult.aiSummary,
          ai_tags: scanResult.aiTags,
          category: scanResult.category,
          is_sensitive: scanResult.isSensitive,
          metadata: scanResult.metadata
        });

      if (error) throw error;

      toast({
        title: "Scan Saved",
        description: "Your scan has been saved successfully.",
      });

      navigate("/my-scans");
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save scan.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Scan {scanType === "document" ? "Document" : "Image"}
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered scanning and analysis
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* File Selection */}
          {!selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Select File
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={handleCameraCapture}
                    className="h-24 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Camera className="w-6 h-6" />
                    <span>Camera</span>
                  </Button>
                  <Button
                    onClick={handleFileUpload}
                    className="h-24 flex flex-col gap-2"
                    variant="outline"
                  >
                    <Upload className="w-6 h-6" />
                    <span>Upload</span>
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={scanType === "document" ? "image/*,application/pdf" : "image/*"}
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>
          )}

          {/* File Preview & Info */}
          {selectedFile && !scanResult && (
            <Card>
              <CardHeader>
                <CardTitle>File Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {previewUrl && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter scan title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add optional description"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={processScan}
                      disabled={isProcessing || !title}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Process with AI
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl("");
                        setTitle("");
                        setDescription("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Results */}
          {scanResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanResult.extractedText && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" />
                        Extracted Text
                      </Label>
                      <Textarea
                        value={scanResult.extractedText}
                        readOnly
                        className="min-h-[120px]"
                      />
                    </div>
                  )}

                  {scanResult.aiSummary && (
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4" />
                        AI Summary
                      </Label>
                      <div className="bg-muted p-3 rounded-lg text-sm">
                        {scanResult.aiSummary}
                      </div>
                    </div>
                  )}

                  {scanResult.aiTags && scanResult.aiTags.length > 0 && (
                    <div>
                      <Label className="mb-2 block">AI Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {scanResult.aiTags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {scanResult.category && (
                    <div>
                      <Label className="mb-2 block">Category</Label>
                      <div className="bg-accent/10 text-accent px-3 py-2 rounded-lg text-sm font-medium inline-block">
                        {scanResult.category}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button onClick={handleSaveScan} className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Save Scan
                    </Button>
                    <Button variant="outline" onClick={() => setScanResult(null)}>
                      Process Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanPage;