from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
from io import BytesIO
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.utils import ImageReader
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image,
)

from app.database import (
    reports_collection,
    projects_collection,
    labor_collection,
    materials_collection,
    photos_collection,
)

router = APIRouter(prefix="/pdf", tags=["PDF Reports"])


def safe(value):
    if value is None or value == "":
        return "-"
    return str(value)


def create_scaled_image(image_path, max_width=430, max_height=260):
    image_reader = ImageReader(str(image_path))
    original_width, original_height = image_reader.getSize()

    width_ratio = max_width / original_width
    height_ratio = max_height / original_height
    scale = min(width_ratio, height_ratio)

    final_width = original_width * scale
    final_height = original_height * scale

    return Image(str(image_path), width=final_width, height=final_height)


@router.get("/report/{report_id}")
async def generate_daily_report_pdf(report_id: str):
    if not ObjectId.is_valid(report_id):
        raise HTTPException(status_code=400, detail="Invalid report ID")

    report = await reports_collection.find_one({"_id": ObjectId(report_id)})

    if not report:
        raise HTTPException(status_code=404, detail="Daily report not found")

    project = None

    if ObjectId.is_valid(report.get("projectId", "")):
        project = await projects_collection.find_one(
            {"_id": ObjectId(report.get("projectId"))}
        )

    labor_entries = []
    labor_cursor = labor_collection.find({"reportId": report_id})

    async for labor in labor_cursor:
        labor_entries.append(labor)

    material_entries = []
    material_cursor = materials_collection.find({"reportId": report_id})

    async for material in material_cursor:
        material_entries.append(material)

    photo_entries = []
    photo_cursor = photos_collection.find({"reportId": report_id})

    async for photo in photo_cursor:
        photo_entries.append(photo)

    buffer = BytesIO()

    pdf = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )

    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    heading_style = styles["Heading2"]
    normal_style = styles["Normal"]

    elements = []

    elements.append(Paragraph("SiteMate AI - Daily Construction Report", title_style))
    elements.append(Spacer(1, 18))

    # ---------------- PROJECT DETAILS ----------------

    elements.append(Paragraph("Project Details", heading_style))

    project_data = [
        ["Project Name", safe(project.get("projectName") if project else None)],
        ["Location", safe(project.get("location") if project else None)],
        ["Client Name", safe(project.get("clientName") if project else None)],
        ["Contractor Name", safe(project.get("contractorName") if project else None)],
        ["Project Type", safe(project.get("projectType") if project else None)],
        ["Status", safe(project.get("status") if project else None)],
    ]

    project_table = Table(project_data, colWidths=[150, 330])
    project_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.black),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    elements.append(project_table)
    elements.append(Spacer(1, 18))

    # ---------------- DAILY REPORT DETAILS ----------------

    elements.append(Paragraph("Daily Report Details", heading_style))

    report_data = [
        ["Date", safe(report.get("date"))],
        ["Weather", safe(report.get("weather"))],
        ["Work Completed", safe(report.get("workCompleted"))],
        ["Work Planned Tomorrow", safe(report.get("workPlannedTomorrow"))],
        ["Delay Reason", safe(report.get("delayReason"))],
        ["Site Issues", safe(report.get("siteIssues"))],
        ["Remarks", safe(report.get("remarks"))],
        ["Created By", safe(report.get("createdBy"))],
    ]

    report_table = Table(report_data, colWidths=[150, 330])
    report_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("PADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    elements.append(report_table)
    elements.append(Spacer(1, 18))

    # ---------------- LABOR DETAILS ----------------

    elements.append(Paragraph("Labor Details", heading_style))

    if labor_entries:
        labor_data = [["Labor Type", "Workers", "Hours", "Overtime", "Work Assigned"]]

        for labor in labor_entries:
            labor_data.append(
                [
                    safe(labor.get("laborType")),
                    safe(labor.get("count")),
                    safe(labor.get("workingHours")),
                    safe(labor.get("overtime")),
                    safe(labor.get("workAssigned")),
                ]
            )

        labor_table = Table(labor_data, colWidths=[85, 65, 60, 65, 205])
        labor_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("PADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )

        elements.append(labor_table)
    else:
        elements.append(Paragraph("No labor entries added.", normal_style))

    elements.append(Spacer(1, 18))

    # ---------------- MATERIAL DETAILS ----------------

    elements.append(Paragraph("Material Details", heading_style))

    if material_entries:
        material_data = [
            [
                "Material",
                "Unit",
                "Opening",
                "Received",
                "Used",
                "Closing",
            ]
        ]

        for material in material_entries:
            material_data.append(
                [
                    safe(material.get("materialName")),
                    safe(material.get("unit")),
                    safe(material.get("openingStock")),
                    safe(material.get("receivedToday")),
                    safe(material.get("quantityUsed")),
                    safe(material.get("closingStock")),
                ]
            )

        material_table = Table(material_data, colWidths=[90, 70, 75, 75, 70, 75])
        material_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("PADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )

        elements.append(material_table)
    else:
        elements.append(Paragraph("No material entries added.", normal_style))

    elements.append(Spacer(1, 18))

    # ---------------- SITE PHOTOS ----------------

    elements.append(Paragraph("Site Photos", heading_style))

    if photo_entries:
        for index, photo in enumerate(photo_entries, start=1):
            caption = safe(photo.get("caption"))
            filename = photo.get("filename")

            elements.append(Paragraph(f"Photo {index}: {caption}", normal_style))
            elements.append(Spacer(1, 8))

            if filename:
                image_path = Path("uploads/site_photos") / filename

                if image_path.exists():
                    try:
                        pdf_image = create_scaled_image(image_path)
                        elements.append(pdf_image)
                        elements.append(Spacer(1, 14))
                    except Exception:
                        elements.append(
                            Paragraph("Unable to load this image in PDF.", normal_style)
                        )
                        elements.append(Spacer(1, 10))
                else:
                    elements.append(Paragraph("Image file not found.", normal_style))
                    elements.append(Spacer(1, 10))
    else:
        elements.append(Paragraph("No site photos uploaded.", normal_style))

    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Generated by SiteMate AI Reporting System", normal_style))

    pdf.build(elements)

    buffer.seek(0)

    filename = f"daily_report_{report_id}.pdf"

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )