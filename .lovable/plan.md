

## Fix: "Share failed — Permission denied" Error

### Problem

The Web Share API requires **transient user activation** (i.e., it must be called within a short window after a user click). Currently, the share functions download files from Supabase storage and/or generate a PDF *before* calling `navigator.share()`. This async work takes too long and the browser's transient activation expires, causing a "Permission denied" (`NotAllowedError`) error.

Additionally, within the Lovable preview iframe, the `web-share` permission policy may block `navigator.share()` entirely.

### Plan

**1. Restructure share flow in `pdfShare.ts`**
- Wrap the `navigator.share()` call in a try/catch that specifically catches `NotAllowedError` / "Permission denied".
- When native sharing fails for any reason (permission, unsupported, etc.), **automatically fall back to downloading the file** instead of showing an error toast.
- Always attempt `navigator.share()` first, but treat failure as non-fatal.

**2. Restructure share flow in `ScanPage.tsx` and `MyScansPage.tsx`**
- Same pattern: wrap `navigator.share()` in a try/catch.
- On `NotAllowedError` or any share failure (except `AbortError`), fall back to:
  - **Download the files** directly (using blob URL + anchor click), OR
  - **Copy share text to clipboard** with a success toast.
- Show a helpful toast like "Downloaded instead — native sharing unavailable" rather than a scary "Permission denied" error.

**3. Add `canShare` pre-check with graceful degradation**
- Before attempting `navigator.share()`, check `navigator.share && navigator.canShare?.({...})`.
- If `canShare` returns false or throws, skip directly to the download/clipboard fallback.

### Files to modify

| File | Change |
|------|--------|
| `src/lib/pdfShare.ts` | Catch `NotAllowedError` in `shareCombinedPdf`, fall back to download |
| `src/pages/ScanPage.tsx` | Catch share errors in `shareScan`, fall back to clipboard + download |
| `src/pages/MyScansPage.tsx` | Same fallback pattern in `shareScan` |

### Technical detail

The key change in each share function:

```typescript
try {
  await navigator.share(shareData);
} catch (err: any) {
  if (err.name === 'AbortError') return; // user cancelled
  // Any other error (NotAllowedError, etc.) → fallback
  // Download file + copy text to clipboard
}
```

For `shareCombinedPdf`, since the PDF is already generated before the share attempt, the fallback simply triggers a download of that same PDF blob.

