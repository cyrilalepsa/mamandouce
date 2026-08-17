"""Tests service Resend : logs, clé masquée, erreurs non avalées."""
import os
import sys
from unittest.mock import MagicMock, patch

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.email import mask_api_key, reload_email_settings, send_resend_email


def test_mask_api_key_empty():
    assert mask_api_key(None) == "<EMPTY>"
    assert mask_api_key("") == "<EMPTY>"
    assert mask_api_key("   ") == "<EMPTY>"


def test_mask_api_key_never_dumps_full_secret():
    secret = "re_abcdefghijklmnopqrstuvwxyz012345"
    masked = mask_api_key(secret)
    assert secret not in masked
    assert "re_abc" in masked
    assert "2345" in masked
    assert f"len={len(secret)}" in masked


def test_reload_email_settings_reads_env(monkeypatch):
    monkeypatch.setenv("RESEND_API_KEY", "re_testkey_abcdefghij")
    monkeypatch.setenv("SENDER_EMAIL", "noreply@neriacorp.com")
    monkeypatch.setenv("CONTACT_EMAIL", "contact@neriacorp.com")
    cfg = reload_email_settings()
    assert cfg["RESEND_API_KEY"] == "re_testkey_abcdefghij"
    assert cfg["SENDER_EMAIL"].endswith("@neriacorp.com")
    assert cfg["CONTACT_EMAIL"] == "contact@neriacorp.com"


def test_send_skipped_when_key_empty(monkeypatch, capsys):
    monkeypatch.setenv("RESEND_API_KEY", "")
    monkeypatch.setenv("SENDER_EMAIL", "noreply@neriacorp.com")
    result = send_resend_email(
        to="user@example.com",
        subject="Reset",
        html="<p>hi</p>",
        purpose="reset-password",
    )
    assert result["ok"] is False
    assert result["skipped"] is True
    assert "RESEND_API_KEY" in result["error"]
    out = capsys.readouterr().out
    assert "RESEND_API_KEY loaded=False" in out
    assert "masked=<EMPTY>" in out
    assert "to=user@example.com" in out
    assert "from=MamanDouce <noreply@neriacorp.com>" in out
    assert "SKIP" in out


def test_send_skipped_when_recipient_empty(monkeypatch, capsys):
    monkeypatch.setenv("RESEND_API_KEY", "re_abcdefghijklmnopqrstuvwxyz")
    result = send_resend_email(
        to="  ",
        subject="Reset",
        html="<p>hi</p>",
        purpose="reset-password",
    )
    assert result["ok"] is False
    assert result["skipped"] is True
    assert "destinataire" in result["error"]
    assert "to=" in capsys.readouterr().out


def test_send_success_logs_resend_return(monkeypatch, capsys):
    monkeypatch.setenv("RESEND_API_KEY", "re_abcdefghijklmnopqrstuvwxyz")
    monkeypatch.setenv("SENDER_EMAIL", "noreply@neriacorp.com")
    fake_resend = MagicMock()
    fake_resend.Emails.send.return_value = {"id": "msg_123"}

    with patch.dict("sys.modules", {"resend": fake_resend}):
        result = send_resend_email(
            to="user@example.com",
            subject="Reset",
            html="<p>hi</p>",
            purpose="reset-password",
        )

    assert result["ok"] is True
    assert result["result"] == {"id": "msg_123"}
    fake_resend.Emails.send.assert_called_once()
    payload = fake_resend.Emails.send.call_args[0][0]
    assert payload["from"] == "MamanDouce <noreply@neriacorp.com>"
    assert payload["to"] == ["user@example.com"]
    assert payload["from"].endswith("@neriacorp.com>")
    out = capsys.readouterr().out
    assert "Resend API returned" in out
    assert "msg_123" in out
    assert "re_abcdefghijklmnopqrstuvwxyz" not in out


def test_send_exception_is_logged_not_swallowed(monkeypatch, capsys):
    monkeypatch.setenv("RESEND_API_KEY", "re_abcdefghijklmnopqrstuvwxyz")
    monkeypatch.setenv("SENDER_EMAIL", "noreply@neriacorp.com")
    fake_resend = MagicMock()
    fake_resend.Emails.send.side_effect = RuntimeError("only send testing emails to your own")

    with patch.dict("sys.modules", {"resend": fake_resend}):
        result = send_resend_email(
            to="user@example.com",
            subject="Reset",
            html="<p>hi</p>",
            purpose="reset-password",
        )

    assert result["ok"] is False
    assert result["skipped"] is False
    assert "RuntimeError" in result["error"]
    assert "only send testing emails" in result["error"]
    out = capsys.readouterr().out
    assert "Resend exception" in out
    assert "RuntimeError" in out


def test_warns_when_from_not_neriacorp(monkeypatch, capsys):
    monkeypatch.setenv("RESEND_API_KEY", "")
    monkeypatch.setenv("SENDER_EMAIL", "noreply@example.com")
    send_resend_email(
        to="user@example.com",
        subject="Reset",
        html="<p>hi</p>",
        purpose="reset-password",
    )
    out = capsys.readouterr().out
    assert "neriacorp_ok=False" in out
    assert "does not end with @neriacorp.com" in out
