"""Layout Cockpit MamanDouce — contrats statiques (sans import app)."""
import os


def test_catalog_declares_tenant_mobile_embed():
    root = os.path.dirname(os.path.dirname(__file__))
    path = os.path.join(root, "integrations", "neriacorp", "catalog.py")
    with open(path, encoding="utf-8") as f:
        src = f.read()
    assert "tenant_mobile_embed_url" in src
    assert "/embed/cockpit/tenant-dashboard" in src


def test_cockpit_mamandouce_route_documents_b2c_tenant_path():
    root = os.path.dirname(os.path.dirname(__file__))
    path = os.path.join(root, "routes", "neriacorp_portal.py")
    with open(path, encoding="utf-8") as f:
        src = f.read()
    assert "gestion des tenants" in src
    assert "recommended_webview_url" in src
    assert 'id": "content_visuals"' in src or '"id": "content_visuals"' in src
