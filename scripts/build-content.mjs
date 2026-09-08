import fs from 'node:fs/promises';
import {authored} from '../src/content/authored.mjs';
import {deepenChapter} from '../src/content/deepening.mjs';
import {expandFoundation} from '../src/content/foundation-expansions.mjs';
import {deepenComputing} from '../src/content/computing-depth.mjs';
import {deepenMathematics} from '../src/content/mathematics-depth.mjs';
import {deepenDataAndML} from '../src/content/data-ml-depth.mjs';
import {domains} from '../src/catalog.mjs';
const frontier=JSON.parse(await fs.readFile('src/content/frontier.json','utf8'));
const additions={
 'tokenization-data':[['Hugging Face: tokenization','https://huggingface.co/learn/llm-course/chapter6/5']],
 'red-teaming-robustness':[['OWASP GenAI Security Project','https://genai.owasp.org/']],
 'mechanistic-interpretability':[['Towards Monosemanticity','https://transformer-circuits.pub/2023/monosemantic-features/index.html']],
 'research-craft':[['Improving Reproducibility in Machine Learning','https://jmlr.org/papers/v22/20-303.html']]
};
const all=[...authored.map(deepenChapter).map(expandFoundation).map(deepenComputing).map(deepenMathematics).map(deepenDataAndML),...frontier].sort((a,b)=>domains.findIndex(d=>d.id===a.group)-domains.findIndex(d=>d.id===b.group));
const ids=new Set(all.map(x=>x.id));
if(ids.size!==all.length)throw Error('Duplicate chapter ids');
const clean=s=>s.replace(/<[^>]+>/g,' ').replace(/&[a-z#0-9]+;/gi,' ').replace(/\s+/g,' ').trim();
const manifest=[]; const search=[];
await fs.mkdir('public/content',{recursive:true});
for(const [i,a] of all.entries()){
 if(additions[a.id])a.sources=additions[a.id];
 for(const p of a.prerequisites)if(!ids.has(p))throw Error(`Missing prerequisite ${p}`);
 let k=0;
 a.html=a.html.replace(/<h2(?:\s[^>]*)?>/g,()=>`<h2 id="part-${++k}">`);
 a.headings=[...a.html.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map(m=>({id:m[1],title:clean(m[2])}));
 const text=clean(a.html);a.words=text.split(' ').length;a.minutes=Math.max(3,Math.ceil(a.words/190));a.number=String(i+1).padStart(2,'0');
 if(a.id==='gpu'){a.minutes=90;a.special='gpu';}
 const {html,...meta}=a;manifest.push(meta);search.push({id:a.id,text});
 await fs.writeFile(`public/content/${a.id}.json`,JSON.stringify(a));
}
await fs.writeFile('src/manifest.json',JSON.stringify(manifest));
await fs.writeFile('public/search-index.json',JSON.stringify(search));
console.log(`${all.length} chapters · ${domains.length} domains · ${manifest.reduce((s,x)=>s+x.words,0).toLocaleString()} words (plus GPU handbook)`);
