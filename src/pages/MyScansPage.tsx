import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Search, 
  Filter,
  FileText, 
  Image,
  Calendar,
  Tag,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  X,
  Sparkles,
  Languages,
  ImageIcon,
  Globe,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  TrendingUp,
  Clock,
  Copy
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Scan {
  id: string;
  title: string;
  description: string;
  content_type: string;
  file_path: string;
  extracted_text: string;
  ai_summary: string;
  ai_tags: string[];
  category: string;
  is_sensitive: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

const MyScansPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to view your scans.",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('scans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScans(data || []);
    } catch (error: any) {
      console.error('Error fetching scans:', error);
      toast({
        title: "Error",
        description: "Failed to load your scans.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteScan = async (scanId: string) => {
    try {
      const { error } = await supabase
        .from('scans')
        .delete()
        .eq('id', scanId);

      if (error) throw error;

      setScans(scans.filter(scan => scan.id !== scanId));
      toast({
        title: "Scan Deleted",
        description: "The scan has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete scan.",
        variant: "destructive",
      });
    }
  };

  const downloadScan = async (scan: Scan) => {
    setIsDownloading(true);
    try {
      const { data, error } = await supabase.storage
        .from('scans')
        .download(scan.file_path);

      if (error) throw error;

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = scan.title || 'scan-file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: "Your scan is being downloaded.",
      });
    } catch (error: any) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download scan.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const viewScanDetails = (scan: Scan) => {
    setSelectedScan(scan);
    setIsViewDetailsOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text has been copied to your clipboard.",
    });
  };

  const filteredScans = scans.filter(scan => {
    const matchesSearch = 
      scan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.extracted_text?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      scan.content_type === selectedCategory ||
      scan.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(scans.map(scan => scan.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your scans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">My Scans</h1>
            <p className="text-sm text-muted-foreground">
              {scans.length} scan{scans.length !== 1 ? 's' : ''} total
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search scans..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedCategory("all")}>
                      All Categories
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedCategory("document")}>
                      Documents
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedCategory("image")}>
                      Images
                    </DropdownMenuItem>
                    {categories.map(category => (
                      <DropdownMenuItem 
                        key={category} 
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>

          {/* Scans Grid */}
          {filteredScans.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {scans.length === 0 ? "No scans yet" : "No matching scans"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {scans.length === 0 
                    ? "Start scanning documents and images to see them here."
                    : "Try adjusting your search or filter criteria."
                  }
                </p>
                {scans.length === 0 && (
                  <Button onClick={() => navigate("/")}>
                    Start Scanning
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredScans.map((scan) => (
                <Card key={scan.id} className="hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {scan.content_type === "document" ? (
                          <FileText className="w-5 h-5 text-primary" />
                        ) : (
                          <Image className="w-5 h-5 text-accent" />
                        )}
                        <CardTitle className="text-sm font-semibold line-clamp-1">
                          {scan.title}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-1">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => viewScanDetails(scan)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => downloadScan(scan)}
                            disabled={isDownloading}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {isDownloading ? "Downloading..." : "Export"}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteScan(scan.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {scan.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {scan.description}
                      </p>
                    )}

                    {scan.ai_summary && (
                      <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/50 p-2 rounded">
                        {scan.ai_summary}
                      </p>
                    )}

                    {scan.ai_tags && scan.ai_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {scan.ai_tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {scan.ai_tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{scan.ai_tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.created_at).toLocaleDateString()}
                      {scan.category && (
                        <>
                          <span>•</span>
                          <Tag className="w-3 h-3" />
                          {scan.category}
                        </>
                      )}
                    </div>

                    {scan.is_sensitive && (
                      <Badge variant="destructive" className="text-xs">
                        Sensitive Content
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedScan?.content_type === "document" ? (
                <FileText className="w-5 h-5" />
              ) : (
                <Image className="w-5 h-5" />
              )}
              {selectedScan?.title}
            </DialogTitle>
          </DialogHeader>

          {selectedScan && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Title</Label>
                    <p className="text-sm font-medium">{selectedScan.title}</p>
                  </div>
                  {selectedScan.description && (
                    <div>
                      <Label>Description</Label>
                      <p className="text-sm text-muted-foreground">{selectedScan.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Content Type</Label>
                      <p className="text-sm font-medium capitalize">{selectedScan.content_type}</p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <p className="text-sm font-medium">{selectedScan.category || "Uncategorized"}</p>
                    </div>
                    <div>
                      <Label>Created</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedScan.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label>Last Updated</Label>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedScan.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedScan.is_sensitive && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">
                        Sensitive data detected - Handle with care
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Extracted Text */}
              {selectedScan.extracted_text && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Extracted Text
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(selectedScan.extracted_text)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={selectedScan.extracted_text}
                      readOnly
                      className="min-h-[200px] resize-none"
                    />
                  </CardContent>
                </Card>
              )}

              {/* AI Summary */}
              {selectedScan.ai_summary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        AI Summary
                      </span>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(selectedScan.ai_summary)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg text-sm">
                      {selectedScan.ai_summary}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Tags */}
              {selectedScan.ai_tags && selectedScan.ai_tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      AI Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedScan.ai_tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {selectedScan.metadata && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Analysis Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {selectedScan.metadata.language && (
                        <div>
                          <Label>Language</Label>
                          <p className="font-medium">{selectedScan.metadata.language}</p>
                        </div>
                      )}
                      {selectedScan.metadata.confidence && (
                        <div>
                          <Label>OCR Confidence</Label>
                          <p className="font-medium">{Math.round(selectedScan.metadata.confidence * 100)}%</p>
                        </div>
                      )}
                      {selectedScan.metadata.estimatedWords && (
                        <div>
                          <Label>Word Count</Label>
                          <p className="font-medium">{selectedScan.metadata.estimatedWords}</p>
                        </div>
                      )}
                      {selectedScan.metadata.textRegions && (
                        <div>
                          <Label>Text Regions</Label>
                          <p className="font-medium">{selectedScan.metadata.textRegions}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => downloadScan(selectedScan)}
                  disabled={isDownloading}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "Downloading..." : "Download Original"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsViewDetailsOpen(false)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyScansPage;