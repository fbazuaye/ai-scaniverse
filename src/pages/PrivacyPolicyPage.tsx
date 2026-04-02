import { ShieldCheck, Home, Lock, Database, Camera, RefreshCw, Trash2, Baby, Globe, KeyRound, Scale, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const policySections = [
  {
    title: "Data Safety Declaration",
    icon: ShieldCheck,
    content: [
      "Email address — collected for authentication and account management. Not shared with third parties. Encrypted in transit via TLS/HTTPS.",
      "Photos and documents — collected when you scan or upload content for processing. Stored securely and not shared with third parties.",
      "Device identifiers — collected for session management, crash reporting, and service improvement. Not shared with third parties.",
      "Usage data — collected to improve app performance and reliability. Aggregated and anonymized where possible. Not sold or shared.",
      "All data transmitted between your device and our servers is encrypted using TLS 1.2+ (HTTPS).",
    ],
  },
  {
    title: "Information We Collect",
    icon: Database,
    content: [
      "Account details you provide, such as your email address and profile information.",
      "Scanned images, documents, extracted text, summaries, tags, and related metadata you choose to upload or create.",
      "Technical and usage data needed to secure the service, keep it running, and sync uploads across devices.",
      "Offline queue data stored locally on your device so scans created without internet can upload when you reconnect.",
    ],
  },
  {
    title: "How We Use Your Information",
    icon: Database,
    content: [
      "To scan, organize, sync, display, export, and let you download your saved documents and images.",
      "To run AI-powered features you request, including OCR, summaries, document analysis, and chat-based Q&A.",
      "To protect accounts, detect abuse, troubleshoot issues, and improve reliability and performance.",
    ],
  },
  {
    title: "Permissions & Android Privacy Protections",
    icon: Camera,
    content: [
      "Camera — used solely for document and image scanning when you explicitly initiate a scan. No background camera access or capture occurs.",
      "Storage/Files — used only to import documents you select and to export/download files you request. No bulk file access.",
      "Internet — used for cloud sync, AI-powered analysis, authentication, and service updates.",
      "This app does NOT access: location, contacts, phone/call logs, SMS, calendar, microphone, or any sensors not listed above.",
      "You can deny or revoke any device permission at any time via your browser or Android/iOS system settings.",
    ],
  },
  {
    title: "Data Deletion Rights",
    icon: Trash2,
    content: [
      "You have the right to request complete deletion of your account and all associated data at any time.",
      "To delete your data: sign into the app, go to your account settings, and select 'Delete Account'. All scans, documents, profile data, and metadata will be permanently removed.",
      "Alternatively, you may email privacy@livegig.co.uk with your account email and the subject line 'Data Deletion Request'. We will process your request within 30 days.",
      "Once deleted, your data cannot be recovered. Exported or downloaded files on your device remain under your control.",
    ],
  },
  {
    title: "Children's Privacy (COPPA / GDPR-K)",
    icon: Baby,
    content: [
      "AI ScanPro is not directed at children under the age of 13 (or 16 in the EU/EEA).",
      "We do not knowingly collect personal information from children under these age thresholds.",
      "If a parent or guardian becomes aware that their child has provided us with personal data, please contact us at privacy@livegig.co.uk and we will promptly delete such information.",
      "If we discover that we have collected personal information from a child without parental consent, we will delete it immediately.",
    ],
  },
  {
    title: "Third-Party Services Disclosure",
    icon: Globe,
    content: [
      "Supabase — used for user authentication, cloud database storage, and file/document storage. Privacy policy: https://supabase.com/privacy",
      "AI/ML processing services — used to provide OCR, document summarization, tagging, and chat-based document analysis. Document content is sent for processing and not retained by the AI provider beyond the request.",
      "No third-party advertising SDKs or ad trackers are used in this app.",
      "We do not sell, trade, or rent your personal information to any third party.",
    ],
  },
  {
    title: "Data Encryption & Security Standards",
    icon: KeyRound,
    content: [
      "All data in transit is encrypted using TLS 1.2+ (HTTPS) between your device and our servers.",
      "Data at rest is encrypted where supported by our infrastructure providers (Supabase/cloud storage).",
      "Authentication tokens are securely managed and never stored in plain text on the client.",
      "We implement access controls and authenticated storage paths to minimize unauthorized access. However, no system can guarantee absolute security.",
    ],
  },
  {
    title: "Your Rights (GDPR / CCPA)",
    icon: Scale,
    content: [
      "Right to Access — you may request a copy of all personal data we hold about you.",
      "Right to Rectification — you may request correction of inaccurate personal data.",
      "Right to Deletion — you may request deletion of your personal data (see Data Deletion Rights above).",
      "Right to Data Portability — you may request your data in a machine-readable format.",
      "Right to Opt-Out — California residents may opt out of any sale of personal information (we do not sell data).",
      "To exercise any of these rights, contact us at privacy@livegig.co.uk.",
    ],
  },
  {
    title: "Storage, Sharing & Security",
    icon: Lock,
    content: [
      "Your content is stored using our connected infrastructure providers, including Supabase and integrated AI processing services needed to deliver requested features.",
      "We do not sell your scanned documents or personal information.",
      "We use access controls and authenticated storage paths to reduce unauthorized access, but no system can promise absolute security.",
      "You can delete scans from the app, and exported or downloaded files remain under your control after download.",
    ],
  },
  {
    title: "Data Retention Periods",
    icon: Clock,
    content: [
      "Account data (email, profile) — retained until you delete your account.",
      "Scans and documents — retained until you manually delete them or delete your account.",
      "Offline queue data — stored locally and removed after successful sync to the cloud.",
      "Usage and analytics data — retained in aggregated/anonymized form for up to 24 months for service improvement.",
      "Upon account deletion, all associated personal data is permanently removed within 30 days.",
    ],
  },
  {
    title: "Policy Updates & Contact",
    icon: RefreshCw,
    content: [
      "We may update this Privacy Policy when features, legal requirements, or platform rules change. Material changes will be communicated via the app or email.",
      "This policy is effective as of April 2, 2026.",
      "For privacy inquiries, data requests, or Google Play compliance questions, contact: privacy@livegig.co.uk",
      "Data Controller: LiveGig Ltd",
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