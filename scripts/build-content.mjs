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
  $('script, style, canvas, button, input, form').remove();
  // Each original plate depended on a canvas. Its screenshot is supplied separately
  // where useful; keeping its badge/caption after removing the canvas creates a stray duplicate.
  $('.plate').remove();
  $('.sec-num').remove();
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
const gpuVisuals = {
  1: `<figure class="gpu-diagram"><figcaption><span>ARCHITECTURE</span><strong>CPU and GPU spend silicon differently</strong></figcaption><div class="gpu-compare"><div><b>CPU core</b><i>control, cache, branch prediction</i><em>few fast threads</em></div><div><b>GPU array</b><i>many arithmetic lanes and schedulers</i><em>many concurrent threads</em></div></div><p>Latency optimization makes one dependency chain fast. Throughput optimization makes many independent chains finish together.</p></figure>`,
  7: `<figure class="gpu-diagram"><figcaption><span>MEMORY PATH</span><strong>Capacity increases as locality and speed decrease</strong></figcaption><div class="gpu-memory"><b>Registers</b><i>→</i><b>Shared memory / L1</b><i>→</i><b>L2 cache</b><i>→</i><b>HBM device memory</b><i>→</i><b>Host memory</b></div><p>Kernel design decides which values stay close enough to reuse before another HBM transaction is needed.</p></figure>`,
  11: `<figure class="gpu-diagram"><figcaption><span>ROOFLINE</span><strong>Arithmetic intensity chooses the bottleneck</strong></figcaption><div class="gpu-roofline"><div><b>Low intensity</b><span>bytes dominate</span><small>increase reuse and reduce traffic</small></div><div><b>High intensity</b><span>compute dominates</span><small>increase useful arithmetic utilization</small></div></div><p>Performance cannot exceed the lower of the memory-bandwidth roof and compute-throughput roof.</p></figure>`,
  12: `<figure class="gpu-diagram"><figcaption><span>GEMM TILING</span><strong>Reuse turns matrix multiply into a GPU workload</strong></figcaption><div class="gpu-tiles"><b>HBM tiles</b><i>→</i><b>shared-memory tiles</b><i>→</i><b>register fragments</b><i>→</i><b>matrix multiply-accumulate</b></div><p>Each smaller tile reuses values more times before fetching the next block from slower memory.</p></figure>`,
  13: `<figure class="gpu-diagram gpu-flash-diagram"><figcaption><span>FLASHATTENTION</span><strong>The score matrix is computed, never stored</strong></figcaption><div class="gpu-flash-paths"><div class="gpu-flash-path gpu-flash-standard"><b>Standard attention</b><span>HBM</span><i>QKᵀ</i><span>HBM</span><i>softmax</i><span>HBM</span><i>· V</i><small>Materializes an N × N score matrix and sends it back to memory between stages.</small></div><div class="gpu-flash-path gpu-flash-tiled"><b>FlashAttention</b><span>HBM</span><i>Q / K / V tiles</i><span>SRAM</span><i>online softmax + output tile</i><span>HBM</span><small>Keeps the working tile on-chip; only the final output returns to HBM.</small></div></div><p>FlashAttention computes the same softmax attention result. The performance gain comes from removing HBM round trips, not from approximating the operation.</p></figure>`,
  15: `<figure class="gpu-diagram"><figcaption><span>SCALE-OUT</span><strong>More devices create a communication schedule</strong></figcaption><div class="gpu-scale"><b>GPU 0</b><i>↔</i><b>GPU 1</b><i>↔</i><b>GPU 2</b><i>↔</i><b>GPU 3</b></div><p>Data, tensor, pipeline, and expert parallelism differ in which tensors cross these links and when synchronization blocks progress.</p></figure>`,
  18: `<figure class="gpu-diagram"><figcaption><span>MEMORY LEDGER</span><strong>Model weights are only the first allocation</strong></figcaption><div class="gpu-ledger"><b>weights</b><b>optimizer state</b><b>gradients</b><b>activations</b><b>KV cache</b><b>workspace</b></div><p>Capacity planning names each allocation, its dtype, lifetime, and whether it scales with parameters, batch, sequence length, or concurrency.</p></figure>`
};
const gpuSourceVisualSections = new Set([1, 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 16]);
const gpuHandbookHtml = `<p>A complete hardware reference: the arithmetic, execution model, memory system, numerical formats, kernels, profiling, and distributed limits behind modern AI workloads.</p><div class="gpu-reference">${gpuSections.map(({number, html}) => {
  const visual = gpuVisuals[number] || '';
  const sourceVisual = gpuSourceVisualSections.has(number) ? `<figure class="gpu-source-visual"><img src="/axiom/gpu-visuals/section-${number}.png" alt="GPU handbook visual for section ${number}" loading="lazy" /></figure>` : '';
  const section = standardizeGpuSection(html);
  return `<div class="gpu-handbook-section" data-section="${number}">${section.replace(/(<h2[^>]*>[\s\S]*?<\/h2>)/, `$1${sourceVisual}${visual}`)}</div>`;
}).join('')}</div>`;
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
