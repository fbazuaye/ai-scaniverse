import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, FileImage, FolderOpen, Sparkles, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleScanDocument = () => {
    navigate("/scan?type=document");
  };

  const handleScanImage = () => {
    navigate("/scan?type=image");
  };

  const handleMyScans = () => {
    navigate("/my-scans");
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">AI ScanPro</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="hidden sm:flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="max-w-24 sm:max-w-32 truncate">{user?.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
            </div>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground text-center">
            Multi-modal AI scanner with intelligent processing
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-3 lg:gap-12">
            
            {/* Main Action Buttons - Left Column */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                  <CardContent className="p-4 sm:p-6">
                    <Button
                      onClick={handleScanDocument}
                      className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-lg"
                      size="lg"
                    >
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      Scan Document
                    </Button>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 text-center">
                      Capture documents with OCR & AI analysis
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-accent/20">
                  <CardContent className="p-4 sm:p-6">
                    <Button
                      onClick={handleScanImage}
                      className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl shadow-lg"
                      size="lg"
                    >
                      <FileImage className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      Scan Image
                    </Button>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 text-center">
                      Process photos with AI vision & enhancement
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="hover:shadow-lg transition-all duration-200 border-2 hover:border-secondary/20">
                <CardContent className="p-4 sm:p-6">
                  <Button
                    onClick={handleMyScans}
                    variant="secondary"
                    className="w-full h-14 sm:h-16 text-base sm:text-lg font-semibold rounded-xl shadow-lg"
                    size="lg"
                  >
                    <FolderOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                    My Scans
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 text-center">
                    View, search & manage your scanned files
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Features Preview - Right Column */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="font-semibold text-foreground mb-4 text-center text-base sm:text-lg">AI Features</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 text-xs sm:text-sm">
                    <div className="bg-muted/50 rounded-lg p-3 text-center lg:text-left">
                      <div className="font-medium text-foreground">OCR Text</div>
                      <div className="text-muted-foreground mt-1">Extract & edit</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center lg:text-left">
                      <div className="font-medium text-foreground">AI Summary</div>
                      <div className="text-muted-foreground mt-1">Smart insights</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center lg:text-left">
                      <div className="font-medium text-foreground">Translation</div>
                      <div className="text-muted-foreground mt-1">Multi-language</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center lg:text-left">
                      <div className="font-medium text-foreground">Enhancement</div>
                      <div className="text-muted-foreground mt-1">Image quality</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;