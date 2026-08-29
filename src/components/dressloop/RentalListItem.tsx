import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/dressloop/primitives";
import { formatDateNL, formatEuro } from "@/lib/config";
import { getDress, getProfile } from "@/lib/mock-data";
import { getNextStep } from "@/lib/rental/engine";
import { rentalStatusLabel, rentalStatusTone } from "@/lib/rental/labels";
import type { ProtectedRental, RentalRole } from "@/lib/rental/types";

export function RentalListItem({
  rental,
  role,
}: {
  rental: ProtectedRental;
  role: RentalRole;
}) {
  const dress = getDress(rental.dressId);
  const other = getProfile(role === "renter" ? rental.ownerId : rental.renterId);
  const next = getNextStep(rental, role);

  return (
    <li className="grid gap-5 border-t border-border pt-6 sm:grid-cols-[6rem_minmax(0,1fr)]">
      <Link to="/huur/$id" params={{ id: rental.id }} className="block w-24">
        <img
          src={dress?.images[0]}
          alt={dress?.title ?? ""}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover"
        />
      </Link>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-medium">{dress?.title}</p>
          <StatusBadge tone={rentalStatusTone[rental.status]}>
            {rentalStatusLabel[rental.status]}
          </StatusBadge>
          {next.actionRequired ? <StatusBadge tone="warning">Actie nodig</StatusBadge> : null}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === "renter" ? "Van" : "Aan"} {other.firstName} ·{" "}
          {formatDateNL(new Date(rental.startDate))} — {formatDateNL(new Date(rental.endDate))} ·{" "}
          {rental.delivery === "pickup" ? "Ophalen" : "Verzenden"}
        </p>
        <p className="price mt-2 text-sm">
          {formatEuro(
            role === "renter" ? rental.payment.totalCharged : rental.payment.ownerPayoutAmount,
          )}
        </p>
        <p className="mt-3 text-sm">
          <span className="text-muted-foreground">Volgende stap: </span>
          {next.next}
        </p>
        <div className="mt-4">
          <Link
            to="/huur/$id"
            params={{ id: rental.id }}
            className="text-sm text-primary hover:underline"
          >
            Bekijk deze huur
          </Link>
        </div>
      </div>
    </li>
  );
}
