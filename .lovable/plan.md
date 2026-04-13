

## Fix Share: Direct sharing without download + format options

### Problem
1. Files are downloaded from Supabase before `navigator.share()` is called, which causes the browser's user gesture to expire — so the share sheet never appears.
2. Users want to choose share format (original, JPEG, PNG, PDF) before sharing.

### Solution
Create a **Share Options Dialog** that appears when the user clicks "Share." This dialog presents format buttons (Original, JPEG, PNG, PDF). When the user taps a format button, that tap is the fresh user gesture — files are fetched and `navigator.share()` is called within it. A loading spinner shows during the brief fetch.

### Files to change

**New file: `src/components/ShareDialog.tsx`**
- A reusable dialog/sheet component with 4 share format options:
  - **Original** — shares files in their original format
  - **JPEG** — converts images to JPEG before sharing
  - **PNG** — converts images to PNG before sharing  
  - **PDF** — combines all into a single PDF (existing logic)
- Each button handles its own click gesture: fetches files from Supabase, converts format if needed (using canvas for JPEG/PNG conversion), then calls `navigator.share({ files })`.
- Shows a loading spinner per-button while fetching/converting.
- Falls back to download if share API unavailable.

**`src/pages/ScanPage.tsx`**
- Replace `shareScan()` and `shareAsPdf()` with opening the new `ShareDialog`.
- Pass documents and title as props.

**`src/pages/MyScansPage.tsx`**
- Same change: replace `shareScan()` and `shareAsPdf()` with the `ShareDialog`.

**`src/lib/pdfShare.ts`**
- No changes needed — PDF generation logic stays as-is, called from ShareDialog.

### How format conversion works
- **JPEG/PNG**: Fetch blob from Supabase → create `Image` from blob URL → draw on `<canvas>` → `canvas.toBlob('image/jpeg'|'image/png')` → wrap in `File` → `navigator.share({ files })`.
- **Original**: Fetch blob → wrap in `File` → share directly.
- **PDF**: Use existing `createCombinedPdf()` function.

### User experience
1. Tap "Share" → dialog opens with 4 format buttons
2. Tap desired format (e.g., "JPEG") → brief loading spinner → native share sheet appears with WhatsApp, Email, etc.
3. No files download to device unless share API is unavailable (fallback)

