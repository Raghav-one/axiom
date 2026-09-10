import fs from 'node:fs/promises';
import {parseFragment, serialize} from 'parse5';
import {load as loadHtml} from 'cheerio';
import {authored} from '../src/content/authored.mjs';
import {deepenChapter} from '../src/content/deepening.mjs';
import {expandFoundation} from '../src/content/foundation-expansions.mjs';
import {deepenComputing} from '../src/content/computing-depth.mjs';
import {deepenMathematics} from '../src/content/mathematics-depth.mjs';
import {deepenDataAndML} from '../src/content/data-ml-depth.mjs';
import {deepenAIMap} from '../src/content/ai-map-depth.mjs';
import {deepenLinearAlgebra} from '../src/content/linear-algebra-depth.mjs';
import {deepenCalculus} from '../src/content/calculus-depth.mjs';
import {domains} from '../src/catalog.mjs';
const frontier=JSON.parse(await fs.readFile('src/content/frontier.json','utf8'));
const standaloneGpu = await fs.readFile('gpu.html', 'utf8');
const gpuSections = [...standaloneGpu.matchAll(/<section class="sec" id="s(\d+)">([\s\S]*?)<\/section>/g)]
  .map(([, number, html]) => ({number: Number(number), html}))
  .sort((a, b) => a.number - b.number);
if (gpuSections.length !== 24) throw Error(`Expected 24 GPU handbook sections, found ${gpuSections.length}`);
const normalizeFragment = html => serialize(parseFragment(html));
const standardizeGpuSection = html => {
  const $ = loadHtml(normalizeFragment(html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/href="#s(\d+)"/g, 'href="#gpu-part-$1"')), null, false);
  $('script, style, canvas, button, input, form, svg').remove();
  $('*').removeAttr('id').removeAttr('style').removeAttr('onclick').removeAttr('onchange');
  $('div').each((_, element) => {
    const node = $(element);
    const className = node.attr('class') || '';
    if (/\b(gotcha|table-scroll|diagram-caption)\b/.test(className)) return;
    node.replaceWith(node.contents());
  });
  $('span').each((_, element) => $(element).replaceWith($(element).contents()));
  return $.root().html();
};
const gpuHandbookHtml = `<p>A complete hardware reference: the arithmetic, execution model, memory system, numerical formats, kernels, profiling, and distributed limits behind modern AI workloads.</p><div class="gpu-reference">${gpuSections.map(({number, html}) => `<div class="gpu-handbook-section" data-section="${number}">${standardizeGpuSection(html)}</div>`).join('')}</div>`;
const additions={
 'tokenization-data':[['Hugging Face: tokenization','https://huggingface.co/learn/llm-course/chapter6/5']],
 'red-teaming-robustness':[['OWASP GenAI Security Project','https://genai.owasp.org/']],
 'mechanistic-interpretability':[['Towards Monosemanticity','https://transformer-circuits.pub/2023/monosemantic-features/index.html']],
 'research-craft':[['Improving Reproducibility in Machine Learning','https://jmlr.org/papers/v22/20-303.html']]
};
const all=[...authored.map(deepenChapter).map(expandFoundation).map(deepenComputing).map(deepenMathematics).map(deepenDataAndML).map(deepenAIMap).map(deepenLinearAlgebra).map(deepenCalculus).map(chapter => chapter.id === 'gpu' ? {...chapter, html: gpuHandbookHtml} : chapter),...frontier].sort((a,b)=>domains.findIndex(d=>d.id===a.group)-domains.findIndex(d=>d.id===b.group));
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
