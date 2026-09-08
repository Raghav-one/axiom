import React from 'react';

function splitChapter(html) {
  const marker = /<h2\s+id="[^"]+">[\s\S]*?<\/h2>/g;
  return String(html).split(marker);
}

export function ChapterIntro({html}) {
  const intro = splitChapter(html)[0];
  return intro ? <div className="signal-prose" dangerouslySetInnerHTML={{__html: intro}} /> : null;
}

export default function ChapterSection({html, index}) {
  const section = splitChapter(html)[index + 1] || '';
  return <div className="signal-prose" dangerouslySetInnerHTML={{__html: section}} />;
}
