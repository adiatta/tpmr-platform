import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.institution import Institution
from app.models.invoice import Invoice, InvoiceStatus


def to_out_dict(invoice: Invoice, institution_name: str | None) -> dict:
    return {
        "id": invoice.id,
        "institution_id": invoice.institution_id,
        "institution_name": institution_name,
        "child_id": invoice.child_id,
        "period_start": invoice.period_start,
        "period_end": invoice.period_end,
        "status": invoice.status,
        "total_amount": invoice.total_amount,
        "rides_count": len(invoice.lines),
        "created_at": invoice.created_at,
    }


def list_invoices(db: Session) -> list[dict]:
    invoices = db.execute(select(Invoice)).scalars().all()
    institutions = {i.id: i.name for i in db.execute(select(Institution)).scalars().all()}
    return [to_out_dict(inv, institutions.get(inv.institution_id)) for inv in invoices]


def get_invoice(db: Session, invoice_id: uuid.UUID) -> Invoice | None:
    return db.get(Invoice, invoice_id)


def get_invoice_out(db: Session, invoice: Invoice) -> dict:
    institution_name = None
    if invoice.institution_id:
        institution = db.get(Institution, invoice.institution_id)
        institution_name = institution.name if institution else None
    out = to_out_dict(invoice, institution_name)
    out["lines"] = invoice.lines
    return out


def update_status(db: Session, invoice: Invoice, status: InvoiceStatus) -> Invoice:
    invoice.status = status
    db.commit()
    db.refresh(invoice)
    return invoice
