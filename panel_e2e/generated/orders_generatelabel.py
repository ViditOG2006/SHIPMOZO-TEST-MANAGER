"""E2E: Generate label for an order."""

from __future__ import annotations

import os
import re
from typing import Any

from playwright.async_api import Page

from panel_e2e.e2e_log import e2e_log
from panel_orders import goto_new_orders_domestic, search_new_orders
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
        await goto_new_orders_domestic(page, origin)
        steps.append("Opened New Orders (Forward/Domestic/New)")
        
        if not ref:
            steps.append("No order ref provided — taking first order from list")
            await page.wait_for_timeout(1000)
            row = page.locator("table tbody tr").first
            await row.wait_for(state="visible", timeout=5000)
        else:
            found = await search_new_orders(page, ref)
            if not found:
                return {
                    "ok": False,
                    "stepsRun": steps,
                    "pageUrl": page.url,
                    "uiText": await page.inner_text("body"),
                    "error": f"Order {ref} not found in New Orders list",
                }
            steps.append(f"Found order {ref}")
            await dismiss_blocking_overlays(page)
            row = page.locator(f"table tbody tr:has-text('{ref}')").first
            await row.wait_for(state="visible", timeout=5000)
        
        generate_btn = row.get_by_role("button", name=re.compile(r"generate|label", re.I))
        if not await generate_btn.count():
            generate_btn = row.locator("button:has-text('Generate')").or_(
                row.locator("button:has-text('Label')")
            ).first
        
        await dismiss_blocking_overlays(page)
        await generate_btn.click()
        steps.append(f"Clicked 'Generate Label' button for {ref}")
        
        await page.wait_for_timeout(2000)
        await dismiss_blocking_overlays(page)
        
        success_indicator = page.get_by_text(re.compile(r"label.*generated|success|created", re.I))
        label_visible = await success_indicator.count() > 0
        
        if not label_visible:
            download_btn = page.get_by_role("button", name=re.compile(r"download|print", re.I))
            label_visible = await download_btn.count() > 0
        
        if label_visible:
            steps.append("Label generated successfully")
        else:
            steps.append("Waiting for label generation confirmation...")
            await page.wait_for_timeout(3000)
        
        ui_text = await page.inner_text("body")
        
        return {
            "ok": True,
            "referenceId": ref,
            "stepsRun": steps,
            "pageUrl": page.url,
            "uiText": ui_text[:4000],
            "error": None,
        }
        
    except Exception as e:
        error_msg = f"Generate label failed: {str(e)}"
        steps.append(error_msg)
        e2e_log("error", error_msg)
        
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
            "error": error_msg,
        }