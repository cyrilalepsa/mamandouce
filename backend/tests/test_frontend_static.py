"""Découverte du build SPA pour un déploiement FastAPI unique."""
import os
import sys
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from core.frontend_static import discover_frontend_dir, frontend_dir_candidates


def test_candidates_include_env_and_repo_frontend_dist():
    root = Path("/tmp/md-backend")
    names = [str(p) for p in frontend_dir_candidates(root=root, environ={"FRONTEND_DIR": "/opt/spa"})]
    assert names[0] == "/opt/spa"
    assert str(root / "dist") in names
    assert str(root.parent / "frontend" / "dist") in names


def test_discover_requires_index_html(tmp_path):
    empty = tmp_path / "dist"
    empty.mkdir()
    assert discover_frontend_dir(root=tmp_path, environ={}) is None
    (empty / "index.html").write_text("<!doctype html>", encoding="utf-8")
    found = discover_frontend_dir(root=tmp_path, environ={})
    assert found == empty.resolve()


def test_env_frontend_dir_wins(tmp_path):
    other = tmp_path / "other"
    other.mkdir()
    (other / "index.html").write_text("<!doctype html>", encoding="utf-8")
    found = discover_frontend_dir(root=tmp_path / "backend", environ={"FRONTEND_DIR": str(other)})
    assert found == other.resolve()
