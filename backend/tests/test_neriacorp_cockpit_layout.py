"""Layout Cockpit MamanDouce pour le shell NeriaCorp (tenants B2C mobile)."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from integrations.neriacorp.catalog import get_portal_catalog_entry


def test_catalog_exposes_tenant_mobile_embed_url():
    entry = get_portal_catalog_entry()
    cockpit = entry["cockpit"]
    assert "tenant_mobile_embed_url" in cockpit
    assert cockpit["tenant_mobile_embed_url"].endswith("/embed/cockpit/tenant-dashboard")


def test_cockpit_layout_sections_order():
    import asyncio

    from routes.neriacorp_portal import neriacorp_cockpit_mamandouce_layout

    payload = asyncio.run(neriacorp_cockpit_mamandouce_layout())
    assert payload["zone"] == "B2C"
    assert "gestion des tenants" in payload["navigation_path"]
    ids = [s["id"] for s in payload["sections"]]
    assert ids[0] == "content_visuals"
    assert ids[1] == "community"
    assert payload["recommended_webview_url"] == payload["mobile"]["webview_body_url"]
