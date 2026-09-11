import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  addListingPhoto,
  photosFor,
  removeListingPhoto,
  useListingPhotos,
} from "@/lib/listing-photos";

const MAX_PHOTOS = 12;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Fotoalbum van één jurk. Verhuurders kunnen hier meerdere foto's uploaden;
 * ze verschijnen direct in de fotogalerij van de jurk.
 */
export function PhotoAlbum({ dressId }: { dressId: string }) {
  const map = useListingPhotos();
  const photos = photosFor(map, dressId);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) {
      toast.error(`Je album is vol. Maximaal ${MAX_PHOTOS} foto's per jurk.`);
      return;
    }
    let added = 0;
    for (const file of files.slice(0, room)) {
      if (!TYPES.includes(file.type)) {
        toast.error(`${file.name} is geen JPG-, PNG- of WEBP-bestand.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        toast.error(`${file.name} is groter dan 5 MB.`);
        continue;
      }
      added += 1;
      const reader = new FileReader();
      reader.onload = () => addListingPhoto(dressId, String(reader.result));
      reader.readAsDataURL(file);
    }
    if (added > 0) {
      toast.success(added === 1 ? "Foto toegevoegd aan je album." : `${added} foto's toegevoegd.`);
    }
    if (files.length > room) {
      toast.message(`Alleen de eerste ${room} foto's zijn toegevoegd.`);
    }
  };

  return (
    <div className="rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">Fotoalbum van deze jurk</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {photos.length} van {MAX_PHOTOS} eigen foto&apos;s. Ze staan meteen in de galerij
            bovenaan.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          Foto&apos;s uploaden
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={onChange}
        />
      </div>

      {photos.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Nog geen eigen foto&apos;s. Voeg foto&apos;s toe van de voorkant, achterkant en details —
          dat helpt huurders kiezen.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {photos.map((src, i) => (
            <div key={i} className="relative">
              <img
                src={src}
                alt={`Albumfoto ${i + 1}`}
                className="aspect-[3/4] w-full rounded-2xl object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  removeListingPhoto(dressId, i);
                  toast.success("Foto verwijderd uit het album.");
                }}
                aria-label={`Verwijder albumfoto ${i + 1}`}
                className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border border-border bg-background text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
