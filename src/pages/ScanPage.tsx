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
  Download,
  Zap,
  Globe,
  ImageIcon,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Save,
  Wand2,
  Home,
  X,
  Plus
} from "lucide-react";
import Footer from "@/components/Footer";

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
}

interface DocumentResult {
  id: string;
  extractedText?: string;
  aiSummary?: string;
  aiTags?: string[];
  category?: string;
  isSensitive?: boolean;
  translation?: {
    originalLanguage: string;
    translatedText?: string;
    confidence: number;
  };
  enhancement?: {
    imageQuality: string;
    suggestions: string[];
    readability: string;
  };
  smartInsights?: {
    keyPoints: string[];
    actionItems: string[];
    entities: string[];
    documentStructure: string;
  };
  metadata?: {
    language: string;
    confidence: number;
    documentType: string;
    processingTime: string;
    textRegions: number;
    estimatedWords: number;
  };
}

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scanType = searchParams.get("type") || "document";
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [scanResults, setScanResults] = useState<DocumentResult[]>([]);
  const [savedScan, setSavedScan] = useState<any>(null);
  const [savedDocuments, setSavedDocuments] = useState<any[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<"jpeg" | "pdf">("jpeg");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newFiles: FileWithPreview[] = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substr(2, 9)
      }));
      
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Set title from first file if not already set
      if (!title && files[0]) {
        setTitle(files[0].name.split('.')[0]);
      }
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== id);
    });
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

  const saveScan = async () => {
    if (selectedFiles.length === 0 || !title) {
      toast({
        title: "Missing Information",
        description: "Please select at least one file and enter a title.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
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

      // Create the main scan record first
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          title,
          description,
          content_type: scanType,
          file_path: '', // Will be updated with first document's path
        })
        .select()
        .single();

      if (scanError) throw scanError;

      // Upload files and create document records
      const uploadedDocuments = [];
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const { file } = selectedFiles[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
        
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('scans')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Create document record
        const { data: docData, error: docError } = await supabase
          .from('scan_documents')
          .insert({
            scan_id: scanData.id,
            file_path: uploadData.path,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
          })
          .select()
          .single();

        if (docError) throw docError;
        uploadedDocuments.push(docData);
      }

      // Update main scan with first document's path
      if (uploadedDocuments.length > 0) {
        await supabase
          .from('scans')
          .update({ file_path: uploadedDocuments[0].file_path })
          .eq('id', scanData.id);
      }

      setSavedScan(scanData);
      setSavedDocuments(uploadedDocuments);
      
      toast({
        title: "Scan Saved Successfully",
        description: `Your ${selectedFiles.length} document(s) have been saved.`,
      });

    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save scan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const processWithAI = async () => {
    if (!savedScan || savedDocuments.length === 0) return;

    setIsProcessingAI(true);
    try {
      const results: DocumentResult[] = [];
      
      // Process each document with AI
      for (const doc of savedDocuments) {
        const { data: aiResult, error: aiError } = await supabase.functions
          .invoke('process-scan', {
            body: {
              filePath: doc.file_path,
              contentType: scanType,
              title: doc.file_name,
              description
            }
          });

        if (aiError) {
          console.error(`AI processing failed for ${doc.file_name}:`, aiError);
          continue;
        }

        // Update document record with AI results
        await supabase
          .from('scan_documents')
          .update({
            extracted_text: aiResult.extractedText,
            ai_summary: aiResult.aiSummary,
            ai_tags: aiResult.aiTags,
            category: aiResult.category,
            is_sensitive: aiResult.isSensitive,
            metadata: aiResult.metadata
          })
          .eq('id', doc.id);

        results.push({
          id: doc.id,
          ...aiResult
        });
      }

      setScanResults(results);
      
      toast({
        title: "AI Processing Complete",
        description: `${results.length} document(s) processed with AI analysis.`,
      });

    } catch (error: any) {
      console.error('AI Processing error:', error);
      toast({
        title: "AI Processing Failed",
        description: error.message || "Failed to process with AI.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAI(false);
    }
  };

  const goToMyScans = () => {
    navigate("/my-scans");
  };

  const resetScan = () => {
    selectedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    setSelectedFiles([]);
    setScanResults([]);
    setSavedScan(null);
    setSavedDocuments([]);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              Scan Multiple {scanType === "document" ? "Documents" : "Images"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              AI-powered scanning and analysis for multiple files
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* File Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Select Files ({selectedFiles.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={handleCameraCapture}
                  className="h-20 sm:h-24 lg:h-28 flex flex-col gap-2"
                  variant="outline"
                >
                  <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="text-sm sm:text-base">Camera</span>
                </Button>
                <Button
                  onClick={handleFileUpload}
                  className="h-20 sm:h-24 lg:h-28 flex flex-col gap-2"
                  variant="outline"
                >
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="text-sm sm:text-base">Upload Multiple</span>
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={scanType === "document" ? "image/*,application/pdf" : "image/*"}
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* File Previews */}
          {selectedFiles.length > 0 && !savedScan && (
            <Card>
              <CardHeader>
                <CardTitle>File Previews & Save Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* File Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedFiles.map((fileWithPreview) => (
                    <div key={fileWithPreview.id} className="relative">
                      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                        <img 
                          src={fileWithPreview.preview} 
                          alt={fileWithPreview.file.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 w-6 h-6 p-0"
                        onClick={() => removeFile(fileWithPreview.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {fileWithPreview.file.name}
                      </p>
                    </div>
                  ))}
                </div>
                
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

                  <div>
                    <Label htmlFor="format">Save Format</Label>
                    <select
                      id="format"
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value as "jpeg" | "pdf")}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="jpeg">JPEG Image</option>
                      <option value="pdf">PDF Document</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={saveScan}
                      disabled={isSaving || !title || selectedFiles.length === 0}
                      className="flex-1 order-2 sm:order-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving {selectedFiles.length} files...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save {selectedFiles.length} File(s)
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="order-1 sm:order-2"
                      onClick={resetScan}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Scan - AI Processing Option */}
          {savedScan && scanResults.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Scan Saved Successfully
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    Your {savedDocuments.length} document(s) "{title}" have been saved.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Want to unlock more features? Process your documents with AI to get:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      OCR text extraction and editing for each document
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI summary and smart insights per document
                    </li>
                    <li className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Multi-language translation
                    </li>
                    <li className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image quality analysis for each file
                    </li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={processWithAI}
                    disabled={isProcessingAI}
                    className="flex-1"
                  >
                    {isProcessingAI ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing {savedDocuments.length} documents...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Process {savedDocuments.length} Documents with AI
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={goToMyScans}
                  >
                    View My Scans
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Results for Multiple Documents */}
          {scanResults.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">AI Analysis Results</h2>
                <span className="text-sm text-muted-foreground">
                  {scanResults.length} document(s) processed
                </span>
              </div>

              {scanResults.map((result, index) => (
                <Card key={result.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Document {index + 1} Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* OCR Text */}
                    {result.extractedText && (
                      <div>
                        <Label className="mb-2 block">Extracted Text</Label>
                        <Textarea
                          value={result.extractedText}
                          readOnly
                          className="min-h-[100px]"
                        />
                      </div>
                    )}

                    {/* AI Summary */}
                    {result.aiSummary && (
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4" />
                          AI Summary
                        </Label>
                        <div className="bg-muted p-3 rounded-lg text-sm">
                          {result.aiSummary}
                        </div>
                      </div>
                    )}

                    {/* Key Points */}
                    {result.smartInsights?.keyPoints && result.smartInsights.keyPoints.length > 0 && (
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4" />
                          Key Points
                        </Label>
                        <ul className="text-sm space-y-1">
                          {result.smartInsights.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tags and Category */}
                    <div className="flex flex-wrap gap-2">
                      {result.category && (
                        <span className="bg-accent/10 text-accent px-3 py-1 rounded-lg text-sm font-medium">
                          {result.category}
                        </span>
                      )}
                      {result.aiTags?.map((tag: string, idx: number) => (
                        <span
                          key={idx}
                          className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Sensitive Data Warning */}
                    {result.isSensitive && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-600 font-medium">
                          Sensitive data detected - Handle with care
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={goToMyScans} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  View My Scans
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetScan}
                >
                  Scan More Documents
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ScanPage;