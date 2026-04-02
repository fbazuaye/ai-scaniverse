import { ShieldCheck, Home, Lock, Database, Camera, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const policySections = [
  {
    title: "Information we collect",
    icon: Database,
    content: [
      "Account details you provide, such as your email address and profile information.",
      "Scanned images, documents, extracted text, summaries, tags, and related metadata you choose to upload or create.",
      "Technical and usage data needed to secure the service, keep it running, and sync uploads across devices.",
      "Offline queue data stored locally on your device so scans created without internet can upload when you reconnect.",
    ],
  },
  {
    title: "How we use your information",
    icon: ShieldCheck,
    content: [
      "To scan, organize, sync, display, export, and let you download your saved documents and images.",
      "To run AI-powered features you request, including OCR, summaries, document analysis, and chat-based Q&A.",
      "To protect accounts, detect abuse, troubleshoot issues, and improve reliability and performance.",
    ],
  },
  {
    title: "Permissions and Android privacy protections",
    icon: Camera,
    content: [
      "Camera and file access are used only when you choose to scan or upload content.",
      "You can deny or revoke device permissions at any time in your browser or Android settings.",
      "The app does not request background location, contacts, or call logs for core scanning features.",
      "Sensitive document access is intended to be limited to the signed-in account that owns the content.",
    ],
  },
  {
    title: "Storage, sharing, and security",
    icon: Lock,
    content: [
      "Your content is stored using our connected infrastructure providers, including Supabase and integrated AI processing services needed to deliver requested features.",
      "We do not sell your scanned documents or personal information.",
      "We use access controls and authenticated storage paths to reduce unauthorized access, but no system can promise absolute security.",
      "You can delete scans from the app, and exported or downloaded files remain under your control after download.",
    ],
  },
  {
    title: "Retention, updates, and contact",
    icon: RefreshCw,
    content: [
      "We keep information for as long as needed to operate the service, comply with legal obligations, and support your account history unless you delete it first.",
      "We may update this Privacy Policy when features, legal requirements, or platform rules change.",
      "For privacy requests or Google Play compliance details, use the official support contact you publish for AI ScanPro / LiveGig Ltd in your app listing.",
    ],
  },
];

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm text-muted-foreground">AI ScanPro</p>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Privacy Policy</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Home</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-6">
          <Card>
            <CardContent className="space-y-4 p-6 sm:p-8">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Effective date: April 2, 2026</p>
                  <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                    This Privacy Policy explains how AI ScanPro collects, uses, stores, and protects information when you use
                    document scanning, image scanning, AI analysis, offline sync, and document chat features across Android,
                    iOS, desktop, and web.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:gap-5">
            {policySections.map(({ title, icon: Icon, content }) => (
              <Card key={title}>
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="rounded-full bg-muted p-2 text-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
                  </div>
                  <ul className="space-y-3 text-sm leading-6 text-muted-foreground sm:text-base">
                    {content.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;