import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, FileImage, FolderOpen, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleScanDocument = () => {
    navigate("/scan?type=document");
  };

  const handleScanImage = () => {
    navigate("/scan?type=image");
  };

  const handleMyScans = () => {
    navigate("/my-scans");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-6 shadow-sm">
        <div className="max-w-md mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AI ScanPro</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Multi-modal AI scanner with intelligent processing
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Main Action Buttons */}
          <div className="space-y-4">
            <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardContent className="p-6">
                <Button
                  onClick={handleScanDocument}
                  className="w-full h-16 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg"
                  size="lg"
                >
                  <Camera className="w-6 h-6 mr-3" />
                  Scan Document
                </Button>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Capture documents with OCR & AI analysis
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-accent/20">
              <CardContent className="p-6">
                <Button
                  onClick={handleScanImage}
                  className="w-full h-16 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg"
                  size="lg"
                >
                  <FileImage className="w-6 h-6 mr-3" />
                  Scan Image
                </Button>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  Process photos with AI vision & enhancement
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-secondary/20">
              <CardContent className="p-6">
                <Button
                  onClick={handleMyScans}
                  variant="secondary"
                  className="w-full h-16 text-lg font-semibold rounded-xl shadow-lg"
                  size="lg"
                >
                  <FolderOpen className="w-6 h-6 mr-3" />
                  My Scans
                </Button>
                <p className="text-sm text-muted-foreground mt-3 text-center">
                  View, search & manage your scanned files
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4 text-center">AI Features</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="font-medium text-foreground">OCR Text</div>
                  <div className="text-muted-foreground mt-1">Extract & edit</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="font-medium text-foreground">AI Summary</div>
                  <div className="text-muted-foreground mt-1">Smart insights</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="font-medium text-foreground">Translation</div>
                  <div className="text-muted-foreground mt-1">Multi-language</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="font-medium text-foreground">Enhancement</div>
                  <div className="text-muted-foreground mt-1">Image quality</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-6 text-center text-xs text-muted-foreground px-4">
        <div className="max-w-md mx-auto border-t border-border pt-6">
          <p>Designed By Frank Bazuaye</p>
          <p className="mt-1">Powered By LiveGig Ltd</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;