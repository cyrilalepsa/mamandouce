"""Tests SDK N2-Vault — injection RAM, aucun fichier, clé maître obligatoire."""
import io
import json
import os
import urllib.error
from pathlib import Path
from unittest.mock import patch

import pytest

from n2_vault_client import (
    VaultMasterKeyError,
    reset_sync_state,
    sync_secrets,
    vault_sync_url,
)


@pytest.fixture(autouse=True)
def _reset_vault(monkeypatch):
    reset_sync_state()
    monkeypatch.delenv("N2_VAULT_SYNC", raising=False)
    yield
    reset_sync_state()


def test_missing_master_key_raises(monkeypatch):
    monkeypatch.delenv("NERIACORP_MASTER_KEY", raising=False)
    monkeypatch.setenv("N2_VAULT_SYNC", "on")
    with pytest.raises(VaultMasterKeyError, match="NERIACORP_MASTER_KEY"):
        sync_secrets(force=True)


def test_vault_sync_off_skips_http(monkeypatch):
    monkeypatch.delenv("NERIACORP_MASTER_KEY", raising=False)
    monkeypatch.setenv("N2_VAULT_SYNC", "off")

    def _boom(*_a, **_k):
        raise AssertionError("HTTP ne doit pas être appelé si N2_VAULT_SYNC=off")

    with patch("n2_vault_client.urllib.request.urlopen", side_effect=_boom):
        assert sync_secrets(force=True) == 0


def test_sync_injects_empire_secrets_into_environ(monkeypatch, tmp_path):
    monkeypatch.setenv("NERIACORP_MASTER_KEY", "master-test-key")
    monkeypatch.setenv("N2_VAULT_SYNC", "on")
    monkeypatch.setenv("N2_VAULT_BASE_URL", "https://api.neriacorp.com")
    monkeypatch.chdir(tmp_path)

    payload = {
        "secrets": {
            "GEMINI_API_KEY": "gemini-from-vault",
            "GEMINI_VISION_MODEL": "gemini-2.0-flash",
            "CLOUDINARY_CLOUD_NAME": "neria-cloud",
            "CLOUDINARY_API_KEY": "ck",
            "CLOUDINARY_API_SECRET": "cs",
            "MONGO_URL": "mongodb://vault:27017",
            "NERIACORP_SSO_ISSUER": "https://api.neriacorp.com",
            "NERIACORP_SSO_LOGIN_URL": "https://api.neriacorp.com/api/auth/oauth/google/start",
        }
    }

    captured = {}

    class _Resp:
        status = 200

        def read(self):
            return json.dumps(payload).encode()

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    def fake_urlopen(request, timeout=12):
        captured["url"] = request.full_url
        captured["method"] = request.get_method()
        headers = {k.lower(): v for k, v in request.header_items()}
        captured["auth"] = headers.get("authorization", "")
        captured["master"] = headers.get("x-neriacorp-master-key", "")
        captured["body"] = json.loads(request.data.decode())
        return _Resp()

    with patch("n2_vault_client.urllib.request.urlopen", side_effect=fake_urlopen):
        count = sync_secrets(force=True)

    assert count == 8
    assert captured["url"].endswith("/api/v1/vault/sync")
    assert captured["method"] == "POST"
    assert captured["body"]["app_id"] == "mamandouce"
    assert "master-test-key" in (captured["auth"] or "")
    assert captured["master"] == "master-test-key"
    assert os.environ["GEMINI_API_KEY"] == "gemini-from-vault"
    assert os.environ["CLOUDINARY_CLOUD_NAME"] == "neria-cloud"
    assert os.environ["MONGO_URL"] == "mongodb://vault:27017"
    assert os.environ["NERIACORP_SSO_ISSUER"] == "https://api.neriacorp.com"
    # Aucun fichier secret écrit
    leftover = [p.name for p in tmp_path.iterdir() if p.is_file()]
    assert leftover == []
    assert not (tmp_path / ".env").exists()


def test_vault_drops_legacy_llm_alias(monkeypatch, tmp_path):
    legacy = "".join(("EME", "RGENT", "_LLM_KEY"))
    monkeypatch.setenv("NERIACORP_MASTER_KEY", "master-test-key")
    monkeypatch.setenv("N2_VAULT_SYNC", "on")
    monkeypatch.delenv(legacy, raising=False)
    monkeypatch.chdir(tmp_path)

    payload = {"secrets": {legacy: "legacy-should-drop", "OPENAI_API_KEY": "openai-from-vault"}}

    class _Resp:
        status = 200

        def read(self):
            return json.dumps(payload).encode()

        def __enter__(self):
            return self

        def __exit__(self, *exc):
            return False

    with patch("n2_vault_client.urllib.request.urlopen", return_value=_Resp()):
        count = sync_secrets(force=True)

    assert count == 1
    assert os.environ.get("OPENAI_API_KEY") == "openai-from-vault"
    assert os.environ.get(legacy) is None


def test_config_rereads_environ_after_vault(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "after-vault")
    monkeypatch.setenv("CLOUDINARY_CLOUD_NAME", "vault-cloud")
    monkeypatch.setenv("CLOUDINARY_API_KEY", "vk")
    monkeypatch.setenv("CLOUDINARY_API_SECRET", "vs")
    from core.config import load_settings
    import core.config as cfg

    load_settings()
    assert cfg.GEMINI_API_KEY == "after-vault"
    assert cfg.CLOUDINARY_CLOUD_NAME == "vault-cloud"
    assert cfg.CLOUDINARY_API_KEY == "vk"
    assert cfg.CLOUDINARY_API_SECRET == "vs"


def test_vault_sync_url_defaults_to_n2_worker(monkeypatch):
    monkeypatch.delenv("N2_VAULT_BASE_URL", raising=False)
    monkeypatch.delenv("N2_OCR_BASE_URL", raising=False)
    assert vault_sync_url() == "https://api.neriacorp.com/api/v1/vault/sync"


def test_http_error_surfaces_status(monkeypatch):
    monkeypatch.setenv("NERIACORP_MASTER_KEY", "k")
    monkeypatch.setenv("N2_VAULT_SYNC", "on")

    def fake_urlopen(request, timeout=12):
        import email.message

        raise urllib.error.HTTPError(
            request.full_url,
            503,
            "unavailable",
            hdrs=email.message.Message(),
            fp=io.BytesIO(b'{"detail":"N2-Vault non configur\\u00e9"}'),
        )

    with patch("n2_vault_client.urllib.request.urlopen", side_effect=fake_urlopen):
        with pytest.raises(RuntimeError, match="HTTP 503"):
            sync_secrets(force=True)


def test_boot_calls_sync_secrets_before_services():
    backend = Path(__file__).resolve().parents[1]
    server_src = (backend / "server.py").read_text(encoding="utf-8")
    main_src = (backend / "main.py").read_text(encoding="utf-8")
    assert "from n2_vault_client import sync_secrets" in server_src
    assert server_src.find("sync_secrets()") < server_src.find("from core.config")
    assert server_src.find("sync_secrets()") < server_src.find("from routes.")
    assert "sync_secrets()" in main_src
    assert main_src.find("sync_secrets()") < main_src.find("from server import app")
