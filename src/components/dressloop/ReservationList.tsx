import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "@/components/dressloop/primitives";
import { formatDateNL } from "@/lib/config";
import { getDress } from "@/lib/mock-data";
import {
  reservationLabels,
  setReservationStatus,
  useReservations,
  type Reservation,
} from "@/lib/reservations";

function tone(status: Reservation["status"]) {
  if (status === "bevestigd") return "success" as const;
  if (status === "afgewezen" || status === "geannuleerd") return "warning" as const;
  return "brand" as const;
}

export function ReservationList({ role }: { role: "owner" | "renter" }) {
  const reservations = useReservations();

  if (reservations.length === 0) {
    return (
      <EmptyState
        title="Geen reserveringen"
        description={
          role === "owner"
            ? "Zodra iemand jouw jurk reserveert, kun je de aanvraag hier bevestigen."
            : "Reserveer een jurk en volg hier of de verhuurder je aanvraag bevestigt."
        }
        action={
          <Button asChild>
            <Link to={role === "owner" ? "/verhuren" : "/jurken"}>
              {role === "owner" ? "Plaats een jurk" : "Bekijk jurken"}
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="space-y-6">
      {reservations.map((r) => {
        const dress = getDress(r.dressId);
        return (
          <li key={r.id} className="flex gap-5 border-t border-border pt-6">
            {dress ? (
              <img
                src={dress.images[0]}
                alt={dress.title}
                loading="lazy"
                className="aspect-[3/4] w-20 shrink-0 rounded-2xl object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <StatusBadge tone={tone(r.status)}>{reservationLabels[r.status]}</StatusBadge>
              <p className="mt-2 font-medium">{dress?.title ?? "Jurk"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateNL(new Date(r.from))} — {formatDateNL(new Date(r.to))} ·{" "}
                {r.delivery === "pickup" ? "Ophalen" : "Verzenden"}
              </p>
              {r.slot ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {r.delivery === "pickup" ? "Afhaalmoment" : "Bezorgmoment"}: {r.slot}
                </p>
              ) : null}
              {r.message ? (
                <p className="mt-2 text-sm text-muted-foreground">“{r.message}”</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {role === "owner" && r.status === "wacht_op_verhuurder" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => {
                        setReservationStatus(r.id, "bevestigd");
                        toast.success("Reservering bevestigd. De huurder kan nu afrekenen.");
                      }}
                    >
                      Bevestigen
                    </Button>
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => {
                        setReservationStatus(r.id, "afgewezen");
                        toast.success("Reservering afgewezen.");
                      }}
                    >
                      Afwijzen
                    </Button>
                  </>
                ) : null}

                {role === "renter" && r.status === "bevestigd" && dress ? (
                  <Button size="sm" asChild>
                    <Link
                      to="/afrekenen/$id"
                      params={{ id: dress.id }}
                      search={{ van: r.from, tot: r.to, levering: r.delivery }}
                    >
                      Afrekenen
                    </Link>
                  </Button>
                ) : null}

                {role === "renter" && r.status === "wacht_op_verhuurder" ? (
                  <Button
                    size="sm"
                    variant="quiet"
                    onClick={() => {
                      setReservationStatus(r.id, "geannuleerd");
                      toast.success("Reservering geannuleerd.");
                    }}
                  >
                    Annuleren
                  </Button>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
