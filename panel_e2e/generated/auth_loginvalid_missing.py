"""E2E: Login with Valid Credentials."""

from __future__ import annotations

import os
from typing import Any

from playwright.async_api import Page

from panel_e2e.e2e_log import e2e_log
from panel_ui_helpers import dismiss_blocking_overlays
from panel_url import panel_origin


async def run_auth_loginvalid_missing_flow(page: Page, form: dict[str, Any], **kwargs) -> dict[str, Any]:
    steps: list[str] = []
    error: str | None = None
    ok = False

    try:
        origin = await panel_origin(page)
        email = os.getenv("SHIPMOZO_EMAIL", "")
        password = os.getenv("SHIPMOZO_PASSWORD", "")

        if not email or not password:
            error = "Missing SHIPMOZO_EMAIL or SHIPMOZO_PASSWORD env vars"
            steps.append(error)
            e2e_log("e2e", f"Login test failed: {error}")
            return {
                "ok": False,
                "stepsRun": steps,
                "pageUrl": page.url,
                "uiText": "",
                "error": error,
            }

        e2e_log("e2e", "Starting login test with valid credentials")
        steps.append("Navigate to login page")

        login_url = f"{origin.rstrip('/')}/login"
        await page.goto(login_url, wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=10000)
        steps.append(f"Opened {login_url}")

        await dismiss_blocking_overlays(page)

        email_input = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail" i]').first
        await email_input.wait_for(state="visible", timeout=5000)
        await email_input.fill(email)
        steps.append(f"Filled email: {email}")

        password_input = page.locator('input[type="password"], input[name="password"]').first
        await password_input.wait_for(state="visible", timeout=5000)
        await password_input.fill(password)
        steps.append("Filled password")

        login_button = page.get_by_role("button", name="Login").or_(
            page.get_by_role("button", name="Sign In")
        ).or_(page.locator('button[type="submit"]')).first
        await login_button.click()
        steps.append("Clicked login button")

        await page.wait_for_load_state("networkidle", timeout=15000)

        current_url = page.url.lower()
        if "/login" not in current_url and "/dashboard" in current_url or "/orders" in current_url or current_url == origin.lower().rstrip("/") + "/":
            ok = True
            steps.append("Login successful - redirected to dashboard")
            e2e_log("e2e", "Login successful")
        else:
            error = "Login failed - still on login page or unexpected redirect"
            steps.append(error)
            e2e_log("e2e", f"Login failed: {error}")

    except Exception as exc:
        error = f"Exception during login: {str(exc)}"
        steps.append(error)
        e2e_log("e2e", error)
        ok = False

    ui_text = ""
    try:
        ui_text = await page.inner_text("body")
    except Exception:
        pass

    return {
        "ok": ok,
        "stepsRun": steps,
        "pageUrl": page.url,
        "uiText": ui_text[:4000],
        "error": error,
    }