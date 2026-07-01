"""
AI-generated E2E script for: {FLOW_ID}
Auto-created by the AI Script Writer. Review and edit as needed.
"""

from __future__ import annotations

import asyncio
import re
from typing import Any

from playwright.async_api import Page
from panel_e2e.e2e_log import e2e_log
from panel_ui_helpers import dismiss_blocking_overlays
from panel_url import panel_origin


async def run_{SAFE_FLOW_ID}_flow(page: Page, form: dict[str, Any], **kwargs) -> dict[str, Any]:
    """Generated E2E flow for: {FLOW_LABEL}"""
    scenario_id = kwargs.get("scenario_id", "")
    steps: list[str] = []
    origin = await panel_origin(page)

    if scenario_id:
        e2e_log("e2e", f"{scenario_id} — running {FLOW_LABEL}")
    steps.append(f"Starting flow: {FLOW_LABEL}")

    try:
        # --- AI-GENERATED NAVIGATION ---
        # Navigate to the target page via Quick Search (Ctrl+B)
        await dismiss_blocking_overlays(page)
        steps.append("Dismissed overlays")

        await page.keyboard.press("Control+b")
        await asyncio.sleep(0.1)

        search_input = page.get_by_placeholder(re.compile("quick search|search pages", re.I))
        if await search_input.count() > 0:
            await search_input.first.fill("{SEARCH_QUERY}")
            await asyncio.sleep(0.15)
            result = page.get_by_text(re.compile("{SEARCH_RESULT}", re.I))
            if await result.count() > 0:
                await result.first.click(timeout=3000)
                await asyncio.sleep(0.5)
                steps.append("Navigated via Quick Search")
            else:
                await page.keyboard.press("Escape")
                steps.append("Quick Search result not found — navigating by URL")
                await page.goto(f"{origin}/{TARGET_URL_PATH}", wait_until="domcontentloaded")
        else:
            await page.goto(f"{origin}/{TARGET_URL_PATH}", wait_until="domcontentloaded")
            steps.append("Navigated by URL")

        await asyncio.sleep(0.5)

        # --- AI-GENERATED TEST ACTIONS ---
        # TODO: AI will replace this section with the actual test steps
        # after observing the page during the first run.
        body = await page.inner_text("body")
        steps.append(f"Page loaded: {page.url}")

        # Verify expected content is present
        verify_texts = ["{VERIFY_TEXT_1}", "{VERIFY_TEXT_2}"]
        found_texts = [t for t in verify_texts if t.lower() in body.lower()]
        ok = len(found_texts) > 0

        ui_text = body[:4000]

        return {
            "ok": ok,
            "stepsRun": steps,
            "pageUrl": page.url,
            "uiText": ui_text,
            "error": None if ok else f"Expected markers not found on page: {verify_texts}",
        }

    except Exception as exc:
        e2e_log("e2e", f"Flow {FLOW_LABEL} failed: {exc}")
        return {
            "ok": False,
            "error": str(exc),
            "stepsRun": steps,
            "pageUrl": page.url,
        }
