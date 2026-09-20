import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_admin
from app.crud import billing as billing_crud
from app.db.session import get_db
from app.models.child import Child
from app.models.institution import Institution
from app.models.user import User
from app.schemas.billing import (
    GenerateInvoicesRequest,
    InvoiceDetailOut,
    InvoiceOut,
    InvoiceStatusUpdate,
)
from app.services import billing_service
from app.services.pdf_generator import generate_invoice_pdf

router = APIRouter(prefix="/billing", tags=["billing"])


@router.post("/generate", response_model=list[InvoiceOut], status_code=status.HTTP_201_CREATED)
def generate_invoices(
    payload: GenerateInvoicesRequest, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> list[dict]:
    invoices = billing_service.generate_invoices_for_period(db, payload.period_start, payload.period_end)
    institutions = {i.institution_id: i for i in invoices if i.institution_id}
    names = {}
    if institutions:
        rows = db.query(Institution).filter(Institution.id.in_(institutions.keys())).all()
        names = {row.id: row.name for row in rows}
    return [billing_crud.to_out_dict(inv, names.get(inv.institution_id)) for inv in invoices]


@router.get("", response_model=list[InvoiceOut])
def list_invoices(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> list[dict]:
    return billing_crud.list_invoices(db)


@router.get("/{invoice_id}", response_model=InvoiceDetailOut)
def get_invoice(
    invoice_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    invoice = billing_crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Facture introuvable")
    return billing_crud.get_invoice_out(db, invoice)


@router.patch("/{invoice_id}/status", response_model=InvoiceOut)
def update_invoice_status(
    invoice_id: uuid.UUID,
    payload: InvoiceStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    invoice = billing_crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Facture introuvable")
    updated = billing_crud.update_status(db, invoice, payload.status)
    institution_name = None
    if updated.institution_id:
        institution = db.get(Institution, updated.institution_id)
        institution_name = institution.name if institution else None
    return billing_crud.to_out_dict(updated, institution_name)


@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> Response:
    invoice = billing_crud.get_invoice(db, invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Facture introuvable")

    if invoice.institution_id:
        institution = db.get(Institution, invoice.institution_id)
        recipient = institution.name if institution else "Établissement inconnu"
    elif invoice.child_id:
        child = db.get(Child, invoice.child_id)
        recipient = child.guardian_name if child else "Responsable inconnu"
    else:
        recipient = "Destinataire inconnu"

    pdf_bytes = generate_invoice_pdf(invoice, recipient)
    filename = f"facture-{str(invoice.id)[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
