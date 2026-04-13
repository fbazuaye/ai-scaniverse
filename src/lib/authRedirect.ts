const PREVIEW_HOST_MARKERS = ["id-preview--", "lovableproject.com"];
const PUBLISHED_APP_ORIGIN = "https://ai-scaniverse.lovable.app";

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

export const getAuthRedirectUrl = (path = "/") => {
  const normalizedPath = normalizePath(path);

  if (typeof window === "undefined") {
    return `${PUBLISHED_APP_ORIGIN}${normalizedPath}`;
  }

  const isPreviewHost = PREVIEW_HOST_MARKERS.some((marker) =>
    window.location.hostname.includes(marker),
  );

  const baseOrigin = isPreviewHost ? PUBLISHED_APP_ORIGIN : window.location.origin;
  return `${baseOrigin}${normalizedPath}`;
};