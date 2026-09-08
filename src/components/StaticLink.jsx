import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function StaticLink({to, children}) {
  return <a href={useBaseUrl(to)}>{children}</a>;
}
