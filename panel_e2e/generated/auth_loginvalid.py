"""E2E: Login with valid credentials."""

from __future__ import annotations

import os
from typing import Any

from playwright.async_api import Page

from panel_e2e.e2e_log import e2e_log
from panel_ui_helpers import dismiss_blocking_overlays
from panel_url import panel_origin


async def run_auth_loginvalid_flow(page: Page, form: dict[str, Any], **kwargs) -> dict[str, Any]:
    steps: list[str] = []
    error_msg: str | None = None
    
    try:
        email = os.getenv("SHIPMOZO_EMAIL", "").strip()
        password = os.getenv("SHIPMOZO_PASSWORD", "").strip()
        
        if not email or not password:
            return {
                "ok": False,
                "stepsRun": ["Missing SHIPMOZO_EMAIL or SHIPMOZO_PASSWORD environment variables"],
                "pageUrl": page.url,
                "uiText": "",
                "error": "Credentials not found in environment"
            }
        
        origin = await panel_origin(page)
        login_url = f"{origin.rstrip('/')}/login"
        
        steps.append(f"Navigate to login page: {login_url}")
        e2e_log("e2e", f"auth/loginValid — navigating to {login_url}")
        await page.goto(login_url, wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=10000)
        
        await dismiss_blocking_overlays(page)
        steps.append("Dismissed blocking overlays")
        
        steps.append(f"Fill email: {email}")
        email_input = page.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]').first
        await email_input.fill(email)
        
        steps.append("Fill password")
        password_input = page.locator('input[type="password"], input[name*="password" i]').first
        await password_input.fill(password)
        
        steps.append("Click login button")
        login_button = page.get_by_role("button", name=lambda n: n and ("login" in n.lower() or "sign in" in n.lower())).first
        await login_button.click()
        
        steps.append("Wait for navigation after login")
        await page.wait_for_load_state("networkidle", timeout=15000)
        
        current_url = page.url
        steps.append(f"Current URL after login: {current_url}")
        
        ui_text = ""
        try:
            ui_text = await page.inner_text("body", timeout=5000)
        except Exception:
            ui_text = ""
        
        is_logged_in = "/login" not in current_url.lower() and (
            "dashboard" in current_url.lower() or 
            "orders" in current_url.lower() or
            len(ui_text) > 200
        )
        
        if not is_logged_in:
            body_lower = ui_text.lower()
            if "invalid" in body_lower or "incorrect" in body_lower or "error" in body_lower:
                error_msg = "Login failed: Invalid credentials message detected"
            else:
                error_msg = "Login failed: Still on login page or unexpected redirect"
        
        steps.append(f"Login {'successful' if is_logged_in else 'failed'}")
        e2e_log("e2e", f"auth/loginValid — {'SUCCESS' if is_logged_in else 'FAILED'}")
        
        return {
            "ok": is_logged_in,
            "stepsRun": steps,
            "pageUrl": current_url,
            "uiText": ui_text[:4000],
            "error": error_msg
        }
        
    except Exception as e:
        error_msg = f"Exception during login: {str(e)}"
        steps.append(error_msg)
        e2e_log("error", error_msg)
        
        ui_text = ""
        try:
            ui_text = await page.inner_text("body", timeout=3000)
        except Exception:
            pass
        
        return {
            "ok": False,
            "stepsRun": steps,
            "pageUrl": page.url,
            "uiText": ui_text[:4000],
            "error": error_msg
        }