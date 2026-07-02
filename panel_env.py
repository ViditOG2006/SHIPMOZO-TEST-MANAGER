"""Target webapp env vars — generic names with legacy SHIPMOZO_* fallbacks."""

from __future__ import annotations

import os


def _first(*keys: str) -> str:
    for key in keys:
        value = os.getenv(key, "").strip()
        if value:
            return value
    return ""


def panel_url() -> str:
    return _first("TARGET_APP_URL", "SHIPMOZO_PANEL_URL")


def panel_email() -> str:
    return _first("TARGET_APP_EMAIL", "SHIPMOZO_EMAIL")


def panel_password() -> str:
    return _first("TARGET_APP_PASSWORD", "SHIPMOZO_PASSWORD")
