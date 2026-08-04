import { toBlob, toPng } from "html-to-image";

export async function renderNodeToPng(node: HTMLElement): Promise<string> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  // Capture with the live theme colors from the page
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });
}

export async function renderNodeToBlob(node: HTMLElement): Promise<Blob | null> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  return toBlob(node, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: undefined,
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

export async function copyImageToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    return false;
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type || "image/png"]: blob }),
    ]);
    return true;
  } catch {
    return false;
  }
}

export function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
