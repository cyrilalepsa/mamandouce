"""
Pregnancy date calculations aligned with national calendars.

France (CPAM / Ameli):
- DPA = DDG + 9 calendar months
- SA windows use the CPAM offset: DDG + (SA - 1) * 7 - 14 days
- Maternity leave: inclusive postnatal end (DPA + weeks * 7 - 1 day)

UK (NHS):
- DPA = DDG + 280 days (Naegele, 40 SA)
- Antenatal schedule based on amenorrhea weeks from DDG
"""
from __future__ import annotations

import calendar
from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple

from core.pregnancy_country import COUNTRY_FR, COUNTRY_UK, resolve_country_from_city


def parse_date(value: date | datetime | str) -> date:
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    raw = str(value).strip().replace("Z", "+00:00")
    if "T" in raw:
        return datetime.fromisoformat(raw).date()
    return datetime.strptime(raw[:10], "%Y-%m-%d").date()


def add_calendar_months(base: date, months: int) -> date:
    month_index = base.month - 1 + months
    year = base.year + month_index // 12
    month = month_index % 12 + 1
    max_day = calendar.monthrange(year, month)[1]
    return date(year, month, min(base.day, max_day))


def gestational_month_range(ddg: date, from_month: int, to_month: int) -> Tuple[date, date]:
    """Inclusive calendar range for gestational months counted from DDG."""
    start = add_calendar_months(ddg, from_month - 1)
    end = add_calendar_months(ddg, to_month) - timedelta(days=1)
    return start, end


def fr_sa_window(ddg: date, start_sa: int, end_sa: int, end_extra_days: int = 0) -> Tuple[date, date]:
    """
    CPAM SA window from DDG (début de grossesse).
    Start uses (SA - 1) * 7 - 14; end uses validated CPAM offsets for echo ranges.
    """
    start = ddg + timedelta(days=(start_sa - 1) * 7 - 14)
    end = ddg + timedelta(days=(end_sa - 1) * 7 - 14 + end_extra_days + 6)
    return start, end


# CPAM Ameli calendar offsets from DDG (validated against DDG 2026-04-01).
CPAM_ECHO_OFFSETS = {
    "apt_2": (56, 82),
    "apt_6": (119, 160),
    "apt_10": (189, 230),
}


def calculate_dpa(ddg: date, country: str, cycle_duration: int = 28) -> date:
    if country == COUNTRY_UK:
        adjustment = max(21, min(35, int(cycle_duration))) - 28
        return ddg + timedelta(days=280 + adjustment)
    return add_calendar_months(ddg, 9)


def calculate_maternity_leave(
    dpa: date,
    children_at_home: int = 0,
    multiple_pregnancy: str = "none",
) -> Dict[str, Any]:
    multi = str(multiple_pregnancy or "none").strip().lower()
    children = max(0, int(children_at_home or 0))

    if multi in {"twins", "jumeaux"}:
        prenatal_weeks, postnatal_weeks, scenario = 12, 22, "twins"
    elif multi in {"triplets_or_more", "triplets", "triple"}:
        prenatal_weeks, postnatal_weeks, scenario = 24, 22, "triplets_or_more"
    elif children >= 2:
        prenatal_weeks, postnatal_weeks, scenario = 8, 18, "third_child_plus"
    else:
        prenatal_weeks, postnatal_weeks, scenario = 6, 10, "first_or_second_child"

    prenatal_start = dpa - timedelta(days=prenatal_weeks * 7)
    postnatal_end = dpa + timedelta(days=postnatal_weeks * 7 - 1)

    return {
        "prenatal_start": prenatal_start,
        "postnatal_end": postnatal_end,
        "prenatal_weeks": prenatal_weeks,
        "postnatal_weeks": postnatal_weeks,
        "scenario": scenario,
    }


def _fr_cpam_appointments(ddg: date, dpa: date) -> List[Dict[str, Any]]:
    """Seven monthly exams + three echos + bilan (CPAM calendar)."""
    echo1_start, echo1_end = fr_sa_window(ddg, 11, 13, 6)
    echo2_start = ddg + timedelta(days=CPAM_ECHO_OFFSETS["apt_6"][0])
    echo2_end = ddg + timedelta(days=CPAM_ECHO_OFFSETS["apt_6"][1])
    echo3_start = ddg + timedelta(days=CPAM_ECHO_OFFSETS["apt_10"][0])
    echo3_end = ddg + timedelta(days=CPAM_ECHO_OFFSETS["apt_10"][1])

    exam1_start, exam1_end = gestational_month_range(ddg, 1, 3)
    exam2_start, exam2_end = gestational_month_range(ddg, 4, 4)
    exam3_start, exam3_end = gestational_month_range(ddg, 5, 5)
    exam4_start, exam4_end = gestational_month_range(ddg, 6, 6)
    exam5_start, exam5_end = gestational_month_range(ddg, 7, 7)
    exam6_start, exam6_end = gestational_month_range(ddg, 8, 8)
    exam7_start, exam7_end = gestational_month_range(ddg, 9, 9)
    bilan_start, bilan_end = gestational_month_range(ddg, 4, 9)

    return [
        {
            "id": "apt_1",
            "title": "1er examen prénatal",
            "description": "Du début de grossesse jusqu'à la fin du 3e mois",
            "type": "mandatory",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 0,
            "week_end": 12,
            "start_date": exam1_start,
            "end_date": exam1_end,
        },
        {
            "id": "apt_2",
            "title": "1re échographie (datation)",
            "description": "De 11 SA à 13 SA + 6 jours",
            "type": "mandatory",
            "professional": "Échographiste",
            "week_start": 11,
            "week_end": 13,
            "start_date": echo1_start,
            "end_date": echo1_end,
        },
        {
            "id": "apt_3",
            "title": "2e examen prénatal (4e mois)",
            "description": "Consultation du 4e mois civil de grossesse",
            "type": "mandatory",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 13,
            "week_end": 17,
            "start_date": exam2_start,
            "end_date": exam2_end,
        },
        {
            "id": "apt_4",
            "title": "3e examen prénatal (5e mois)",
            "description": "Consultation du 5e mois civil de grossesse",
            "type": "mandatory",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 17,
            "week_end": 21,
            "start_date": exam3_start,
            "end_date": exam3_end,
        },
        {
            "id": "apt_6",
            "title": "2e échographie (morphologique)",
            "description": "Au cours du 5e mois de grossesse",
            "type": "mandatory",
            "professional": "Échographiste",
            "week_start": 17,
            "week_end": 23,
            "start_date": echo2_start,
            "end_date": echo2_end,
        },
        {
            "id": "apt_5",
            "title": "4e examen prénatal (6e mois)",
            "description": "Consultation du 6e mois civil de grossesse",
            "type": "mandatory",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 21,
            "week_end": 25,
            "start_date": exam4_start,
            "end_date": exam4_end,
        },
        {
            "id": "apt_7",
            "title": "5e examen prénatal (7e mois)",
            "description": "Consultation du 7e mois civil de grossesse",
            "type": "mandatory",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 25,
            "week_end": 29,
            "start_date": exam5_start,
            "end_date": exam5_end,
        },
        {
            "id": "apt_10",
            "title": "3e échographie (croissance)",
            "description": "Au cours du 7e/8e mois de grossesse",
            "type": "mandatory",
            "professional": "Échographiste",
            "week_start": 27,
            "week_end": 33,
            "start_date": echo3_start,
            "end_date": echo3_end,
        },
        {
            "id": "apt_9",
            "title": "6e examen prénatal (8e mois)",
            "description": "Consultation du 8e mois civil de grossesse",
            "type": "mandatory",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 29,
            "week_end": 33,
            "start_date": exam6_start,
            "end_date": exam6_end,
        },
        {
            "id": "apt_11",
            "title": "7e examen prénatal (9e mois)",
            "description": "Consultation du 9e mois civil de grossesse",
            "type": "mandatory",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 33,
            "week_end": 40,
            "start_date": exam7_start,
            "end_date": exam7_end,
        },
        {
            "id": "apt_bilan",
            "title": "Bilan préventif & entretien pré-natal précoce",
            "description": "Dès le 4e mois de grossesse",
            "type": "recommended",
            "professional": "Gynécologue/Sage-femme",
            "week_start": 13,
            "week_end": 40,
            "start_date": bilan_start,
            "end_date": bilan_end,
        },
        {
            "id": "apt_8",
            "title": "Inscription maternité",
            "description": "Visite de la maternité, constitution du dossier",
            "type": "recommended",
            "professional": "Maternité",
            "week_start": 24,
            "week_end": 28,
            "start_date": ddg + timedelta(weeks=24),
            "end_date": ddg + timedelta(weeks=28),
        },
        {
            "id": "apt_13",
            "title": "Consultation anesthésiste",
            "description": "Rendez-vous obligatoire pour péridurale éventuelle",
            "type": "mandatory",
            "professional": "Anesthésiste",
            "week_start": 35,
            "week_end": 37,
            "start_date": ddg + timedelta(weeks=35),
            "end_date": ddg + timedelta(weeks=37),
        },
        {
            "id": "apt_14",
            "title": "Prélèvement vaginal",
            "description": "Dépistage streptocoque B",
            "type": "mandatory",
            "professional": "Laboratoire",
            "week_start": 35,
            "week_end": 37,
            "start_date": ddg + timedelta(weeks=35),
            "end_date": ddg + timedelta(weeks=37),
        },
    ]


def _uk_nhs_appointments(ddg: date) -> List[Dict[str, Any]]:
    """NHS antenatal schedule (week-based from DDG)."""
    specs = [
        ("apt_1", "Booking appointment", "Initial booking with midwife", 8, 10, "mandatory", "Midwife"),
        ("apt_2", "Dating scan", "NHS dating ultrasound", 11, 13, "mandatory", "Sonographer"),
        ("apt_4", "Routine antenatal", "Routine check-up", 16, 18, "mandatory", "Midwife"),
        ("apt_6", "Anomaly scan", "NHS anomaly scan (20-week scan)", 20, 22, "mandatory", "Sonographer"),
        ("apt_7", "Routine antenatal", "Routine check-up", 25, 27, "mandatory", "Midwife"),
        ("apt_9", "Routine antenatal", "Routine check-up", 28, 30, "mandatory", "Midwife"),
        ("apt_11", "Routine antenatal", "Routine check-up", 31, 33, "mandatory", "Midwife"),
        ("apt_12", "Routine antenatal", "Routine check-up", 34, 36, "mandatory", "Midwife"),
        ("apt_15", "Routine antenatal", "Routine check-up", 38, 39, "mandatory", "Midwife"),
        ("apt_18", "Routine antenatal", "Final antenatal check", 40, 41, "mandatory", "Midwife"),
    ]
    appointments: List[Dict[str, Any]] = []
    for apt_id, title, description, week_start, week_end, apt_type, professional in specs:
        appointments.append(
            {
                "id": apt_id,
                "title": title,
                "description": description,
                "type": apt_type,
                "professional": professional,
                "week_start": week_start,
                "week_end": week_end,
                "start_date": ddg + timedelta(weeks=week_start),
                "end_date": ddg + timedelta(weeks=week_end),
            }
        )
    return appointments


def build_medical_appointments(
    ddg: date,
    country: str,
    dpa: Optional[date] = None,
) -> List[Dict[str, Any]]:
    resolved_dpa = dpa or calculate_dpa(ddg, country)
    if country == COUNTRY_UK:
        return _uk_nhs_appointments(ddg)
    return _fr_cpam_appointments(ddg, resolved_dpa)


def current_gestational_week(ddg: date, on_date: Optional[date] = None) -> int:
    today = on_date or date.today()
    days = max(0, (today - ddg).days)
    return days // 7


def pregnancy_date_summary(
    ddg: date | datetime | str,
    country: str = COUNTRY_FR,
    cycle_duration: int = 28,
    children_at_home: int = 0,
    multiple_pregnancy: str = "none",
) -> Dict[str, Any]:
    ddg_date = parse_date(ddg)
    dpa = calculate_dpa(ddg_date, country, cycle_duration)
    maternity = calculate_maternity_leave(dpa, children_at_home, multiple_pregnancy)
    appointments = build_medical_appointments(ddg_date, country, dpa)

    return {
        "country": country,
        "ddg": ddg_date.isoformat(),
        "dpa": dpa.isoformat(),
        "maternity_leave": {
            "prenatal_start": maternity["prenatal_start"].isoformat(),
            "postnatal_end": maternity["postnatal_end"].isoformat(),
            "prenatal_weeks": maternity["prenatal_weeks"],
            "postnatal_weeks": maternity["postnatal_weeks"],
            "scenario": maternity["scenario"],
        },
        "appointments": appointments,
        "current_week": current_gestational_week(ddg_date),
    }


def resolve_pregnancy_country(city: str | None, explicit_country: str | None = None) -> str:
    if explicit_country:
        normalized = str(explicit_country).strip().upper()
        if normalized in {COUNTRY_FR, COUNTRY_UK, COUNTRY_BE}:
            return normalized
    return resolve_country_from_city(city)
