"""Unit tests for CPAM-aligned pregnancy date calculations."""
import os
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.pregnancy_country import COUNTRY_FR, COUNTRY_UK, resolve_country_from_city
from core.pregnancy_dates import (
    build_medical_appointments,
    calculate_dpa,
    calculate_maternity_leave,
    fr_sa_window,
    pregnancy_date_summary,
    resolve_pregnancy_country,
)


DDG = date(2026, 4, 1)
DPA = date(2027, 1, 1)


def test_paris_uses_france():
    assert resolve_country_from_city("Paris") == COUNTRY_FR


def test_london_uses_uk():
    assert resolve_country_from_city("Londres") == COUNTRY_UK
    assert resolve_country_from_city("London") == COUNTRY_UK


def test_france_dpa_is_ddg_plus_nine_months():
    assert calculate_dpa(DDG, COUNTRY_FR) == DPA


def test_cpam_echo_windows_for_ddg_april_first():
    echo1 = fr_sa_window(DDG, 11, 13, 6)
    assert echo1[0] == date(2026, 5, 27)
    assert echo1[1] == date(2026, 6, 22)

    appointments = build_medical_appointments(DDG, COUNTRY_FR, DPA)
    echo2 = next(item for item in appointments if item["id"] == "apt_6")
    echo3 = next(item for item in appointments if item["id"] == "apt_10")

    assert echo2["start_date"] == date(2026, 7, 29)
    assert echo2["end_date"] == date(2026, 9, 8)
    assert echo3["start_date"] == date(2026, 10, 7)
    assert echo3["end_date"] == date(2026, 11, 17)


def test_cpam_maternity_leave_for_dpa_january_first():
    first_child = calculate_maternity_leave(DPA, children_at_home=0, multiple_pregnancy="none")
    assert first_child["prenatal_start"] == date(2026, 11, 20)
    assert first_child["postnatal_end"] == date(2027, 3, 11)

    third_child = calculate_maternity_leave(DPA, children_at_home=2, multiple_pregnancy="none")
    assert third_child["prenatal_start"] == date(2026, 11, 6)
    assert third_child["postnatal_end"] == date(2027, 5, 6)

    twins = calculate_maternity_leave(DPA, children_at_home=0, multiple_pregnancy="twins")
    assert twins["prenatal_start"] == date(2026, 10, 9)
    assert twins["postnatal_end"] == date(2027, 6, 3)

    triplets = calculate_maternity_leave(DPA, children_at_home=0, multiple_pregnancy="triplets_or_more")
    assert triplets["prenatal_start"] == date(2026, 7, 17)
    assert triplets["postnatal_end"] == date(2027, 6, 3)


def test_uk_dpa_uses_naegele():
    assert calculate_dpa(DDG, COUNTRY_UK, 28) == date(2027, 1, 6)


def test_pregnancy_summary_country_from_city():
    summary_fr = pregnancy_date_summary(DDG, country=resolve_pregnancy_country("Paris"))
    assert summary_fr["dpa"] == "2027-01-01"
    assert summary_fr["country"] == COUNTRY_FR

    summary_uk = pregnancy_date_summary(DDG, country=resolve_pregnancy_country("London"))
    assert summary_uk["dpa"] == "2027-01-06"
    assert summary_uk["country"] == COUNTRY_UK
