#!/usr/bin/env python3
from __future__ import annotations

import os
import pathlib
import re
import shutil
import sys

try:
    from playwright.sync_api import sync_playwright
except ModuleNotFoundError:
    alternate = pathlib.Path('/opt/pyvenv/bin/python')
    if alternate.exists() and pathlib.Path(sys.executable).resolve() != alternate.resolve():
        os.execv(str(alternate), [str(alternate), *sys.argv])
    raise

ROOT = pathlib.Path(__file__).resolve().parents[1]


def chromium_binary() -> str | None:
    for candidate in (
        os.environ.get("CHROMIUM_BIN"),
        "/usr/lib/chromium/chromium",
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
        shutil.which("google-chrome"),
    ):
        if candidate and pathlib.Path(candidate).exists():
            return str(candidate)
    return None


def source(relative: str) -> str:
    return (ROOT / relative).read_text(encoding="utf-8")


def harness_dom() -> str:
    html = source("tests/browser_harness.html")
    html = re.sub(r"\s*<script\b[^>]*>.*?</script>\s*", "\n", html, flags=re.I | re.S)
    html = re.sub(r"\s*<meta\s+http-equiv=\"Content-Security-Policy\"[^>]*>\s*", "\n", html, flags=re.I)
    html = re.sub(r"\s*<base\s+href=\"[^\"]*\"\s*/?>\s*", "\n", html, flags=re.I)
    return html


def main() -> int:
    errors: list[str] = []
    scripts = [
        "buildBootstrap.js",
        "core/backendCompatibility.js",
        "diagnostics/runtimeMonitor.js",
        "appLimits.js",
        "supabaseConfig.js",
        "tests/browser_harness_boot.js",
        "adminUsersApi.js",
        "activityTracker.js",
        "recovery/recoveryManager.js",
        "cloudProjects.js",
        "adminPanel.js",
    ]
    with sync_playwright() as playwright:
        executable = chromium_binary()
        launch_options = {
            "headless": True,
            "args": ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--disable-background-networking"],
        }
        if executable:
            launch_options["executable_path"] = executable
        browser = playwright.chromium.launch(**launch_options)
        context = browser.new_context()
        page = context.new_page()
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.set_content(harness_dom(), wait_until="domcontentloaded", timeout=30_000)
        page.evaluate("""() => {
          function makeStorage() {
            const values = new Map();
            return {
              get length() { return values.size; },
              key(index) { return Array.from(values.keys())[index] ?? null; },
              getItem(key) { key = String(key); return values.has(key) ? values.get(key) : null; },
              setItem(key, value) { values.set(String(key), String(value)); },
              removeItem(key) { values.delete(String(key)); },
              clear() { values.clear(); }
            };
          }
          Object.defineProperty(window, 'localStorage', { configurable: true, value: makeStorage() });
          Object.defineProperty(window, 'sessionStorage', { configurable: true, value: makeStorage() });
        }""")
        for relative in scripts:
            page.evaluate(source(relative))

        page.wait_for_function("document.getElementById('authMessage').textContent !== 'Oturum kontrol ediliyor…'", timeout=15_000)
        page.locator("#loginUsername").fill("admin")
        page.locator("#loginPassword").fill("1234")
        page.locator("#loginForm").evaluate("form => form.requestSubmit()")
        page.wait_for_function("document.body.classList.contains('auth-ready')", timeout=20_000)

        assert page.evaluate("window.PULUMUR_BUILD") == "10.4"
        assert page.locator("#adminPanelBtn").is_visible()
        assert "System Admin" in page.locator("#cloudUserName").inner_text()
        warning = page.locator("#backendWarningBanner")
        assert warning.is_visible()
        assert "migration" in warning.inner_text().lower()

        recovery = page.evaluate("""async () => {
          const snapshot = window.PulumurProjectState.createSnapshot();
          await window.PulumurRecovery.saveNow('user-1', snapshot, { projectCode: 'TEST', revisionNo: 1 });
          const found = await window.PulumurRecovery.latest('user-1');
          await window.PulumurRecovery.clear('user-1');
          return Boolean(found && found.snapshot && found.snapshot.schemaVersion === 2);
        }""")
        assert recovery is True

        redaction = page.evaluate("""() => {
          window.PulumurRuntimeMonitor.record('smoke', new Error('access_token=test-secret PIN=1234'));
          const text = JSON.stringify(window.PulumurRuntimeMonitor.report());
          return !text.includes('test-secret') && !text.includes('1234');
        }""")
        assert redaction is True
        assert not errors, "Browser page errors: " + " | ".join(errors)
        browser.close()

    print("Browser smoke passed: real Chromium DOM, compatibility-mode admin login, migration warning, recovery and redacted diagnostics.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
