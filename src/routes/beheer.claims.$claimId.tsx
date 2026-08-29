import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { EvidenceGrid } from "@/components/dressloop/EvidenceSection";
import { InfoRow, StatusBadge } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/dressloop/primitives";
import { formatDateNL, formatEuro } from "@/lib/config";
import { getDress, getProfile } from "@/lib/mock-data";
import {
  claimStatusLabel,
  depositStatusLabel,
  formatDateTimeNL,
  paymentStatusLabel,
  payoutStatusLabel,
  problemReasonLabel,
  rentalStatusLabel,
  trackingStatusLabel,
} from "@/lib/rental/labels";
import { useIsAdmin, useRentals } from "@/lib/rental/store";
import type { ClaimDecisionType } from "@/lib/rental/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/beheer/claims/$claimId")({
  head: () => ({
    meta: [
      { title: "Claimdossier — DressLoop beheer" },
      { name: "description", content: "Intern dossier met bewijs, tijdlijn en besluitvorming." },
      { property: "og:title", content: "Claimdossier — DressLoop beheer" },
      { property: "og:description", content: "Intern dossier met bewijs en besluitvorming." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClaimDetail,
});

const decisions: { type: ClaimDecisionType; label: string; needsAmount?: boolean }[] = [
  { type: "no_compensation", label: "Geen vergoeding" },
  { type: "partial_compensation", label: "Gedeeltelijke vergoeding", needsAmount: true },
  { type: "compensation_from_deposit", label: "Vergoeding uit de borg", needsAmount: true },
  { type: "deposit_returned", label: "Borg volledig terug naar huurder" },
  { type: "deposit_partially_returned", label: "Borg gedeeltelijk terug", needsAmount: true },
  { type: "deposit_withheld", label: "Borg volledig ingehouden" },
  { type: "payout_approved", label: "Uitbetaling verhuurder goedkeuren" },
  { type: "payout_adjusted", label: "Uitbetaling aanpassen", needsAmount: true },
  { type: "refund_partial", label: "Huur gedeeltelijk terugbetalen", needsAmount: true },
  { type: "refund_full", label: "Huur volledig terugbetalen" },
  { type: "escalate", label: "Escaleren voor handmatige/juridische beoordeling" },
];

function ClaimDetail() {
  const { claimId } = Route.useParams();
  const { isAdmin, enableAdmin } = useIsAdmin();
  const { claims, getRental, addAdminNote, resolveClaim, setClaimStatus } = useRentals();
  const [decision, setDecision] = useState<ClaimDecisionType>("no_compensation");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  if (!isAdmin) {
    return (
      <div className="container-page py-24">
        <h1 className="display text-3xl">Alleen voor het DressLoop-team</h1>
        <Button className="mt-8" onClick={enableAdmin}>
          Demo-toegang inschakelen
        </Button>
      </div>
    );
  }

  const claim = claims.find((c) => c.id === claimId);
  const rental = claim ? getRental(claim.rentalId) : undefined;

  if (!claim || !rental) {
    return (
      <div className="container-page py-24">
        <h1 className="display text-3xl">Dit dossier bestaat niet</h1>
        <Button className="mt-8" asChild>
          <Link to="/beheer/claims">Terug naar Claim Center</Link>
        </Button>
      </div>
    );
  }

  const dress = getDress(rental.dressId);
  const renter = getProfile(rental.renterId);
  const owner = getProfile(rental.ownerId);
  const active = decisions.find((d) => d.type === decision);

  const submitDecision = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    resolveClaim(claim.id, {
      type: decision,
      amount: active?.needsAmount && amount ? Number(amount) : null,
      note: note.trim() || active?.label || "",
    });
    setConfirming(false);
    toast.success("Besluit vastgelegd. Financiële afhandeling gebeurt server-side.");
  };

  return (
    <div className="container-page py-10 lg:py-16">
      <Link to="/beheer/claims" className="text-sm text-muted-foreground hover:text-foreground">
        ← Claim Center
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="display text-3xl sm:text-4xl">{claim.id}</h1>
        <StatusBadge tone="warning">{claimStatusLabel[claim.status]}</StatusBadge>
        {claim.priority === "high" ? <StatusBadge tone="warning">Hoge prioriteit</StatusBadge> : null}
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="min-w-0 space-y-12">
          <section>
            <h2 className="display text-2xl">Melding</h2>
            <dl className="mt-4">
              <InfoRow label="Reden" value={problemReasonLabel[claim.reason]} />
              <InfoRow
                label="Gemeld door"
                value={`${claim.reportedByRole === "owner" ? "Verhuurder" : "Huurder"} · ${formatDateTimeNL(claim.createdAt)}`}
              />
              <InfoRow label="Omschrijving" value={claim.description} />
              <InfoRow
                label="Gevraagd bedrag"
                value={claim.requestedAmount ? formatEuro(claim.requestedAmount) : "Geen"}
              />
            </dl>
            <p className="mt-4 bg-blush px-4 py-3 text-xs text-blush-foreground">
              Normale gebruikssporen gelden niet als schade. Beoordeel alleen op aantoonbaar verschil
              tussen het bewijs van voor en na de huur.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl">Bewijsvergelijking</h2>
            <div className="mt-5 grid gap-8 md:grid-cols-2">
              <div>
                <p className="eyebrow mb-3">Voor de huur</p>
                <EvidenceGrid
                  evidence={rental.evidence}
                  stages={["before_handover", "received_by_renter"]}
                />
              </div>
              <div>
                <p className="eyebrow mb-3">Na de huur</p>
                <EvidenceGrid
                  evidence={rental.evidence}
                  stages={["before_return", "received_by_owner", "claim_evidence"]}
                />
              </div>
            </div>
            <div className="mt-8">
              <p className="eyebrow mb-3">Advertentiefoto's</p>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(dress?.images ?? []).map((src) => (
                  <li key={src}>
                    <img src={src} alt="Advertentiefoto" className="aspect-[3/4] w-full object-cover" />
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="display text-2xl">Reacties</h2>
            {claim.responses.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nog geen reactie van de tegenpartij. Een normale schademelding wordt niet beslist op
                basis van één partij.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm">
                {claim.responses.map((r, i) => (
                  <li key={i} className="border border-border p-4">
                    <p className="font-medium">
                      {r.role === "owner" ? "Verhuurder" : "Huurder"} —{" "}
                      {r.agrees ? "akkoord" : "niet akkoord"}
                    </p>
                    <p className="mt-1 text-muted-foreground">{r.text}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDateTimeNL(r.at)}</p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={() => setClaimStatus(claim.id, "awaiting_other_party")}>
                Reactie tegenpartij opvragen
              </Button>
              <Button variant="outline" size="sm" onClick={() => setClaimStatus(claim.id, "evidence_collection")}>
                Extra bewijs opvragen
              </Button>
              <Button variant="outline" size="sm" onClick={() => setClaimStatus(claim.id, "under_review")}>
                In beoordeling zetten
              </Button>
            </div>
          </section>

          <section>
            <h2 className="display text-2xl">Tijdlijn en audit</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {[...rental.audit].reverse().map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-4 border-b border-border py-2">
                  <span>
                    <span className="text-muted-foreground">{a.actor}</span> · {a.label}{" "}
                    <span className="text-muted-foreground">({a.action})</span>
                  </span>
                  <span className="text-muted-foreground">{formatDateTimeNL(a.at)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-border bg-card p-6">
            <h2 className="display text-2xl">Besluit</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Een besluit wijzigt alleen interne statussen. Terugbetalingen, borgverrekening en
              uitbetalingen worden later uitgevoerd via beveiligde serverfuncties (Stripe Connect).
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {decisions.map((d) => (
                <button
                  key={d.type}
                  type="button"
                  onClick={() => {
                    setDecision(d.type);
                    setConfirming(false);
                  }}
                  className={cn(
                    "rounded-sm border px-3 py-1.5 text-sm transition-colors",
                    decision === d.type
                      ? "border-primary bg-secondary text-secondary-foreground"
                      : "border-border hover:border-border-strong",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {active?.needsAmount ? (
                <Field label="Bedrag" hint={`Beschikbare borg: ${formatEuro(rental.payment.depositAmount)}`}>
                  <Input
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                  />
                </Field>
              ) : null}
              <Field label="Toelichting voor beide partijen">
                <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant={confirming ? "default" : "outline"} onClick={submitDecision}>
                  {confirming ? "Bevestig besluit" : "Besluit vastleggen"}
                </Button>
                {confirming ? (
                  <span className="text-xs text-muted-foreground">
                    Bevestig om het besluit definitief vast te leggen.
                  </span>
                ) : null}
              </div>
            </div>
          </section>

          <section>
            <h2 className="display text-2xl">Interne notities</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {claim.adminNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
            <div className="mt-4 space-y-3">
              <Textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!adminNote.trim()) return;
                  addAdminNote(claim.id, adminNote.trim());
                  setAdminNote("");
                }}
              >
                Notitie toevoegen
              </Button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="border border-border bg-card p-6">
            <h2 className="text-sm font-medium">Dossier</h2>
            <dl className="mt-3">
              <InfoRow label="Huur" value={rental.id} />
              <InfoRow label="Jurk" value={dress?.title ?? "—"} />
              <InfoRow label="Huurder" value={renter.firstName} />
              <InfoRow label="Verhuurder" value={owner.firstName} />
              <InfoRow
                label="Periode"
                value={`${formatDateNL(new Date(rental.startDate))} — ${formatDateNL(new Date(rental.endDate))}`}
              />
              <InfoRow label="Bezorging" value={rental.delivery === "pickup" ? "Ophalen" : "Verzenden"} />
              <InfoRow label="Status huur" value={rentalStatusLabel[rental.status]} />
            </dl>
          </div>

          <div className="border border-border bg-card p-6">
            <h2 className="text-sm font-medium">Financieel</h2>
            <dl className="mt-3">
              <InfoRow label="Huurprijs" value={formatEuro(rental.payment.rentalAmount)} />
              <InfoRow label="Opgegeven waarde" value={formatEuro(rental.dressValue.estimatedValue)} />
              <InfoRow label="Aankoopprijs" value={formatEuro(rental.dressValue.originalPrice)} />
              <InfoRow label="Borg" value={formatEuro(rental.payment.depositAmount)} />
              <InfoRow label="Betaling" value={paymentStatusLabel[rental.payment.status]} />
              <InfoRow label="Borgstatus" value={depositStatusLabel[rental.payment.depositStatus]} />
              <InfoRow label="Uitbetaling" value={payoutStatusLabel[rental.payment.payoutStatus]} />
              {rental.dressValue.flaggedForReview ? (
                <InfoRow label="Let op" value="Waarde gemarkeerd voor controle" />
              ) : null}
            </dl>
          </div>

          <div className="border border-border bg-card p-6">
            <h2 className="text-sm font-medium">Verzending</h2>
            <dl className="mt-3">
              <InfoRow
                label="Heen"
                value={`${rental.shipping.outbound.provider ?? "—"} · ${trackingStatusLabel[rental.shipping.outbound.status]} · ${rental.shipping.outbound.trackingNumber ?? "geen tracking"}`}
              />
              <InfoRow
                label="Retour"
                value={`${rental.shipping.inbound.provider ?? "—"} · ${trackingStatusLabel[rental.shipping.inbound.status]} · ${rental.shipping.inbound.trackingNumber ?? "geen tracking"}`}
              />
              <InfoRow
                label="Laatste scan"
                value={
                  rental.shipping.outbound.lastEventAt
                    ? `${rental.shipping.outbound.lastEvent} · ${formatDateTimeNL(rental.shipping.outbound.lastEventAt)}`
                    : "—"
                }
              />
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
