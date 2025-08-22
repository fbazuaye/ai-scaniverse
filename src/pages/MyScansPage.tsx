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
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export
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
    </div>
  );
};

export default MyScansPage;