import React from 'react';
import { renderToFile, Document, Page } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import { marked } from 'marked';

const html = marked.parse('# Hello\n* World\n* list');

const doc = (
  <Document>
    <Page>
      <Html>{html}</Html>
    </Page>
  </Document>
);

renderToFile(doc, 'test.pdf').then(() => console.log('success')).catch(e => console.error(e));
