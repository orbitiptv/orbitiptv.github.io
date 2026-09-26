"""Dependency-free checks run before the static site is deployed."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json

ROOT = Path(__file__).resolve().parents[1]
SIBLING_PROJECTS = {'Installation-Guide', 'Payment-Center', 'conventer', 'webplayer', 'playerweb', 'webplayer-v4-3'}
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        key = 'href' if tag in ('a', 'link') else 'src'
        raw = attrs.get(key, '')
        if not raw or raw.startswith(('#', 'mailto:', 'tel:', 'data:', 'javascript:')):
            return
        url = urlsplit(raw)
        if url.netloc and url.netloc != 'orbitiptv.github.io':
            return
        if not url.path:
            return
        route = unquote(url.path)
        if route.lstrip('/').split('/')[0] in SIBLING_PROJECTS:
            return
        target = ROOT / route.lstrip('/') if route.startswith('/') or url.netloc else self.path.parent / route
        if not target.exists():
            errors.append(f'{self.path.relative_to(ROOT)}: missing {raw}')

pages = [p for p in ROOT.rglob('*.html') if 'player-build' not in p.parts and not p.name.startswith('google')]
for page in pages:
    Page(page)
for language in ('en', 'sl', 'de', 'it', 'hr', 'bs', 'sr', 'fr', 'sq', 'mk'):
    data = json.loads((ROOT / 'locales' / f'{language}.json').read_text(encoding='utf-8'))
    assert len(data) > 1000, f'Incomplete dictionary: {language}'
    assert all(isinstance(value, str) and value for value in data.values())
json.loads((ROOT / 'site-english.json').read_text(encoding='utf-8'))
if errors:
    raise SystemExit('\n'.join(errors))
print(f'Validated {len(pages)} HTML pages, local links/assets and 10 translation dictionaries.')
