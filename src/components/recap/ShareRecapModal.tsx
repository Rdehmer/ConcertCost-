"use client";

import { ConcertRecapCard } from "@/components/recap/ConcertRecapCard";
import { YearRecapCard } from "@/components/recap/YearRecapCard";
import type { EnrichedConcert } from "@/lib/year-recap";
import type { YearRecapStats } from "@/lib/year-recap";
import {
  copyImageToClipboard,
  downloadDataUrl,
  renderNodeToBlob,
  renderNodeToPng,
  slugifyFilename,
} from "@/lib/share-image";
import { Check, Copy, Download, Share2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type ShareRecapModalProps =
  | {
      kind: "concert";
      concert: EnrichedConcert;
      open: boolean;
      onClose: () => void;
    }
  | {
      kind: "year";
      stats: YearRecapStats;
      open: boolean;
      onClose: () => void;
    };

export function ShareRecapModal(props: ShareRecapModalProps) {
  const { open, onClose, kind } = props;
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"download" | "copy" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setMessage(null);
      setError(null);
      setBusy(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const filename =
    kind === "concert"
      ? `concert-recap-${slugifyFilename(props.concert.concert_name)}.png`
      : `year-recap-${props.stats.year}.png`;

  async function handleDownload() {
    if (!cardRef.current) return;
    setBusy("download");
    setError(null);
    setMessage(null);
    try {
      const dataUrl = await renderNodeToPng(cardRef.current);
      downloadDataUrl(dataUrl, filename);
      setMessage("Image downloaded.");
    } catch {
      setError("Could not create the image. Try again.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCopy() {
    if (!cardRef.current) return;
    setBusy("copy");
    setError(null);
    setMessage(null);
    try {
      const blob = await renderNodeToBlob(cardRef.current);
      if (!blob) {
        setError("Could not create the image.");
        return;
      }
      const ok = await copyImageToClipboard(blob);
      if (ok) {
        setMessage("Copied to clipboard.");
      } else {
        // Fallback: download if clipboard image is unsupported
        const dataUrl = await renderNodeToPng(cardRef.current);
        downloadDataUrl(dataUrl, filename);
        setMessage("Clipboard copy is not supported here, so the image was downloaded instead.");
      }
    } catch {
      setError("Could not copy the image. Try downloading instead.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-lg bg-base-100">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              {kind === "concert" ? "Share concert recap" : "Share year recap"}
            </h3>
            <p className="text-sm opacity-70 mt-1">
              Preview uses your current theme. Download or copy the image to share.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-center py-2 overflow-x-auto">
          {kind === "concert" ? (
            <ConcertRecapCard ref={cardRef} concert={props.concert} />
          ) : (
            <YearRecapCard ref={cardRef} stats={props.stats} />
          )}
        </div>

        {message ? (
          <div className="alert alert-success text-sm py-2 mt-3">
            <Check className="h-4 w-4" />
            <span>{message}</span>
          </div>
        ) : null}
        {error ? (
          <div className="alert alert-error text-sm py-2 mt-3">
            <span>{error}</span>
          </div>
        ) : null}

        <div className="modal-action flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-outline gap-1"
            onClick={handleCopy}
            disabled={busy !== null}
          >
            <Copy className="h-4 w-4" />
            {busy === "copy" ? "Copying..." : "Copy image"}
          </button>
          <button
            type="button"
            className="btn btn-primary gap-1"
            onClick={handleDownload}
            disabled={busy !== null}
          >
            <Download className="h-4 w-4" />
            {busy === "download" ? "Saving..." : "Download"}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  );
}
