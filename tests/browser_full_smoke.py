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
        os.environ.get('CHROMIUM_BIN'),
        '/usr/lib/chromium/chromium',
        shutil.which('chromium'),
        shutil.which('chromium-browser'),
        shutil.which('google-chrome'),
    ):
        if candidate and pathlib.Path(candidate).exists():
            return str(candidate)
    return None


def source(relative: str) -> str:
    return (ROOT / relative).read_text(encoding='utf-8')


def application_dom() -> str:
    html = source('index.html')
    html = re.sub(r'\s*<script\b[^>]*>.*?</script>\s*', '\n', html, flags=re.I | re.S)
    html = re.sub(r'\s*<meta\s+http-equiv="Content-Security-Policy"[^>]*>\s*', '\n', html, flags=re.I)
    html = re.sub(r'\s*<link\s+rel="(?:stylesheet|preload|manifest|icon|apple-touch-icon)"[^>]*>\s*', '\n', html, flags=re.I)
    return html


def main() -> int:
    scripts = [
        'buildBootstrap.js',
        'core/backendCompatibility.js',
        'diagnostics/runtimeMonitor.js',
        'appLimits.js',
        'core/actions.js',
        'core/projectModel.js',
        'core/topologyReconcile.js',
        'core/validation.js',
        'core/reducer.js',
        'history/historyManager.js',
        'persistence/schema.js',
        'render/renderPipeline.js',
        'blocks/filteredBlocks.js',
        'peri01ExcelBridge.js',
        'peri01Geometry.js',
        'modernDxfTemplate.js',
        'dxfModernEngine.js',
        'supabaseConfig.js',
        'tests/full_app_harness_boot.js',
        'adminUsersApi.js',
        'activityTracker.js',
        'app.js',
        'recovery/recoveryManager.js',
        'cloudProjects.js',
        'adminPanel.js',
    ]
    errors: list[str] = []
    with sync_playwright() as playwright:
        executable = chromium_binary()
        launch_options = {
            'headless': True,
            'args': ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-background-networking'],
        }
        if executable:
            launch_options['executable_path'] = executable
        browser = playwright.chromium.launch(**launch_options)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.set_content(application_dom(), wait_until='domcontentloaded', timeout=30_000)
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
        page.locator('#loginUsername').fill('admin')
        page.locator('#loginPassword').fill('1234')
        page.locator('#loginForm').evaluate('form => form.requestSubmit()')
        page.wait_for_function("document.body.classList.contains('auth-ready')", timeout=20_000)

        fields = {
            '#width': '4000;4000;4000',
            '#opening': '4500;5200;6000',
            '#rearHeight': '3200;3300;3400',
            '#frontHeight': '2600',
            '#rayCount': '2;3;4',
            '#postCount': '4',
        }
        for selector, value in fields.items():
            page.locator(selector).fill(value)
            page.locator(selector).dispatch_event('change')
        page.locator('#previewBtn').click()
        page.wait_for_timeout(500)
        page.wait_for_selector('#preview svg', state='attached', timeout=30_000)

        before = page.evaluate("""() => {
          const stage = document.querySelector('#preview .preview-stage');
          const svg = stage.querySelector('svg');
          return { scale: parseFloat(stage.style.width) / svg.viewBox.baseVal.width, width: stage.style.width };
        }""")
        page.locator('#preview').dispatch_event('wheel', {'deltaY': -200, 'clientX': 500, 'clientY': 400})
        page.wait_for_timeout(100)
        zoomed = page.evaluate("""() => {
          const stage = document.querySelector('#preview .preview-stage');
          const svg = stage.querySelector('svg');
          return { scale: parseFloat(stage.style.width) / svg.viewBox.baseVal.width, width: stage.style.width };
        }""")
        assert zoomed['scale'] > before['scale']

        page.locator('#opening').fill('4600;5300;6100')
        page.locator('#opening').dispatch_event('input')
        page.wait_for_timeout(700)
        after = page.evaluate("""() => {
          const stage = document.querySelector('#preview .preview-stage');
          const svg = stage.querySelector('svg');
          return { scale: parseFloat(stage.style.width) / svg.viewBox.baseVal.width };
        }""")
        assert abs(after['scale'] - zoomed['scale']) / zoomed['scale'] < 0.03

        page.locator('#expandPreviewBtn').click()
        assert page.locator('.preview-panel').evaluate("panel => panel.classList.contains('is-expanded')") is True
        page.locator('#width').fill('4100;4000;3900')
        page.locator('#width').dispatch_event('input')
        page.wait_for_timeout(700)
        assert page.locator('.preview-panel').evaluate("panel => panel.classList.contains('is-expanded')") is True

        page.locator('#showAllDims').click()
        assert page.locator('#showAllDims').get_attribute('aria-expanded') == 'true'
        page.locator('[data-dim-filter="vertical"]').uncheck()
        assert page.locator('[data-dim-filter="vertical"]').is_checked() is False

        assert page.locator('#adminPanelBtn').is_visible()
        assert 'System Admin' in page.locator('#cloudUserName').inner_text()
        assert page.locator('#backendWarningBanner').is_visible()
        assert not errors, 'Browser page errors: ' + ' | '.join(errors)
        browser.close()

    print('Full browser smoke passed: complete app scripts, multi-position preview, zoom retention, expanded preview persistence, dimension filter and admin login.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
