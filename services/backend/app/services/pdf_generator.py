import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from app.models.invoice import Invoice


def generate_invoice_pdf(invoice: Invoice, recipient_name: str) -> bytes:
    """Génère un PDF simple pour une facture : en-tête, période, liste des
    courses facturées, total. Retourne les octets du PDF (pas d'écriture
    disque — servi directement en réponse HTTP par l'endpoint)."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("TPMR Transport", styles["Title"]))
    elements.append(Paragraph(f"Facture n° {str(invoice.id)[:8].upper()}", styles["Heading2"]))
    elements.append(Spacer(1, 6 * mm))

    elements.append(Paragraph(f"<b>Destinataire :</b> {recipient_name}", styles["Normal"]))
    elements.append(
        Paragraph(
            f"<b>Période :</b> {invoice.period_start.strftime('%d/%m/%Y')} — "
            f"{invoice.period_end.strftime('%d/%m/%Y')}",
            styles["Normal"],
        )
    )
    elements.append(
        Paragraph(f"<b>Statut :</b> {invoice.status.value.capitalize()}", styles["Normal"])
    )
    elements.append(Spacer(1, 8 * mm))

    table_data = [["Date de la course", "Montant"]]
    for line in invoice.lines:
        ride_date = line.ride.scheduled_at.strftime("%d/%m/%Y %H:%M") if line.ride else "—"
        table_data.append([ride_date, f"{line.amount:.2f} €"])
    table_data.append(["Total", f"{invoice.total_amount:.2f} €"])

    table = Table(table_data, colWidths=[120 * mm, 40 * mm])
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F5C5C")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
                ("LINEBELOW", (0, 0), (-1, 0), 0.5, colors.grey),
                ("LINEABOVE", (0, -1), (-1, -1), 0.5, colors.grey),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -2), [colors.white, colors.HexColor("#F4F8F8")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    elements.append(table)

    doc.build(elements)
    return buffer.getvalue()
