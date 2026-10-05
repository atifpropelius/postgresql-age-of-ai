import {slides,exercises} from '../src/slides.js';
import {curriculum,studyCount} from '../src/curriculum.js';
import {walkthroughs} from '../src/walkthroughs.js';
import {readFileSync,writeFileSync} from 'node:fs';
const esc=s=>s.replaceAll('|','/');
const minutes=slides.reduce((n,x)=>n+x.minutes,0);
let guide=`# PostgreSQL in the Age of AI — zero-to-hero guide\n\nThis is the full study route behind the **${slides.length}-screen, ${minutes}-minute** talk. It contains **${studyCount} original lessons** in dependency order, including ${Object.keys(walkthroughs).length} guided experiments, followed by ${exercises.length} exercises in the interactive deck. Follow one lesson at a time: read the model, inspect the mechanism, type the example into a disposable PostgreSQL database when its referenced tables exist, then explain the production decision and common mistake in your own words. Examples are teaching fragments; some require tables introduced in earlier lessons.\n\nThe main presentation stays concise. The interactive **Study path** reader exposes these lessons, SQL/commands and primary references on every screen.\n\n## Prepare a disposable study database\n\nThe small schema in \`demo/study-schema.sql\` supplies agencies, donors, users, accounts, orders, donations, events and documents for the worked SQL. Keep it separate from production and from the optional million-row performance lab.\n\n\`\`\`bash\ncreatedb learning\npsql -d learning -f demo/study-schema.sql\npsql -d learning\n\`\`\`\n\nIn each new \`psql\` session, run \`SET search_path TO study, public;\` before the unqualified lesson queries. Use \`\\dt\` to inspect the tables. \`createdb\` and \`psql\` use your normal PostgreSQL connection environment variables. Examples that create objects or mutate rows should be run in this disposable database; some examples are conceptual or require optional extensions.\n\n`;
let map='\n## Full zero-to-hero study route\n\n| Screen | Main topic | Study lessons | Coverage |\n|---:|---|---:|---|\n';
let sources='\n## Study lesson source register\n\nThe original route was reviewed 2026-10-02; new foundation lessons were reviewed 2026-10-05. These technical claims map to primary project documentation. The supplied Zero-to-100 deck and System Design Crash Course informed scope and sequence; the wording and examples here are original. “Main” means the lesson is introduced on the timed screen; “Deep” means the full lesson is in Study path; “Demo” marks a related real local demo when configured.\n\n| Topic | Source | Source URL | Last reviewed | Confidence | Main | Deep | Demo |\n|---|---|---|---|---|---|---|---|\n';
const demos=new Set(['lab','explain','index','transactions','vacuum','pgvector','rag']);
const interpretive=new Set(['PostgreSQL versus other data systems','Choosing PostgreSQL honestly','From one database to many','Serverless versus managed instance versus self-host','Choose hosting and size from evidence','Hybrid retrieval','Failure modes of AI retrieval']);
slides.forEach((slide,i)=>{
 const items=curriculum[slide.id];if(!items?.length)throw Error(`Missing study content for ${slide.id}`);
 guide+=`## ${i+1}. ${slide.title}\n\n**Talk focus:** ${slide.lead}\n\n`;
 map+=`| ${i+1} | ${esc(slide.title)} | ${items.length} | ${items.map(x=>esc(x.title)).join('; ')} |\n`;
 items.forEach((x,j)=>{
  for(const key of ['title','model','mechanics','sql','decision','pitfall','source'])if(!x[key])throw Error(`Missing ${key} for ${slide.id} lesson ${j}`);
  guide+=`### ${i+1}.${j+1} ${x.title}\n\n**What it means.** ${x.model}\n\n${x.why?`**Why it matters.** ${x.why}\n\n`:''}**How it works.** ${x.mechanics}\n\n${walkthroughs[x.title]?`**Walk through it.** ${walkthroughs[x.title].question}\n\n${walkthroughs[x.title].steps.map((step,n)=>`${n+1}. ${step}`).join('\n')}\n\n**Observe.** ${walkthroughs[x.title].observe}\n\n**Decision.** ${walkthroughs[x.title].decision}\n\n`:''}**Example**\n\n\`\`\`sql\n${x.sql}\n\`\`\`\n\n**Production decision.** ${x.decision}\n\n**Common mistake.** ${x.pitfall}\n\n**Primary source:** ${x.source}\n\n`;
  const provider=x.source.includes('supabase.com')?'Supabase docs':x.source.includes('github.com')?'pgvector docs':x.source.includes('amazonaws.com')?'AWS RDS docs':x.source.includes('neon.com')?'Neon docs':'PostgreSQL docs';
  sources+=`| ${esc(x.title)} | ${provider} | ${x.source} | ${x.reviewed||'2026-10-02'} | ${interpretive.has(x.title)?'Medium':'High'} | ${j===0?'Y':'N'} | Y | ${j===0&&demos.has(slide.id)?'Y':'N'} |\n`;
 });
});
writeFileSync('docs/ZERO-TO-HERO-GUIDE.md',guide);
for(const [file,marker,addition] of [['docs/CONTENT-MAP.md','## Full zero-to-hero study route',map],['docs/SOURCE-MAP.md','## Study lesson source register',sources]]){
 const base=readFileSync(file,'utf8').split(marker)[0].trimEnd();writeFileSync(file,base+'\n'+addition);
}
console.log(`${slides.length} screens, ${studyCount} lessons, ${exercises.length} exercises, ${minutes} minutes`);
