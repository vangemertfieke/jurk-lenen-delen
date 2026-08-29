import { Camera, ImageOff } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { evidenceStageLabel, formatDateTimeNL } from "@/lib/rental/labels";
import type { EvidenceStage, RentalEvidence } from "@/lib/rental/types";

const stageOrder: EvidenceStage[] = [
  "before_handover",
  "received_by_renter",
  "before_return",
  "received_by_owner",
  "claim_evidence",
];

export function EvidenceGrid({
  evidence,
  stages,
  emptyText = "Nog geen foto's toegevoegd.",
}: {
  evidence: RentalEvidence[];
  stages?: EvidenceStage[];
  emptyText?: string;
}) {
  const visible = stageOrder
    .filter((s) => !stages || stages.includes(s))
    .map((stage) => ({ stage, items: evidence.filter((e) => e.stage === stage) }))
    .filter((g) => g.items.length > 0);

  if (visible.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ImageOff className="size-4" /> {emptyText}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {visible.map((group) => (
        <div key={group.stage}>
          <p className="eyebrow mb-3">{evidenceStageLabel[group.stage]}</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {group.items.map((item) => (
              <li key={item.id}>
                <img
                  src={item.image}
                  alt={item.caption}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
                <p className="mt-2 text-xs">{item.caption}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTimeNL(item.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Voegt conditiefoto's toe aan een specifieke huur. Foto's worden nooit
 * onderdeel van de galerij van de advertentie — ze horen bij deze huur.
 */
export function EvidenceUploader({
  minPhotos,
  onAdd,
  hint,
}: {
  minPhotos: number;
  onAdd: (images: string[], captions: string[]) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const urls = Array.from(files).map((f) => URL.createObjectURL(f));
    setPending((p) => [...p, ...urls]);
  };

  return (
    <div className="space-y-4">
      <div className="border border-dashed border-border-strong px-5 py-6 text-center">
        <Camera className="mx-auto size-5 text-muted-foreground" aria-hidden />
        <p className="mt-3 text-sm">
          Voeg minimaal {minPhotos} foto's toe: voorkant, achterkant en eventuele details.
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
        >
          Foto's kiezen
        </Button>
      </div>

      {pending.length > 0 ? (
        <>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {pending.map((src, i) => (
              <li key={src}>
                <img src={src} alt={`Nieuwe foto ${i + 1}`} className="aspect-[3/4] w-full object-cover" />
              </li>
            ))}
          </ul>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onAdd(
                pending,
                pending.map((_, i) => `Conditiefoto ${i + 1}`),
              );
              setPending([]);
            }}
          >
            {pending.length} foto{pending.length > 1 ? "'s" : ""} vastleggen
          </Button>
        </>
      ) : null}
    </div>
  );
}
