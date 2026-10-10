#!/usr/bin/env python3
"""Assemble index.html (local / any static host) and dist/artifact.html (inline, for embedded preview)
from _parts/*.html + assets/*. Run: python3 build.py"""
from pathlib import Path
root = Path(__file__).parent
P = lambda n: (root / "_parts" / n).read_text(encoding="utf-8")
A = lambda n: (root / "assets" / n).read_text(encoding="utf-8")

FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&family=Saira:wght@500;600;700&display=swap">'
DESC = "Standard mold components that solve recurring mold problems (slide balancer, two-stage ejection, self-lube guiding) plus design-to-mold engineering."
views = [("home", "index.body.html"), ("products", "products.body.html"), ("product", "product.body.html"),
         ("services", "services.body.html"), ("rfq", "rfq.body.html")]
mains = "\n".join(f'<main data-view="{v}"{"" if v == "home" else " hidden"}>\n{P(f)}\n</main>' for v, f in views)
nav = P("nav.html")
footer = P("footer.html")
footer_noscript = footer.split("<script")[0]

local = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>NEXMOLD</title>
<meta name="description" content="{DESC}">
<meta name="theme-color" content="#0a0f1a">
{FONTS}
<link rel="stylesheet" href="assets/style.css">
</head>
<body>
{nav}
{mains}
{footer}
</body>
</html>
"""
(root / "index.html").write_text(local, encoding="utf-8")

artifact = f"""<title>NEXMOLD</title>
{FONTS}
<style>
{A("style.css")}
</style>
{nav}
{mains}
{footer_noscript}
<script>
{A("catalog.js")}
{A("main.js")}
</script>
"""
(root / "dist").mkdir(exist_ok=True)
(root / "dist" / "artifact.html").write_text(artifact, encoding="utf-8")
print(f"index.html {len(local)//1024} KB · dist/artifact.html {len(artifact)//1024} KB")
