import uuid
from datetime import date, datetime, time

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.child import Child
from app.models.invoice import Invoice, InvoiceLine, InvoiceStatus
from app.models.ride import Ride, RideStatus


def generate_invoices_for_period(db: Session, period_start: date, period_end: date) -> list[Invoice]:
    """Regroupe toutes les courses 'Terminée' de la période par établissement
    (fallback : par enfant si celui-ci n'a pas d'établissement rattaché) et
    crée une facture brouillon par groupe. Les courses déjà rattachées à une
    facture existante (via InvoiceLine) sont exclues pour éviter les
    doublons si on relance une génération sur une période qui chevauche."""
    start_dt = datetime.combine(period_start, time.min)
    end_dt = datetime.combine(period_end, time.max)

    already_invoiced_ride_ids = set(
        db.execute(select(InvoiceLine.ride_id)).scalars().all()
    )

    stmt = select(Ride).where(
        Ride.status == RideStatus.COMPLETED,
        Ride.scheduled_at >= start_dt,
        Ride.scheduled_at <= end_dt,
    )
    completed_rides = [r for r in db.execute(stmt).scalars().all() if r.id not in already_invoiced_ride_ids]

    # Regroupe par (institution_id ou child_id si pas d'établissement)
    groups: dict[tuple[str, uuid.UUID], list[Ride]] = {}
    children_cache: dict[uuid.UUID, Child] = {}

    for ride in completed_rides:
        child = children_cache.get(ride.child_id) or db.get(Child, ride.child_id)
        children_cache[ride.child_id] = child
        if child and child.institution_id:
            key = ("institution", child.institution_id)
        else:
            key = ("child", ride.child_id)
        groups.setdefault(key, []).append(ride)

    invoices: list[Invoice] = []
    for (kind, group_id), rides in groups.items():
        invoice = Invoice(
            institution_id=group_id if kind == "institution" else None,
            child_id=group_id if kind == "child" else None,
            period_start=period_start,
            period_end=period_end,
            status=InvoiceStatus.DRAFT,
            total_amount=sum(r.price or 0 for r in rides),
        )
        db.add(invoice)
        db.flush()  # récupère invoice.id

        for ride in rides:
            db.add(InvoiceLine(invoice_id=invoice.id, ride_id=ride.id, amount=ride.price or 0))

        invoices.append(invoice)

    db.commit()
    for invoice in invoices:
        db.refresh(invoice)
    return invoices
