# Concept A: read-only extraction of real lesson data into concept-a/data.js
# Run: python3 -I design-preview/concept-a/tools/gen_data.py  (from anywhere)
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
CONCEPT = os.path.dirname(HERE)
ROOT = os.path.dirname(os.path.dirname(CONCEPT))  # math5/
OUT = os.path.join(CONCEPT, 'data.js')
L = os.path.join(ROOT, 'learning-content')

def load(p):
    with open(p, encoding='utf-8') as f:
        return json.load(f)

idx = load(L + '/index.json')
lessons = []
for rel in idx['lessons']:
    d = load(L + '/' + rel)
    lessons.append({
        'id': d['id'], 'title': d['title'], 'topic': d['topic'],
        'minutes': d['estimatedMinutes'], 'summary': d['summary'],
        'papers': d['papers'], 'next': d.get('next'),
        'nExplanations': len(d['explanations']), 'nExamples': len(d['examples']),
        'nGuided': len(d.get('guidedPractice', [])), 'nPractice': len(d['independentPractice']),
        'nQuiz': len(d['quiz']) if isinstance(d.get('quiz'), list) else 0,
        'reviewStatus': d['review']['status'],
    })

tb = load(L + '/toolbox.json')
tblessons = {}
for fn in sorted(os.listdir(L + '/toolbox')):
    d = load(L + '/toolbox/' + fn)
    tblessons[d['id']] = {'id': d['id'], 'title': d['title'], 'minutes': d['estimatedMinutes']}
tools = []
for t in tb['tools']:
    ls = []
    for tp in t['topics']:
        if tp['lesson'] and tp['lesson'] not in ls:
            ls.append(tp['lesson'])
    tools.append({'num': t['num'], 'name': t['name'], 'glyph': t['glyph'],
                  'nTopics': len(t['topics']), 'nBuilt': sum(1 for x in t['topics'] if x['lesson']),
                  'lessons': [tblessons[x] for x in ls if x in tblessons]})

de = load(L + '/lessons/derivative-extrema.json')
ex4 = next(e for e in de['examples'] if e['id'] == 'ex4')
e5 = next(e for e in de['explanations'] if e['id'] == 'e5')
p5 = next(p for p in de['independentPractice'] if p['id'] == 'p5')
mistakes = {m['id']: m for m in de['commonMistakes']}

data = {
    'source': 'learning-content (read-only), extracted 2026-11-26',
    'lessons': lessons,
    'tools': tools,
    'deriv': {
        'id': de['id'], 'title': de['title'], 'minutes': de['estimatedMinutes'],
        'ex4': ex4, 'e5': e5,
        'practice': p5, 'practiceIndex': [p['id'] for p in de['independentPractice']].index('p5') + 1,
        'practiceTotal': len(de['independentPractice']),
        'mistakes': {k: mistakes[k] for k in ('x-vs-y', 'left-is-max', 'max-min', 'plug-derivative') if k in mistakes},
    },
}
with open(OUT, 'w', encoding='utf-8') as f:
    f.write('/* generated read-only from math5/learning-content by tools/gen_data.py - do not edit by hand */\n')
    f.write('window.LESSON_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print('ok', OUT)
