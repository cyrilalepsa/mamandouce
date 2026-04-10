"""
Expert Comptable IA routes for MamanDouce Admin
Uses GPT-5.2 for financial advice and business insights
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone, timedelta
from typing import Optional
import logging
import os
import io
import uuid
from collections import defaultdict

from core.database import db
from core.security import get_admin_user
from models.schemas import User, AccountingChatRequest

logger = logging.getLogger(__name__)
router = APIRouter(tags=["accounting"])

# ==================== CONSTANTS ====================
URSSAF_RATE = 0.26  # 26% cotisations URSSAF
STRIPE_PERCENT = 0.029  # 2.9%
STRIPE_FIXED = 0.25  # 0.25€ par transaction
TVA_THRESHOLD = 36800  # Seuil franchise TVA auto-entrepreneur 2025

PREMIUM_PRICE = 30.0
POSTPARTUM_PRICE = 10.0


# ==================== ACCOUNTING KPIs ====================

@router.get("/admin/accounting/kpis")
async def get_accounting_kpis(
    month: Optional[str] = None,  # Format: YYYY-MM
    admin: User = Depends(get_admin_user)
):
    """Get accounting KPIs for admin dashboard"""
    
    # Default to current month if not specified
    if not month:
        now = datetime.now(timezone.utc)
        month = now.strftime("%Y-%m")
    
    year, month_num = month.split("-")
    start_date = f"{month}-01T00:00:00"
    # Calculate end of month
    if int(month_num) == 12:
        end_date = f"{int(year)+1}-01-01T00:00:00"
    else:
        end_date = f"{year}-{int(month_num)+1:02d}-01T00:00:00"
    
    # Get all premium subscriptions this month (REAL PAYMENTS ONLY)
    premium_users = await db.users.find({
        "subscription_status": "premium",
        "premium_source": {"$nin": ["admin_granted", "promo_code"]},
        "subscription_start_date": {"$gte": start_date, "$lt": end_date}
    }, {"_id": 0}).to_list(10000)
    
    # Get all post-partum purchases this month (REAL PAYMENTS ONLY)
    postpartum_users = await db.users.find({
        "postpartum_purchased": True,
        "postpartum_free_via_referral": {"$ne": True},
        "postpartum_source": {"$ne": "admin_granted"},
        "postpartum_purchase_date": {"$gte": start_date, "$lt": end_date}
    }, {"_id": 0}).to_list(10000)
    
    total_premium = len(premium_users)
    total_postpartum = len(postpartum_users)
    total_transactions = total_premium + total_postpartum
    
    # Calculate revenues
    ca_premium = total_premium * PREMIUM_PRICE
    ca_postpartum = total_postpartum * POSTPARTUM_PRICE
    ca_brut = ca_premium + ca_postpartum
    
    # Calculate Stripe fees (2.9% + 0.25€ per transaction)
    frais_stripe = (ca_brut * STRIPE_PERCENT) + (total_transactions * STRIPE_FIXED)
    
    # Calculate URSSAF contributions (26%)
    cotisations_urssaf = ca_brut * URSSAF_RATE
    
    # Net benefit
    benefice_net = ca_brut - frais_stripe - cotisations_urssaf
    
    # Year-to-date totals
    year_start = f"{year}-01-01T00:00:00"
    
    ytd_premium = await db.users.count_documents({
        "subscription_status": "premium",
        "premium_source": {"$nin": ["admin_granted", "promo_code"]},
        "subscription_start_date": {"$gte": year_start}
    })
    
    ytd_postpartum = await db.users.count_documents({
        "postpartum_purchased": True,
        "postpartum_free_via_referral": {"$ne": True},
        "postpartum_source": {"$ne": "admin_granted"},
        "postpartum_purchase_date": {"$gte": year_start}
    })
    
    ca_ytd = (ytd_premium * PREMIUM_PRICE) + (ytd_postpartum * POSTPARTUM_PRICE)
    
    # TVA Alert
    tva_alert = None
    if ca_ytd > TVA_THRESHOLD * 0.8:
        tva_alert = f"⚠️ Alerte : Tu approches du seuil de franchise de TVA ({TVA_THRESHOLD}€). CA annuel actuel: {ca_ytd}€"
    
    return {
        "month": month,
        "ca_brut": round(ca_brut, 2),
        "ca_premium": round(ca_premium, 2),
        "ca_postpartum": round(ca_postpartum, 2),
        "frais_stripe": round(frais_stripe, 2),
        "cotisations_urssaf": round(cotisations_urssaf, 2),
        "benefice_net": round(benefice_net, 2),
        "total_premium": total_premium,
        "total_postpartum": total_postpartum,
        "total_transactions": total_transactions,
        "urssaf_rate": f"{URSSAF_RATE * 100}%",
        "year_to_date": {
            "ca_total": round(ca_ytd, 2),
            "premium_count": ytd_premium,
            "postpartum_count": ytd_postpartum
        },
        "tva_threshold": TVA_THRESHOLD,
        "tva_alert": tva_alert
    }


@router.get("/admin/accounting/monthly-evolution")
async def get_monthly_evolution(admin: User = Depends(get_admin_user)):
    """Get monthly revenue evolution for charts"""
    
    # Get last 12 months of data
    now = datetime.now(timezone.utc)
    monthly_data = []
    
    for i in range(12):
        # Calculate month
        month_date = now - timedelta(days=30 * i)
        month_str = month_date.strftime("%Y-%m")
        year, month_num = month_str.split("-")
        
        start_date = f"{month_str}-01T00:00:00"
        if int(month_num) == 12:
            end_date = f"{int(year)+1}-01-01T00:00:00"
        else:
            end_date = f"{year}-{int(month_num)+1:02d}-01T00:00:00"
        
        # Count real payments
        premium_count = await db.users.count_documents({
            "subscription_status": "premium",
            "premium_source": {"$nin": ["admin_granted", "promo_code"]},
            "subscription_start_date": {"$gte": start_date, "$lt": end_date}
        })
        
        postpartum_count = await db.users.count_documents({
            "postpartum_purchased": True,
            "postpartum_free_via_referral": {"$ne": True},
            "postpartum_source": {"$ne": "admin_granted"},
            "postpartum_purchase_date": {"$gte": start_date, "$lt": end_date}
        })
        
        ca = (premium_count * PREMIUM_PRICE) + (postpartum_count * POSTPARTUM_PRICE)
        benefice = ca - (ca * STRIPE_PERCENT) - ((premium_count + postpartum_count) * STRIPE_FIXED) - (ca * URSSAF_RATE)
        
        month_names = {
            "01": "Jan", "02": "Fév", "03": "Mar", "04": "Avr",
            "05": "Mai", "06": "Juin", "07": "Juil", "08": "Août",
            "09": "Sep", "10": "Oct", "11": "Nov", "12": "Déc"
        }
        
        monthly_data.append({
            "month": f"{month_names.get(month_num, month_num)} {year[-2:]}",
            "month_key": month_str,
            "ca_brut": round(ca, 2),
            "benefice_net": round(benefice, 2),
            "premium": premium_count,
            "postpartum": postpartum_count
        })
    
    # Reverse to have chronological order
    monthly_data.reverse()
    
    return {"monthly_evolution": monthly_data}


# ==================== AI EXPERT CHAT ====================

@router.post("/admin/accounting/chat")
async def chat_with_expert(
    request: AccountingChatRequest,
    admin: User = Depends(get_admin_user)
):
    """Chat with AI Expert Comptable (GPT-5.2)"""
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    from dotenv import load_dotenv
    
    load_dotenv()
    
    api_key = os.environ.get("EMERGENT_LLM_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="Clé API LLM non configurée")
    
    # Get current financial context
    now = datetime.now(timezone.utc)
    month = now.strftime("%Y-%m")
    
    # Get KPIs for context
    kpis = await get_accounting_kpis_internal(month)
    ytd_data = kpis.get("year_to_date", {})
    
    # Build context message
    financial_context = f"""
Tu es l'Expert Comptable IA de MamanDouce, une application de suivi de grossesse.

CONTEXTE FINANCIER ACTUEL:
- Mois en cours: {month}
- CA Brut du mois: {kpis.get('ca_brut', 0)}€
- Bénéfice Net du mois: {kpis.get('benefice_net', 0)}€
- Abonnements Premium: {kpis.get('total_premium', 0)} (30€/unité)
- Ventes Post-partum: {kpis.get('total_postpartum', 0)} (10€/unité)
- Frais Stripe: {kpis.get('frais_stripe', 0)}€
- Cotisations URSSAF (26%): {kpis.get('cotisations_urssaf', 0)}€

CUMUL ANNUEL:
- CA Total: {ytd_data.get('ca_total', 0)}€
- Total Premium: {ytd_data.get('premium_count', 0)}
- Total Post-partum: {ytd_data.get('postpartum_count', 0)}

SEUIL TVA: {TVA_THRESHOLD}€ (franchise auto-entrepreneur)

Tu dois:
1. Répondre aux questions financières et comptables
2. Conseiller sur les paliers de CA et les implications
3. Proposer des aides disponibles (ACRE, etc.) si pertinent
4. Analyser les tendances de croissance
5. Alerter sur les seuils importants (TVA, etc.)
6. Donner des conseils pratiques pour optimiser les cotisations

Réponds de manière professionnelle mais accessible, en français.
"""
    
    session_id = request.session_id or f"admin-{admin.id}-{uuid.uuid4().hex[:8]}"
    
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=session_id,
            system_message=financial_context
        ).with_model("openai", "gpt-5.2")
        
        user_message = UserMessage(text=request.message)
        response = await chat.send_message(user_message)
        
        # Save chat history
        await db.accounting_chats.insert_one({
            "session_id": session_id,
            "admin_id": admin.id,
            "admin_email": admin.email,
            "user_message": request.message,
            "assistant_response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "response": response,
            "session_id": session_id
        }
        
    except Exception as e:
        logger.error(f"Error in AI chat: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur IA: {str(e)}")


@router.get("/admin/accounting/chat/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    admin: User = Depends(get_admin_user)
):
    """Get chat history with AI Expert"""
    
    query = {"admin_id": admin.id}
    if session_id:
        query["session_id"] = session_id
    
    history = await db.accounting_chats.find(
        query,
        {"_id": 0}
    ).sort("timestamp", -1).to_list(50)
    
    return {"history": history}


# ==================== STRATEGIC ALERTS ====================

@router.get("/admin/accounting/alerts")
async def get_strategic_alerts(admin: User = Depends(get_admin_user)):
    """Get strategic financial alerts"""
    
    alerts = []
    now = datetime.now(timezone.utc)
    
    # Get YTD CA
    year_start = f"{now.year}-01-01T00:00:00"
    
    ytd_premium = await db.users.count_documents({
        "subscription_status": "premium",
        "premium_source": {"$nin": ["admin_granted", "promo_code"]},
        "subscription_start_date": {"$gte": year_start}
    })
    
    ytd_postpartum = await db.users.count_documents({
        "postpartum_purchased": True,
        "postpartum_free_via_referral": {"$ne": True},
        "postpartum_source": {"$ne": "admin_granted"},
        "postpartum_purchase_date": {"$gte": year_start}
    })
    
    ca_ytd = (ytd_premium * PREMIUM_PRICE) + (ytd_postpartum * POSTPARTUM_PRICE)
    
    # TVA Threshold Alert
    if ca_ytd >= TVA_THRESHOLD:
        alerts.append({
            "type": "critical",
            "icon": "⚠️",
            "title": "Seuil TVA dépassé",
            "message": f"Votre CA annuel ({ca_ytd}€) dépasse le seuil de franchise TVA ({TVA_THRESHOLD}€). Consultez un expert-comptable.",
            "action": "Contactez un expert-comptable pour régulariser votre situation TVA."
        })
    elif ca_ytd >= TVA_THRESHOLD * 0.9:
        alerts.append({
            "type": "warning",
            "icon": "⚡",
            "title": "Approche seuil TVA",
            "message": f"Vous êtes à {round(ca_ytd/TVA_THRESHOLD*100)}% du seuil de franchise TVA.",
            "action": "Anticipez le passage à la TVA et préparez votre comptabilité."
        })
    
    # Monthly growth analysis
    current_month = now.strftime("%Y-%m")
    last_month = (now - timedelta(days=30)).strftime("%Y-%m")
    
    current_kpis = await get_accounting_kpis_internal(current_month)
    last_kpis = await get_accounting_kpis_internal(last_month)
    
    if last_kpis.get("ca_brut", 0) > 0:
        growth = ((current_kpis.get("ca_brut", 0) - last_kpis.get("ca_brut", 0)) / last_kpis.get("ca_brut", 1)) * 100
        
        if growth >= 20:
            alerts.append({
                "type": "success",
                "icon": "🚀",
                "title": "Mois record !",
                "message": f"+{round(growth)}% de croissance par rapport au mois dernier.",
                "action": "Pensez à mettre de côté pour vos cotisations trimestrielles."
            })
        elif growth <= -20:
            alerts.append({
                "type": "warning",
                "icon": "📉",
                "title": "Baisse d'activité",
                "message": f"{round(growth)}% de croissance par rapport au mois dernier.",
                "action": "Analysez les causes et envisagez des actions marketing."
            })
    
    # URSSAF payment reminder (quarterly)
    quarter_months = [3, 6, 9, 12]  # Échéances trimestrielles
    if now.month in quarter_months and now.day <= 15:
        cotisations_estimees = ca_ytd * URSSAF_RATE
        alerts.append({
            "type": "info",
            "icon": "📅",
            "title": "Échéance URSSAF proche",
            "message": f"Cotisations estimées ce trimestre: ~{round(cotisations_estimees/4)}€",
            "action": "Vérifiez votre déclaration trimestrielle URSSAF."
        })
    
    # ACRE eligibility check (if recent registration)
    # This would need registration date, simplified here
    
    return {"alerts": alerts}


# ==================== PDF EXPORT ====================

@router.get("/admin/accounting/export-pdf")
async def export_accounting_pdf(
    month: Optional[str] = None,
    admin: User = Depends(get_admin_user)
):
    """Export monthly accounting report as PDF"""
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.lib.units import cm, mm
    
    # Get month
    if not month:
        month = datetime.now(timezone.utc).strftime("%Y-%m")
    
    # Get KPIs
    kpis = await get_accounting_kpis_internal(month)
    
    # Create PDF
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm)
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#ec4899'),
        spaceAfter=20,
        alignment=1  # Center
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=10,
        alignment=1
    )
    
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading3'],
        fontSize=14,
        textColor=colors.HexColor('#0ea5e9'),
        spaceBefore=20,
        spaceAfter=10
    )
    
    elements = []
    
    # Header
    elements.append(Paragraph("🌸 MamanDouce", title_style))
    elements.append(Paragraph(f"Bilan Comptable - {month}", subtitle_style))
    elements.append(Spacer(1, 20))
    
    # KPI Summary
    elements.append(Paragraph("📊 Résumé Financier", section_style))
    
    kpi_data = [
        ["Indicateur", "Montant"],
        ["CA Brut", f"{kpis.get('ca_brut', 0)} €"],
        ["Abonnements Premium", f"{kpis.get('total_premium', 0)} x 30€ = {kpis.get('ca_premium', 0)} €"],
        ["Ventes Post-partum", f"{kpis.get('total_postpartum', 0)} x 10€ = {kpis.get('ca_postpartum', 0)} €"],
        ["", ""],
        ["Frais Stripe (2,9% + 0,25€)", f"- {kpis.get('frais_stripe', 0)} €"],
        ["Cotisations URSSAF (26%)", f"- {kpis.get('cotisations_urssaf', 0)} €"],
        ["", ""],
        ["BÉNÉFICE NET", f"{kpis.get('benefice_net', 0)} €"],
    ]
    
    table = Table(kpi_data, colWidths=[10*cm, 5*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ec4899')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.HexColor('#fdf2f8')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#d4f8e8')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#059669')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#fbcfe8')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 20))
    
    # Year to date
    ytd = kpis.get('year_to_date', {})
    elements.append(Paragraph("📈 Cumul Annuel", section_style))
    
    ytd_data = [
        ["Indicateur", "Valeur"],
        ["CA Total Annuel", f"{ytd.get('ca_total', 0)} €"],
        ["Total Abonnements Premium", str(ytd.get('premium_count', 0))],
        ["Total Ventes Post-partum", str(ytd.get('postpartum_count', 0))],
        ["Seuil Franchise TVA", f"{TVA_THRESHOLD} €"],
    ]
    
    table2 = Table(ytd_data, colWidths=[10*cm, 5*cm])
    table2.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0ea5e9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0f9ff')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bae6fd')),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    
    elements.append(table2)
    elements.append(Spacer(1, 30))
    
    # Footer
    elements.append(Paragraph(
        f"Document généré le {datetime.now(timezone.utc).strftime('%d/%m/%Y à %H:%M')}",
        ParagraphStyle('Footer', fontSize=10, textColor=colors.HexColor('#94a3b8'), alignment=1)
    ))
    elements.append(Paragraph(
        "MamanDouce - Application de suivi de grossesse",
        ParagraphStyle('Footer2', fontSize=10, textColor=colors.HexColor('#ec4899'), alignment=1)
    ))
    
    doc.build(elements)
    buffer.seek(0)
    
    filename = f"MamanDouce_Bilan_{month}.pdf"
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


# ==================== INTERNAL HELPERS ====================

async def get_accounting_kpis_internal(month: str):
    """Internal helper to get KPIs without admin check"""
    
    year, month_num = month.split("-")
    start_date = f"{month}-01T00:00:00"
    if int(month_num) == 12:
        end_date = f"{int(year)+1}-01-01T00:00:00"
    else:
        end_date = f"{year}-{int(month_num)+1:02d}-01T00:00:00"
    
    premium_count = await db.users.count_documents({
        "subscription_status": "premium",
        "premium_source": {"$nin": ["admin_granted", "promo_code"]},
        "subscription_start_date": {"$gte": start_date, "$lt": end_date}
    })
    
    postpartum_count = await db.users.count_documents({
        "postpartum_purchased": True,
        "postpartum_free_via_referral": {"$ne": True},
        "postpartum_source": {"$ne": "admin_granted"},
        "postpartum_purchase_date": {"$gte": start_date, "$lt": end_date}
    })
    
    total_transactions = premium_count + postpartum_count
    ca_premium = premium_count * PREMIUM_PRICE
    ca_postpartum = postpartum_count * POSTPARTUM_PRICE
    ca_brut = ca_premium + ca_postpartum
    frais_stripe = (ca_brut * STRIPE_PERCENT) + (total_transactions * STRIPE_FIXED)
    cotisations_urssaf = ca_brut * URSSAF_RATE
    benefice_net = ca_brut - frais_stripe - cotisations_urssaf
    
    # YTD
    year_start = f"{year}-01-01T00:00:00"
    ytd_premium = await db.users.count_documents({
        "subscription_status": "premium",
        "premium_source": {"$nin": ["admin_granted", "promo_code"]},
        "subscription_start_date": {"$gte": year_start}
    })
    ytd_postpartum = await db.users.count_documents({
        "postpartum_purchased": True,
        "postpartum_free_via_referral": {"$ne": True},
        "postpartum_source": {"$ne": "admin_granted"},
        "postpartum_purchase_date": {"$gte": year_start}
    })
    ca_ytd = (ytd_premium * PREMIUM_PRICE) + (ytd_postpartum * POSTPARTUM_PRICE)
    
    return {
        "month": month,
        "ca_brut": round(ca_brut, 2),
        "ca_premium": round(ca_premium, 2),
        "ca_postpartum": round(ca_postpartum, 2),
        "frais_stripe": round(frais_stripe, 2),
        "cotisations_urssaf": round(cotisations_urssaf, 2),
        "benefice_net": round(benefice_net, 2),
        "total_premium": premium_count,
        "total_postpartum": postpartum_count,
        "total_transactions": total_transactions,
        "year_to_date": {
            "ca_total": round(ca_ytd, 2),
            "premium_count": ytd_premium,
            "postpartum_count": ytd_postpartum
        }
    }
