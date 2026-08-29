import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, MapPin, Package, Truck } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { EvidenceGrid, EvidenceUploader } from "@/components/dressloop/EvidenceSection";
import { InfoRow, StatusBadge } from "@/components/dressloop/primitives";
import { ProblemReportDialog } from "@/components/dressloop/ProblemReportDialog";
import { RentalMoneyCard } from "@/components/dressloop/RentalMoneyCard";
import { RentalTimeline } from "@/components/dressloop/RentalTimeline";
import { Button } from "@/components/ui/button";
import { formatDateNL, formatEuro } from "@/lib/config";
import { getDress, getProfile } from "@/lib/mock-data";
import { PROTECTION_CONFIG } from "@/lib/rental/config";
import { buildTimeline, getNextStep, isAddressReleased, isReturnOverdue } from "@/lib/rental/engine";
import {
  claimStatusLabel,
  formatDateTimeNL,
  problemReasonLabel,
  rentalStatusLabel,
  rentalStatusTone,
  trackingStatusLabel,
} from "@/lib/rental/labels";
import { useRentals, type RentalAction } from "@/lib/rental/store";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/huur/$id")({
  head: () => ({
    meta: [
      { title: "Jouw huur — DressLoop" },
      { name: "description", content: "Volg je huur: status, overdracht, retour en borg." },
      { property: "og:title", content: "Jouw huur — DressLoop" },
      { property: "og:description", content: "Status, overdracht, retour en borg van je huur." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RentalDetail,
});

function RentalDetail() {
  const { id } = Route.useParams();
  const { user, hydrated } = useApp();
  const navigate = useNavigate();
  const { getRental, getClaim, roleFor, advance, addEvidence, respondToClaim } = useRentals();

  useEffect(() => {
    if (hydrated && !user) void navigate({ to: "/inloggen" });
  }, [hydrated, user, navigate]);

  const rental = getRental(id);
  if (!rental) {
    return (
      <div className="container-page py-24">
        <h1 className="display text-3xl">Deze huur bestaat niet</h1>
        <Button className="mt-8" asChild>
          <Link to="/account/huuritems">Naar mijn huuritems</Link>
        </Button>
      </div>
    );
  }

  const role = roleFor(rental) === "owner" ? "owner" : "renter";
  const dress = getDress(rental.dressId);
  const other = getProfile(role === "renter" ? rental.ownerId : rental.renterId);
  const next = getNextStep(rental, role);
  const claim = getClaim(rental.claimId);
  const overdue = isReturnOverdue(rental);
  const pickup = rental.delivery === "pickup";

  const act = (action: RentalAction, message: string) => {
    advance(rental.id, action, role);
    toast.success(message);
  };

  const ownerPrepStage = ["paid", "confirmed", "preparing"].includes(rental.status);
  const renterReceiveStage = ["ready_for_pickup", "shipped_to_renter"].includes(rental.status);
  const renterReturnStage = ["rental_active", "return_due", "return_overdue", "received_by_renter"].includes(
    rental.status,
  );
  const ownerInspectStage = ["returned_to_owner", "inspection_period"].includes(rental.status);

  return (
    <div className="container-page py-10 lg:py-16">
      <Link
        to={role === "renter" ? "/account/huuritems" : "/account/verhuur"}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Terug naar {role === "renter" ? "mijn huuritems" : "mijn verhuur"}
      </Link>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="min-w-0 space-y-12">
          {/* status */}
          <header>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge tone={rentalStatusTone[rental.status]}>
                {rentalStatusLabel[rental.status]}
              </StatusBadge>
              <StatusBadge tone="neutral">
                {pickup ? "Ophalen" : "Verzenden"}
              </StatusBadge>
            </div>
            <h1 className="display mt-4 text-3xl sm:text-4xl">
              {dress?.title ?? "Jouw huur"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {role === "renter" ? "Van" : "Verhuurd aan"} {other.firstName} ·{" "}
              {formatDateNL(new Date(rental.startDate))} — {formatDateNL(new Date(rental.endDate))}
            </p>

            <div className="mt-6 border border-border bg-card p-6">
              <p className="eyebrow">Wat gebeurt er nu?</p>
              <p className="mt-3 text-sm">{next.next}</p>
              {overdue ? (
                <p className="mt-3 flex items-start gap-2 text-sm text-blush-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  De retourdatum is verstreken. Neem contact op en regel de retour zo snel mogelijk.
                </p>
              ) : null}
            </div>
          </header>

          {/* acties per fase */}
          {ownerPrepStage ? (
            <section className="space-y-5">
              <h2 className="display text-2xl">
                {pickup ? "Maak de jurk klaar voor ophalen" : "Maak je jurk klaar voor verzending"}
              </h2>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Maak conditiefoto's: voorkant, achterkant en bestaande details.</li>
                {pickup ? (
                  <li>2. Spreek een ophaalmoment af via berichten.</li>
                ) : (
                  <>
                    <li>2. Verpak de jurk beschermd.</li>
                    <li>3. Gebruik het verzendlabel.</li>
                    <li>4. Geef het pakket af bij een afgiftepunt.</li>
                  </>
                )}
              </ol>
              <EvidenceUploader
                minPhotos={PROTECTION_CONFIG.minEvidencePhotos}
                hint="Deze foto's horen bij deze huur en komen niet in je advertentie."
                onAdd={(images, captions) =>
                  addEvidence(rental.id, "before_handover", "owner", captions, images)
                }
              />
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() =>
                    pickup
                      ? act("mark_ready_for_pickup", "De huurder ziet nu dat de jurk klaarstaat.")
                      : act("mark_shipped", "Verzending geregistreerd.")
                  }
                >
                  {pickup ? "Jurk klaar voor overdracht" : "Pakket afgegeven"}
                </Button>
              </div>
            </section>
          ) : null}

          {renterReceiveStage && role === "renter" ? (
            <section className="space-y-5">
              <h2 className="display text-2xl">Controleer de jurk bij ontvangst</h2>
              <p className="text-sm text-muted-foreground">
                Vergelijk met de foto's van de verhuurder en voeg zelf een paar foto's toe. Zo staat
                de staat bij ontvangst vast.
              </p>
              <EvidenceGrid evidence={rental.evidence} stages={["before_handover"]} />
              <EvidenceUploader
                minPhotos={PROTECTION_CONFIG.minEvidencePhotos}
                onAdd={(images, captions) =>
                  addEvidence(rental.id, "received_by_renter", "renter", captions, images)
                }
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => act("confirm_receipt", "Ontvangst bevestigd. Veel plezier!")}>
                  Ja, jurk ontvangen
                </Button>
                <ProblemReportDialog rentalId={rental.id} role="renter" />
              </div>
            </section>
          ) : null}

          {renterReturnStage && role === "renter" ? (
            <section className="space-y-5">
              <h2 className="display text-2xl">Retourneren</h2>
              <p className="text-sm text-muted-foreground">
                Retourneer uiterlijk {formatDateNL(new Date(rental.returnDueDate))}. Maak eerst
                verse conditiefoto's.
              </p>
              <EvidenceUploader
                minPhotos={PROTECTION_CONFIG.minEvidencePhotos}
                onAdd={(images, captions) =>
                  addEvidence(rental.id, "before_return", "renter", captions, images)
                }
              />
              <Button onClick={() => act("start_return", "Retour gestart.")}>Start retour</Button>
            </section>
          ) : null}

          {rental.status === "return_started" && role === "renter" ? (
            <section className="space-y-5">
              <h2 className="display text-2xl">{pickup ? "Breng de jurk terug" : "Verstuur je retour"}</h2>
              <p className="text-sm text-muted-foreground">
                {pickup
                  ? "Spreek een moment af en bevestig hieronder wanneer je de jurk hebt teruggegeven."
                  : "Gebruik het retourlabel en geef het pakket af bij een afgiftepunt."}
              </p>
              <Button
                onClick={() =>
                  act(
                    "confirm_return_dropoff",
                    pickup ? "Teruggave geregistreerd." : "Retour onderweg.",
                  )
                }
              >
                {pickup ? "Jurk teruggebracht" : "Pakket afgegeven"}
              </Button>
            </section>
          ) : null}

          {rental.status === "shipped_to_owner" && role === "owner" ? (
            <section className="space-y-5">
              <h2 className="display text-2xl">Retour onderweg</h2>
              <p className="text-sm text-muted-foreground">
                Bevestig zodra het pakket bij je bezorgd is. Daarna start de controleperiode van{" "}
                {PROTECTION_CONFIG.inspectionPeriodHours} uur.
              </p>
              <Button onClick={() => act("confirm_return_received", "Retour ontvangen.")}>
                Retour ontvangen
              </Button>
            </section>
          ) : null}

          {ownerInspectStage && role === "owner" ? (
            <section className="space-y-5">
              <h2 className="display text-2xl">Controleer de jurk</h2>
              <p className="text-sm text-muted-foreground">
                Controleer binnen {PROTECTION_CONFIG.inspectionPeriodHours} uur
                {rental.inspectionDeadline
                  ? ` (tot ${formatDateTimeNL(rental.inspectionDeadline)})`
                  : ""}
                . Normale gebruikssporen tellen niet als schade.
              </p>
              <EvidenceGrid evidence={rental.evidence} />
              <EvidenceUploader
                minPhotos={2}
                onAdd={(images, captions) =>
                  addEvidence(rental.id, "received_by_owner", "owner", captions, images)
                }
              />
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => act("complete_inspection", "Huur afgerond. Bedankt!")}>
                  Alles is in orde
                </Button>
                <ProblemReportDialog rentalId={rental.id} role="owner" />
              </div>
            </section>
          ) : null}

          {role === "owner" && rental.status === "return_overdue" ? (
            <section className="space-y-4 border border-border bg-card p-6">
              <h2 className="display text-2xl">Retour is te laat</h2>
              <p className="text-sm text-muted-foreground">
                We herinneren de huurder. Na een coulancetermijn van{" "}
                {PROTECTION_CONFIG.returnGraceHours} uur kun je melden dat de jurk niet is
                geretourneerd. DressLoop onderzoekt dan wat er is gebeurd.
              </p>
              <ProblemReportDialog
                rentalId={rental.id}
                role="owner"
                defaultReason="not_returned"
                trigger={<Button variant="outline">Jurk niet geretourneerd melden</Button>}
              />
            </section>
          ) : null}

          {/* claim */}
          {claim ? (
            <section className="space-y-5 border border-border bg-card p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="display text-2xl">We bekijken het probleem</h2>
                <StatusBadge tone="warning">{claimStatusLabel[claim.status]}</StatusBadge>
              </div>
              <dl>
                <InfoRow label="Melding" value={problemReasonLabel[claim.reason]} />
                <InfoRow label="Toelichting" value={claim.description} />
                {claim.requestedAmount ? (
                  <InfoRow
                    label="Gevraagde vergoeding"
                    value={`${formatEuro(claim.requestedAmount)} — een verzoek, nog geen besluit`}
                  />
                ) : null}
                <InfoRow label="Gemeld op" value={formatDateTimeNL(claim.createdAt)} />
              </dl>

              {claim.decision ? (
                <p className="bg-blush px-4 py-3 text-sm text-blush-foreground">
                  Besluit: {claim.decision.note}
                </p>
              ) : claim.reportedByRole !== role && claim.responses.length === 0 ? (
                <div className="space-y-3">
                  <p className="text-sm">
                    Er is een probleem gemeld. Laat ons weten of je het hiermee eens bent.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        respondToClaim(claim.id, role, true, "Akkoord met de melding.");
                        toast.success("Bedankt. We handelen het verder af.");
                      }}
                    >
                      Akkoord
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        respondToClaim(
                          claim.id,
                          role,
                          false,
                          "Niet eens met de melding, ik lever aanvullend bewijs aan.",
                        );
                        toast.success("We vragen je om extra uitleg en bewijs.");
                      }}
                    >
                      Ik ben het hier niet mee eens
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  DressLoop onderzoekt wat er is gebeurd. Je borg en de uitbetaling staan zolang
                  stil.
                </p>
              )}

              {claim.responses.length > 0 ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {claim.responses.map((r, i) => (
                    <li key={i}>
                      {r.role === "owner" ? "Verhuurder" : "Huurder"} · {formatDateTimeNL(r.at)} —{" "}
                      {r.agrees ? "akkoord" : "niet akkoord"}: {r.text}
                    </li>
                  ))}
                </ul>
              ) : null}

              <EvidenceGrid
                evidence={rental.evidence}
                stages={["claim_evidence"]}
                emptyText="Nog geen bewijs bij deze melding."
              />
            </section>
          ) : null}

          {/* bewijs */}
          <section className="space-y-5">
            <h2 className="display text-2xl">Conditiefoto's bij deze huur</h2>
            <p className="text-sm text-muted-foreground">
              Deze foto's horen alleen bij deze huur en zijn zichtbaar voor jou, de andere partij en
              DressLoop.
            </p>
            <EvidenceGrid evidence={rental.evidence} />
          </section>

          {/* audit */}
          <section className="space-y-4">
            <h2 className="display text-2xl">Geschiedenis</h2>
            <ul className="space-y-2 text-sm">
              {[...rental.audit].reverse().map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-4 border-b border-border py-2">
                  <span>{a.label}</span>
                  <span className="text-muted-foreground">{formatDateTimeNL(a.at)}</span>
                </li>
              ))}
            </ul>
          </section>

          {rental.reviewAllowed ? (
            <section className="border border-border bg-card p-6">
              <h2 className="display text-2xl">Laat een review achter</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Deze huur is afgerond. Deel je ervaring met {other.firstName}.
              </p>
              <Button className="mt-5" variant="outline" asChild>
                <Link to="/account/profiel">Review schrijven</Link>
              </Button>
            </section>
          ) : null}
        </div>

        {/* zijkolom */}
        <aside className="space-y-6">
          <div className="border border-border bg-card p-6">
            <h2 className="text-sm font-medium">Voortgang</h2>
            <div className="mt-5">
              <RentalTimeline steps={buildTimeline(rental)} />
            </div>
          </div>

          <RentalMoneyCard rental={rental} role={role} />

          <div className="border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              {pickup ? <MapPin className="size-4" /> : <Truck className="size-4" />}
              {pickup ? "Ophalen" : "Verzending"}
            </h2>
            {pickup ? (
              <div className="mt-4 text-sm">
                <p>Ophalen in {rental.pickup?.approximateLocation}.</p>
                {isAddressReleased(rental) && rental.pickup ? (
                  <p className="mt-2">{rental.pickup.exactAddress}</p>
                ) : (
                  <p className="mt-2 text-muted-foreground">
                    Het exacte adres wordt gedeeld zodra de boeking is bevestigd.
                  </p>
                )}
              </div>
            ) : (
              <dl className="mt-2">
                <InfoRow
                  label="Heenzending"
                  value={
                    <span className="flex items-center gap-2">
                      <Package className="size-3.5" />
                      {trackingStatusLabel[rental.shipping.outbound.status]}
                      {rental.shipping.outbound.trackingNumber
                        ? ` · ${rental.shipping.outbound.trackingNumber}`
                        : ""}
                    </span>
                  }
                />
                <InfoRow
                  label="Retour"
                  value={
                    <span className="flex items-center gap-2">
                      <Package className="size-3.5" />
                      {trackingStatusLabel[rental.shipping.inbound.status]}
                      {rental.shipping.inbound.trackingNumber
                        ? ` · ${rental.shipping.inbound.trackingNumber}`
                        : ""}
                    </span>
                  }
                />
              </dl>
            )}
          </div>

          <div className="border border-border bg-card p-6">
            <h2 className="text-sm font-medium">Hulp nodig?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Kom je er samen niet uit? Meld het probleem, dan kijkt DressLoop mee.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/account/berichten">Stuur een bericht</Link>
              </Button>
              {!claim && rental.status !== "completed" ? (
                <ProblemReportDialog rentalId={rental.id} role={role} />
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
