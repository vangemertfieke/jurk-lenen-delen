import { useState } from "react";
import { Share2, Link2, Facebook, Instagram, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  description?: string;
  url: string;
  image?: string;
  className?: string;
}

export function ShareButton({ title, description, url, image, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  const shareText = `Borro: ${title}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);
  const encodedDesc = encodeURIComponent(description ?? "");

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: description,
          url,
        });
        setOpen(false);
        return;
      } catch {
        // User cancelled or share failed; fall through to dialog.
      }
    }
    toast.info("Delen via je browser werkt hier niet. Kies een app hieronder.");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link gekopieerd", {
        description: "Plak ‘m in je Instagram-story, bio of bericht.",
      });
      setOpen(false);
    } catch {
      toast.error("Kopiëren mislukt", {
        description: "Probeer het handmatig via de adresbalk.",
      });
    }
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}%20-%20${encodedDesc}`,
      "facebook-share",
      "width=600,height=400",
    );
    setOpen(false);
  };

  const shareToInstagram = () => {
    // Instagram heeft geen web-share-URL; we kopiëren de link zodat de gebruiker
    // die in de Instagram-app kan plakken.
    void copyLink();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label="Deel deze jurk"
          className={cn(
            "grid size-10 shrink-0 place-items-center border border-border transition-colors hover:bg-muted",
            className,
          )}
        >
          <Share2 className="size-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Deel deze jurk</DialogTitle>
          <DialogDescription>
            Stuur ‘m door naar vriendinnen of plaats ‘m op social media.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-3">
          {navigator.share ? (
            <Button variant="outline" onClick={handleNativeShare} className="justify-start gap-3 rounded-full">
              <Share2 className="size-4" />
              Delen via je telefoon
            </Button>
          ) : null}

          <Button
            variant="outline"
            onClick={shareToFacebook}
            className="justify-start gap-3 rounded-full"
          >
            <Facebook className="size-4 text-[#1877F2]" />
            Deel op Facebook
          </Button>

          <Button
            variant="outline"
            onClick={shareToInstagram}
            className="justify-start gap-3 rounded-full"
          >
            <Instagram className="size-4 text-[#E4405F]" />
            Kopieer link voor Instagram
          </Button>

          <Button variant="outline" onClick={copyLink} className="justify-start gap-3 rounded-full">
            <Link2 className="size-4" />
            Link kopiëren
          </Button>
        </div>

        {image ? (
          <div className="mt-2 overflow-hidden rounded-2xl border border-border">
            <img src={image} alt={title} className="aspect-[3/4] w-full object-cover" />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
