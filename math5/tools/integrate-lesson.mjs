// מחבר שיעור חדש לאפליקציה לפי learning-content/integration/<id>.json (כתוב על ידי בונה השיעור).
// הרצה: node tools/integrate-lesson.mjs <id> [<id> ...]
// עורך: index.json או toolbox.json (רשימת שיעורים, קישור נושאים, דרישות קדם), curriculum.js (lessons לנושא),
// knowledge-map.json (lessons למיומנויות), exam-skills.json (מיומנויות חדשות), ושרשרת next.
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const P = f => resolve(ROOT, f);
const rj = f => JSON.parse(readFileSync(P(f), 'utf8'));
const wj = (f, d) => writeFileSync(P(f), JSON.stringify(d, null, 2) + '\n');

for (const id of process.argv.slice(2)) {
  const I = rj(`learning-content/integration/${id}.json`);
  const kind = I.kind || 'lesson';
  const lessonPath = `learning-content/${I.file}`;
  const L = rj(lessonPath);
  if (L.id !== id) throw new Error(`${id}: id בקובץ השיעור הוא ${L.id}`);

  if (kind === 'lesson') {
    const idx = rj('learning-content/index.json');
    if (!idx.lessons.includes(I.file)) {
      const after = I.insertAfter ? idx.lessons.indexOf(`lessons/${I.insertAfter}.json`) : -1;
      idx.lessons.splice(after >= 0 ? after + 1 : idx.lessons.length, 0, I.file);
      wj('learning-content/index.json', idx);
    }
    // שרשרת "השיעור הבא": השיעור שלפני מצביע על החדש, והחדש על מה שהיה אחריו
    if (I.insertAfter) {
      const prevPath = `learning-content/lessons/${I.insertAfter}.json`;
      const prev = rj(prevPath);
      if (prev.next !== id) { if (!L.next && prev.next) { L.next = prev.next; wj(lessonPath, L); } prev.next = id; wj(prevPath, prev); }
    }
    const tb = rj('learning-content/toolbox.json');
    if (I.prereqs) { tb.lessonPrereqs[id] = I.prereqs; wj('learning-content/toolbox.json', tb); }
    // curriculum.js: מוסיפים את השיעור לרשימת השיעורים של הנושא
    if (I.curriculumTopic) {
      let s = readFileSync(P('js/data/curriculum.js'), 'utf8');
      const re = new RegExp(`(\\{ id: '${I.curriculumTopic}',[^\\n]*)`);
      const m = s.match(re);
      if (!m) throw new Error(`${id}: נושא ${I.curriculumTopic} לא נמצא ב-curriculum.js`);
      let line = m[1];
      if (/lessons: \[([^\]]*)\]/.test(line)) {
        if (!line.includes(`'${id}'`)) line = line.replace(/lessons: \[([^\]]*)\]/, (_, l) => `lessons: [${l ? l + ', ' : ''}'${id}']`);
      } else line = line.replace(/(confidence: '[^']*',)/, `$1 lessons: ['${id}'],`);
      s = s.replace(m[1], line);
      writeFileSync(P('js/data/curriculum.js'), s);
    }
  } else if (kind === 'toolbox') {
    const tb = rj('learning-content/toolbox.json');
    if (!tb.lessons.includes(I.file)) tb.lessons.push(I.file);
    for (const t of tb.tools.flatMap(x => x.topics)) if ((I.toolboxTopics || []).includes(t.id)) t.lesson = id;
    wj('learning-content/toolbox.json', tb);
  }

  if ((I.knowledgeMapSkills || []).length) {
    // עריכה שורה-שורה כדי לשמור על הפורמט הקומפקטי של הקובץ (מיומנות בשורה)
    let s = readFileSync(P('learning-content/knowledge-map.json'), 'utf8');
    for (const sid of I.knowledgeMapSkills) {
      const re = new RegExp(`^(\\s*\\{ "id": "${sid}",.*?)( \\},?)$`, 'm');
      const m = s.match(re);
      if (!m) throw new Error(`${id}: מיומנות ${sid} לא נמצאה במפת הידע`);
      let line = m[1];
      if (/"lessons": \[([^\]]*)\]/.test(line)) { if (!line.includes(`"${id}"`)) line = line.replace(/"lessons": \[([^\]]*)\]/, (_, l) => `"lessons": [${l ? l + ', ' : ''}"${id}"]`); }
      else line += `, "lessons": ["${id}"]`;
      s = s.replace(m[0], line + m[2]);
    }
    JSON.parse(s);
    writeFileSync(P('learning-content/knowledge-map.json'), s);
  }
  if (I.newSkills && Object.keys(I.newSkills).length) {
    const ex = rj('learning-content/exam-skills.json');
    for (const [k, v] of Object.entries(I.newSkills)) if (!ex.skills[k]) ex.skills[k] = v;
    wj('learning-content/exam-skills.json', ex);
  }
  console.log(`✓ ${id} חובר (${kind})`);
}
