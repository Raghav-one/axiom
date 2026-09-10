import React from 'react';

function splitChapter(html) {
  const marker = /<h2\s+id="[^"]+">[\s\S]*?<\/h2>/g;
  return String(html).split(marker);
}

export function ChapterIntro({html}) {
  const intro = splitChapter(html)[0];
  const isGpuHandbook = String(html).includes('gpu-reference');
  return intro ? <div className="signal-prose" suppressHydrationWarning={isGpuHandbook} dangerouslySetInnerHTML={{__html: intro}} /> : null;
}

export default function ChapterSection({html, index}) {
  const section = splitChapter(html)[index + 1] || '';
  const isGpuHandbook = String(html).includes('gpu-reference');
  return <div className="signal-prose" suppressHydrationWarning={isGpuHandbook} dangerouslySetInnerHTML={{__html: section}} />;
}
