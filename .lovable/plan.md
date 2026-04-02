

## Update Privacy Policy with Latest Android Privacy Protections

### Problem
Google is flagging the app because the privacy policy lacks comprehensive coverage of modern Android privacy requirements — specifically around **data safety declarations**, **data deletion rights**, **children's privacy (COPPA)**, **third-party SDK disclosures**, and **explicit permission justifications** that Google Play now mandates.

### What changes

**File: `src/pages/PrivacyPolicyPage.tsx`**

Expand the privacy policy with these additional sections required by Google Play's latest policies:

1. **Data Safety Declaration** — A new section explicitly listing each data type collected, whether it's shared with third parties, and whether it's encrypted in transit. This mirrors what Google Play's Data Safety form requires:
   - Email address (collected, not shared)
   - Photos/documents (collected for scanning, not shared)
   - Device identifiers (collected for analytics, not shared)
   - Usage data (collected for service improvement)

2. **Data Deletion Rights** — A dedicated section explaining users can request deletion of their account and all associated data, with instructions on how to do so. Google Play now requires apps to offer a data deletion option.

3. **Children's Privacy (COPPA/GDPR-K)** — Statement that the app is not directed at children under 13, and that parental consent is required for minors.

4. **Third-Party Services Disclosure** — Explicit listing of third-party services used (Supabase for storage/auth, AI services for document analysis) and links to their privacy policies.

5. **Enhanced Permissions Justification** — Expand the existing "Permissions" section to explicitly state:
   - Camera: used solely for document scanning, not background capture
   - Storage/files: used only to import/export documents the user selects
   - Internet: used for cloud sync, AI analysis, and authentication
   - No access to: location, contacts, phone, SMS, calendar, microphone

6. **Data Encryption & Security Standards** — Statement that data is encrypted in transit (TLS/HTTPS) and at rest where supported by infrastructure providers.

7. **User Rights (GDPR/CCPA)** — Section covering right to access, correct, delete, and port personal data. Contact information for exercising these rights.

8. **Data Retention Periods** — More specific retention details (e.g., account data retained until deletion, scans retained until user deletes them).

9. **Policy Contact & Effective Date** — Update effective date, add explicit contact email for privacy inquiries (required by Google Play).

### Technical details

Single file change to `src/pages/PrivacyPolicyPage.tsx` — adding approximately 6 new policy section objects to the `policySections` array and updating the header text with a more recent effective date and contact details.

