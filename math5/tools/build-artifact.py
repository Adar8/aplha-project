# בונה עותק לפרסום שבו לכל קובץ JS/CSS יש מספר גרסה בכתובת (?v=...), כדי שהדפדפן לא יציג גרסה ישנה מהמטמון.
import os, re, shutil, subprocess, json, sys
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = sys.argv[2] if len(sys.argv) > 2 else os.path.join(SRC, 'dist')
ver = subprocess.check_output(['git', '-C', SRC, 'rev-parse', '--short', 'HEAD']).decode().strip() + '-' + sys.argv[1]
if os.path.isdir(DIST): shutil.rmtree(DIST)
shutil.copytree(SRC, DIST, ignore=shutil.ignore_patterns('tests', 'docs', 'tools', 'dist', 'node_modules', '*.md', 'package.json'))
imp = re.compile(r"""(from\s+|import\s*\(\s*)(['"])(\.{1,2}/[^'"]+?\.js)\2""")
for root, _, files in os.walk(os.path.join(DIST, 'js')):
    for f in files:
        if f.endswith('.js'):
            p = os.path.join(root, f); s = open(p, encoding='utf-8').read()
            s = imp.sub(lambda m: f"{m.group(1)}{m.group(2)}{m.group(3)}?v={ver}{m.group(2)}", s)
            open(p, 'w', encoding='utf-8').write(s)
s = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
for a in ['design-tokens.css', 'styles.css', 'js/app.js']:
    s = s.replace(f'"{a}"', f'"{a}?v={ver}"')
head = s[s.index('<head>')+6:s.index('</head>')]; body = s[s.index('<body>')+6:s.index('</body>')]
head = head.replace('<meta charset="utf-8">', '').replace('<meta name="viewport" content="width=device-width, initial-scale=1">', '')
open(os.path.join(DIST, 'page.html'), 'w', encoding='utf-8').write(head.strip() + '\n<script>document.documentElement.lang="he";document.documentElement.dir="rtl";</script>\n<div dir="rtl" lang="he">' + body + '</div>\n')
files = {}
for root, _, fs in os.walk(DIST):
    for f in fs:
        full = os.path.join(root, f); rel = os.path.relpath(full, DIST)
        if rel in ('page.html', 'index.html'): continue
        files[rel] = full
json.dump(files, open(os.path.join(os.path.dirname(DIST), 'dist-files.json'), 'w'))
print(ver, len(files))
