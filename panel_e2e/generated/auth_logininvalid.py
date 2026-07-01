"""E2E: Login with invalid credentials and verify error message."""

from __future__ import annotations

import os
from typing import Any

from playwright.async_api import Page

from panel_e2e.e2e_log import e2e_log
from panel_ui_helpers import dismiss_blocking_overlays
from panel_url import panel_origin


async def run_auth_logininvalid_flow(page: Page, form: dict[str, Any], **kwargs) -> dict[str, Any]:
    steps: list[str] = []
    origin = await panel_origin(page)
    
    invalid_email = form.get("email", "invalid@example.com")
    invalid_password = form.get("password", "WrongPassword123!")
    
    e2e_log("e2e", f"Login Invalid — testing with email={invalid_email}")
    steps.append(f"Testing login with invalid credentials: {invalid_email}")
    
    try:
        login_url = f"{origin.rstrip('/')}/login"
        steps.append(f"Navigate to login page: {login_url}")
        await page.goto(login_url, wait_until="domcontentloaded")
        await page.wait_for_load_state("networkidle", timeout=10000)
        
        await dismiss_blocking_overlays(page)
        steps.append("Dismissed any blocking overlays")
        
        email_input = page.get_by_role("textbox", name="email")
        if not await email_input.count():
            email_input = page.locator('input[type="email"]').first
        
        await email_input.fill(invalid_email)
        steps.append(f"Filled email: {invalid_email}")
        
        password_input = page.get_by_role("textbox", name="password")
        if not await password_input.count():
            password_input = page.locator('input[type="password"]').first
        
        await password_input.fill(invalid_password)
        steps.append("Filled invalid password")
        
        await dismiss_blocking_overlays(page)
        
        login_button = page.get_by_role("button", name="login")
        if not await login_button.count():
            login_button = page.get_by_role("button", name="sign in")
        if not await login_button.count():
            login_button = page.locator('button[type="submit"]').first
        
        await login_button.click()
        steps.append("Clicked login button")
        
        await page.wait_for_timeout(2000)
        
        ui_text = await page.inner_text("body")
        
        error_indicators = [
            "invalid",
            "incorrect",
            "wrong",
            "failed",
            "error",
            "not found",
            "does not exist",
            "authentication failed",
            "check your credentials",
        ]
        
        ui_lower = ui_text.lower()
        error_found = any(indicator in ui_lower for indicator in error_indicators)
        
        still_on_login = "/login" in page.url or "login" in ui_lower
        
        success = error_found or still_on_login
        
        if success:
            steps.append("Login correctly rejected with invalid credentials")
            error_msg = None
        else:
            steps.append("WARNING: Login may have succeeded with invalid credentials")
            error_msg = "Login did not show expected error message or remain on login page"
        
        return {
            "ok": success,
            "stepsRun": steps,
            "pageUrl": page.url,
            "uiText": ui_text[:4000],
            "error": error_msg,
        }
        
    except Exception as e:
        steps.append(f"Exception during login invalid flow: {str(e)}")
        e2e_log("error", f"Login Invalid failed: {e}")
        
        ui_text = ""
        try:
            ui_text = await page.inner_text("body")
        except Exception:
            pass
        
        return {
            "ok": False,
            "stepsRun": steps,
            "pageUrl": page.url,
            "uiText": ui_text[:4000],
            "error": str(e),
        }