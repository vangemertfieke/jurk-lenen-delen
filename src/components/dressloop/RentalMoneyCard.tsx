import { InfoRow, StatusBadge } from "@/components/dressloop/primitives";
import { formatEuro } from "@/lib/config";
import {
  depositStatusLabel,
  paymentStatusLabel,
  payoutStatusLabel,
} from "@/lib/rental/labels";
import type { ProtectedRental, RentalRole } from "@/lib/rental/types";

export function RentalMoneyCard({
  rental,
  role,
}: {
  rental: ProtectedRental;
  role: RentalRole;
}) {
  const p = rental.payment;

  return (
    <div className="border border-border bg-card p-6">
      <h2 className="text-sm font-medium">{role === "renter" ? "Jouw betaling" : "Jouw opbrengst"}</h2>

      <dl className="mt-4">
        {role === "renter" ? (
          <>
            <InfoRow label="Huurprijs" value={formatEuro(p.rentalAmount)} />
            <InfoRow label="Servicekosten" value={formatEuro(p.serviceFee)} />
            {p.shippingFee > 0 ? (
              <InfoRow label="Verzending" value={formatEuro(p.shippingFee)} />
            ) : null}
            <InfoRow label="Borg" value={formatEuro(p.depositAmount)} />
            <InfoRow label="Totaal betaald" value={<span className="price">{formatEuro(p.totalCharged)}</span>} />
          </>
        ) : (
          <>
            <InfoRow label="Huurprijs" value={formatEuro(p.rentalAmount)} />
            <InfoRow
              label={`Commissie Borro (${Math.round(p.commissionRate * 100)}%)`}
              value={`− ${formatEuro(p.commissionAmount)}`}
            />
            <InfoRow
              label="Jouw uitbetaling"
              value={<span className="price">{formatEuro(p.ownerPayoutAmount)}</span>}
            />
            <InfoRow label="Borg huurder" value={formatEuro(p.depositAmount)} />
          </>
        )}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusBadge tone={p.status === "payment_succeeded" ? "success" : "warning"}>
          {paymentStatusLabel[p.status]}
        </StatusBadge>
        <StatusBadge
          tone={
            p.depositStatus === "released"
              ? "success"
              : p.depositStatus === "claim_hold" || p.depositStatus.includes("claimed")
                ? "warning"
                : "brand"
          }
        >
          Borg: {depositStatusLabel[p.depositStatus]}
        </StatusBadge>
        {role === "owner" ? (
          <StatusBadge
            tone={
              p.payoutStatus === "paid"
                ? "success"
                : p.payoutStatus === "on_hold" || p.payoutStatus === "failed"
                  ? "warning"
                  : "brand"
            }
          >
            Uitbetaling: {payoutStatusLabel[p.payoutStatus]}
          </StatusBadge>
        ) : null}
      </div>

      {role === "renter" ? (
        <p className="mt-5 bg-blush px-4 py-3 text-xs leading-relaxed text-blush-foreground">
          De borg krijg je terug wanneer de jurk volgens afspraak en in goede staat is
          geretourneerd.
        </p>
      ) : (
        <p className="mt-5 bg-blush px-4 py-3 text-xs leading-relaxed text-blush-foreground">
          Je uitbetaling komt in aanmerking zodra de huur netjes is afgerond. Bij een melding
          pauzeren we de uitbetaling tot die is afgehandeld.
        </p>
      )}

      {p.depositClaimedAmount > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Verrekend met de borg na afhandeling: {formatEuro(p.depositClaimedAmount)}.
        </p>
      ) : null}
    </div>
  );
}
