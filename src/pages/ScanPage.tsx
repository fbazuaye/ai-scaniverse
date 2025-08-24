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
  Wand2
} from "lucide-react";

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const scanType = searchParams.get("type") || "document";
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [scanResult, setScanResult] = useState<any>(null);
  const [savedScan, setSavedScan] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<"jpeg" | "pdf">("jpeg");
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

  const saveScan = async () => {
    if (!selectedFile || !title) {
      toast({
        title: "Missing Information",
        description: "Please select a file and enter a title.",
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

      // Convert to selected format if needed
      let fileToUpload = selectedFile;
      let fileExt = selectedFile.name.split('.').pop();
      
      if (selectedFormat === "pdf" && fileExt !== "pdf") {
        // For PDF conversion, we'll keep the original for now
        // In a real app, you'd implement image-to-PDF conversion here
        fileExt = selectedFile.name.split('.').pop();
      }
      
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('scans')
        .upload(fileName, fileToUpload);

      if (uploadError) throw uploadError;

      // Save scan record to database
      const { data: scanData, error: scanError } = await supabase
        .from('scans')
        .insert({
          user_id: user.id,
          title,
          description,
          content_type: scanType,
          file_path: uploadData.path,
        })
        .select()
        .single();

      if (scanError) throw scanError;

      setSavedScan(scanData);
      
      toast({
        title: "Scan Saved Successfully",
        description: `Your ${scanType} has been saved as ${selectedFormat.toUpperCase()}.`,
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
    if (!savedScan) return;

    setIsProcessingAI(true);
    try {
      const { data: aiResult, error: aiError } = await supabase.functions
        .invoke('process-scan', {
          body: {
            filePath: savedScan.file_path,
            contentType: scanType,
            title,
            description
          }
        });

      if (aiError) throw aiError;

      setScanResult(aiResult);
      
      // Update the saved scan with AI results
      const { error: updateError } = await supabase
        .from('scans')
        .update({
          extracted_text: aiResult.extractedText,
          ai_summary: aiResult.aiSummary,
          ai_tags: aiResult.aiTags,
          category: aiResult.category,
          is_sensitive: aiResult.isSensitive,
          metadata: aiResult.metadata
        })
        .eq('id', savedScan.id);

      if (updateError) throw updateError;
      
      toast({
        title: "AI Processing Complete",
        description: "Your scan has been enhanced with AI analysis.",
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
          {selectedFile && !savedScan && (
            <Card>
              <CardHeader>
                <CardTitle>File Preview & Save Options</CardTitle>
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

                  <div className="flex gap-3">
                    <Button
                      onClick={saveScan}
                      disabled={isSaving || !title}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Scan
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
                        setSavedScan(null);
                        setScanResult(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Scan - AI Processing Option */}
          {savedScan && !scanResult && (
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
                    Your {scanType} "{title}" has been saved as {selectedFormat.toUpperCase()}.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Want to unlock more features? Process your scan with AI to get:
                  </p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      OCR text extraction and editing
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      AI summary and smart insights
                    </li>
                    <li className="flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Multi-language translation
                    </li>
                    <li className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Image quality analysis
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
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Process with AI
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

          {/* AI Results */}
          {scanResult && (
            <div className="space-y-4">
              {/* OCR & Text Extraction */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    OCR Text Extraction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanResult.extractedText && (
                    <Textarea
                      value={scanResult.extractedText}
                      readOnly
                      className="min-h-[120px]"
                      placeholder="Extracted text will appear here..."
                    />
                  )}
                  {scanResult.metadata && (
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Language: {scanResult.metadata.language}</div>
                      <div>Words: {scanResult.metadata.estimatedWords || 'N/A'}</div>
                      <div>Confidence: {Math.round((scanResult.metadata.confidence || 0) * 100)}%</div>
                      <div>Regions: {scanResult.metadata.textRegions || 'N/A'}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Summary & Smart Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    AI Summary & Smart Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanResult.aiSummary && (
                    <div className="bg-muted p-3 rounded-lg text-sm">
                      {scanResult.aiSummary}
                    </div>
                  )}

                  {scanResult.smartInsights && (
                    <div className="grid gap-4">
                      {scanResult.smartInsights.keyPoints && scanResult.smartInsights.keyPoints.length > 0 && (
                        <div>
                          <Label className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4" />
                            Key Points
                          </Label>
                          <ul className="text-sm space-y-1">
                            {scanResult.smartInsights.keyPoints.map((point: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scanResult.smartInsights.actionItems && scanResult.smartInsights.actionItems.length > 0 && (
                        <div>
                          <Label className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4" />
                            Action Items
                          </Label>
                          <ul className="text-sm space-y-1">
                            {scanResult.smartInsights.actionItems.map((action: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <Clock className="w-3 h-3 mt-1 text-accent flex-shrink-0" />
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {scanResult.smartInsights.entities && scanResult.smartInsights.entities.length > 0 && (
                        <div>
                          <Label className="mb-2 block">Detected Entities</Label>
                          <div className="flex flex-wrap gap-2">
                            {scanResult.smartInsights.entities.map((entity: string, index: number) => (
                              <span
                                key={index}
                                className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs font-medium"
                              >
                                {entity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Translation */}
              {scanResult.translation && scanResult.translation.originalLanguage !== 'en' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      Translation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Original: {scanResult.translation.originalLanguage} → English
                      <span className="ml-2">({Math.round((scanResult.translation.confidence || 0) * 100)}% confidence)</span>
                    </div>
                    {scanResult.translation.translatedText && (
                      <div className="bg-muted p-3 rounded-lg text-sm">
                        {scanResult.translation.translatedText}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Image Quality & Enhancement */}
              {scanResult.enhancement && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Image Quality & Enhancement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Quality: </span>
                        <span className={`font-medium ${
                          scanResult.enhancement.imageQuality === 'excellent' ? 'text-green-600' :
                          scanResult.enhancement.imageQuality === 'good' ? 'text-blue-600' :
                          scanResult.enhancement.imageQuality === 'fair' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {scanResult.enhancement.imageQuality}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Readability: </span>
                        <span className="font-medium">{scanResult.enhancement.readability}</span>
                      </div>
                    </div>
                    
                    {scanResult.enhancement.suggestions && scanResult.enhancement.suggestions.length > 0 && (
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4" />
                          Enhancement Suggestions
                        </Label>
                        <ul className="text-sm space-y-1">
                          {scanResult.enhancement.suggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 mt-1 text-muted-foreground flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tags & Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {scanResult.category && (
                    <div>
                      <Label className="mb-2 block">Category</Label>
                      <div className="bg-accent/10 text-accent px-3 py-2 rounded-lg text-sm font-medium inline-block">
                        {scanResult.category}
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

                  {scanResult.isSensitive && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">
                        Sensitive data detected - Handle with care
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={goToMyScans} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  View My Scans
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setScanResult(null);
                    setSavedScan(null);
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setTitle("");
                    setDescription("");
                  }}
                >
                  Scan Another
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanPage;