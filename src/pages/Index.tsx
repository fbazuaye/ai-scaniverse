import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, FileImage, FolderOpen, Sparkles, User, LogOut, ScanLine, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Footer from "@/components/Footer";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

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

  const actions = [
    {
      icon: Camera,
      title: "Scan Document",
      desc: "Capture with OCR & AI analysis",
      onClick: () => navigate("/scan?type=document"),
      gradient: "from-primary to-primary/80",
    },
    {
      icon: FileImage,
      title: "Scan Image",
      desc: "AI vision & enhancement",
      onClick: () => navigate("/scan?type=image"),
      gradient: "from-accent to-accent/80",
    },
    {
      icon: FolderOpen,
      title: "My Scans",
      desc: "View, search & manage files",
      onClick: () => navigate("/my-scans"),
      gradient: "from-secondary-foreground/80 to-secondary-foreground/60",
    },
  ];

  const capabilities = [
    { icon: ScanLine, label: "OCR Text Extraction" },
    { icon: Sparkles, label: "AI Summarisation" },
    { icon: Shield, label: "Secure Cloud Storage" },
    { icon: FileText, label: "PDF Export & Share" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">AI ScanPro</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
              <User className="h-3.5 w-3.5" />
              <span className="max-w-32 truncate">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-full">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-1.5">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary/8 via-primary/3 to-transparent py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            What would you like to scan?
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto">
            Capture, analyse, and organise documents with intelligent AI processing
          </p>
        </div>
      </section>

      {/* Main Actions */}
      <main className="flex-1 px-4 sm:px-6 -mt-4 sm:-mt-6 pb-10">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-3">
            {actions.map((a) => (
              <Card
                key={a.title}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-border/60 hover:border-primary/30 overflow-hidden"
                onClick={a.onClick}
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${a.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <a.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Capabilities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {capabilities.map((c) => (
              <div
                key={c.label}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/40"
              >
                <c.icon className="w-4.5 h-4.5 text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
