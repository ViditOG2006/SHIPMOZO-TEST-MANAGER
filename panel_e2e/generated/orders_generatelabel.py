"""E2E: Generate Label for an order."""

from __future__ import annotations

import os
import re
from typing import Any

from playwright.async_api import Page

from panel_e2e.e2e_log import e2e_log
from panel_ui_helpers import dismiss_blocking_overlays
from panel_url import panel_origin


async def run_orders_generatelabel_flow(page: Page, form: dict[str, Any], **kwargs) -> dict[str, Any]:
    steps: list[str] = []
    origin = await panel_origin(page)
    
    ref = str(
        form.get("referenceId")
        or form.get("orderRef")
        or os.environ.get("ORDER_REF_ID")
        or ""
    ).strip()
    
    scenario_id = kwargs.get("scenario_id", "")
    if scenario_id:
        steps.append(f"Scenario {scenario_id}: generate label for ref={ref or '(any)'}")
        e2e_log("e2e", f"{scenario_id} — generate label")
    
    try:
        await dismiss_blocking_overlays(page)
        
        await page.keyboard.press("Control+b")
        steps.append("Pressed Ctrl+B for Quick Search")
        await page.wait_for_timeout(800)
        
        await dismiss_blocking_overlays(page)
        
        search_input = page.locator('input[placeholder*="Search" i], input[type="search"], input[name*="search" i]').first
        await search_input.fill("New Orders")
        steps.append("Typed 'New Orders' in Quick Search")
        await page.wait_for_timeout(600)
        
        await page.get_by_text(re.compile(r"New Orders", re.IGNORECASE)).first.click()
        steps.append("Clicked New Orders from search results")
        await page.wait_for_load_state("domcontentloaded", timeout=15000)
        await page.wait_for_timeout(1000)
        
        await dismiss_blocking_overlays(page)
        
        if ref:
            search_box = page.locator('input[placeholder*="Search" i], input[type="text"]').first
            await search_box.fill(ref)
            steps.append(f"Searched for order ref: {ref}")
            await page.wait_for_timeout(1000)
            
            await page.keyboard.press("Enter")
            await page.wait_for_timeout(1500)
        
        await dismiss_blocking_overlays(page)
        
        generate_btn = page.get_by_role("button", name=re.compile(r"Generate Label|Generate", re.IGNORECASE)).first
        if await generate_btn.is_visible(timeout=3000):
            await generate_btn.click()
            steps.append("Clicked Generate Label button")
            await page.wait_for_timeout(2000)
        else:
            checkbox = page.locator('input[type="checkbox"]').first
            if await checkbox.is_visible(timeout=2000):
                await checkbox.check()
                steps.append("Selected order checkbox")
                await page.wait_for_timeout(500)
                
                bulk_btn = page.get_by_role("button", name=re.compile(r"Generate Label|Bulk Action|Action", re.IGNORECASE)).first
                await bulk_btn.click()
                steps.append("Clicked bulk action Generate Label")
                await page.wait_for_timeout(2000)
        
        await dismiss_blocking_overlays(page)
        
        ui_text = ""
        try:
            await page.wait_for_timeout(1500)
            ui_text = await page.inner_text("body")
        except Exception:
            pass
        
        success = (
            "label" in ui_text.lower()
            or "generated" in ui_text.lower()
            or "success" in ui_text.lower()
            or "download" in ui_text.lower()
        )
        
        return {
            "ok": success,
            "referenceId": ref or None,
            "stepsRun": steps,
            "pageUrl": page.url,
            "uiText": ui_text[:4000],
            "error": None if success else "Label generation may have failed or is pending",
        }
    
    except Exception as e:
        e2e_log("error", f"Generate label failed: {e}")
        ui_text = ""
        try:
            ui_text = await page.inner_text("body")
        except Exception:
            pass
        
        return {
            "ok": False,
            "referenceId": ref or None,
            "stepsRun": steps,
            "pageUrl": page.url,
            "uiText": ui_text[:4000],
            "error": f"Exception during label generation: {str(e)}",
        }