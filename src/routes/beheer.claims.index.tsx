import { createFileRoute, Link } from "@tanstack/react-router";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { Button } from "@/components/ui/button";
import { formatEuro } from "@/lib/config";
import { getDress } from "@/lib/mock-data";
import { claimStatusLabel, formatDateTimeNL, problemReasonLabel } from "@/lib/rental/labels";
import { useIsAdmin, useRentals } from "@/lib/rental/store";

export const Route = createFileRoute("/beheer/claims/")({
  head: () => ({
    meta: [
      { title: "Claim Center — Borro beheer" },
      { name: "description", content: "Interne afhandeling van meldingen en claims." },
      { property: "og:title", content: "Claim Center — Borro beheer" },
      { property: "og:description", content: "Interne afhandeling van meldingen en claims." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClaimCenter,
});

function ClaimCenter() {
  const { claims, getRental } = useRentals();
  const { isAdmin, enableAdmin } = useIsAdmin();

  if (!isAdmin) {
    return (
      <div className="container-page py-24">
        <p className="eyebrow">Intern</p>
        <h1 className="display mt-4 text-3xl">Claim Center</h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground">
          Deze omgeving is alleen voor het Borro-team. In productie loopt toegang via
          gebruikersrollen en RLS aan de serverkant.
        </p>
        <Button className="mt-8" onClick={enableAdmin}>
          Demo-toegang inschakelen
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-16">
      <p className="eyebrow">Intern</p>
      <h1 className="display mt-4 text-3xl sm:text-4xl">Claim Center</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Alle gemelde problemen met bijbehorend bewijs, tijdlijn en financiële status. Besluiten
        wijzigen alleen interne statussen; geldstromen lopen later via beveiligde serverfuncties.
      </p>

      <div className="mt-10 space-y-6">
        {claims.length === 0 ? (
          <EmptyState title="Geen open meldingen" description="Er zijn op dit moment geen claims." />
        ) : (
          claims.map((claim) => {
            const rental = getRental(claim.rentalId);
            const dress = rental ? getDress(rental.dressId) : undefined;
            return (
              <Link
                key={claim.id}
                to="/beheer/claims/$claimId"
                params={{ claimId: claim.id }}
                className="block border border-border bg-card p-6 transition-colors hover:border-border-strong"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="price text-sm">{claim.id}</span>
                  <StatusBadge tone={claim.priority === "high" ? "warning" : "brand"}>
                    {claimStatusLabel[claim.status]}
                  </StatusBadge>
                  {claim.priority === "high" ? (
                    <StatusBadge tone="warning">Hoge prioriteit</StatusBadge>
                  ) : null}
                </div>
                <p className="mt-3 font-medium">
                  {problemReasonLabel[claim.reason]} · {dress?.title ?? claim.rentalId}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{claim.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  Gemeld {formatDateTimeNL(claim.createdAt)}
                  {claim.requestedAmount
                    ? ` · verzoek ${formatEuro(claim.requestedAmount)}`
                    : ""}
                  {rental ? ` · borg ${formatEuro(rental.payment.depositAmount)}` : ""}
                </p>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
