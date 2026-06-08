'use client';

import { useMemo, useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  PDFDownloadLink,
} from '@react-pdf/renderer';

// ── font registration ─────────────────────────────────────────────────
// These .ttf files must exist in /public/fonts/
function registerFonts() {
  try {
    Font.register({
      family: 'Roboto',
      fonts: [
        { src: '/fonts/Roboto-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/Roboto-Bold.ttf', fontWeight: 700 },
        { src: '/fonts/Roboto-Italic.ttf', fontStyle: 'italic', fontWeight: 400 },
      ],
    });
    Font.register({
      family: 'RobotoMono',
      fonts: [
        { src: '/fonts/RobotoMono-Regular.ttf', fontWeight: 400 },
        { src: '/fonts/RobotoMono-Bold.ttf', fontWeight: 700 },
      ],
    });
  } catch {}
}

registerFonts();

// ── PDF styles ────────────────────────────────────────────────────────
const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 64,
    fontFamily: 'Roboto',
    fontSize: 10.5,
    lineHeight: 1.65,
    color: '#1a1a2e',
    backgroundColor: '#ffffff',
  },
  // header / footer
  header: {
    position: 'absolute',
    top: 20,
    left: 64,
    right: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingBottom: 6,
  },
  headerText: {
    fontSize: 8,
    color: '#9ca3af',
    fontFamily: 'Roboto',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 64,
    right: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    fontFamily: 'Roboto',
  },
  pageNumber: {
    fontSize: 8,
    color: '#6b7280',
  },
  // headings
  h1: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 700,
    lineHeight: 1.3,
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  h2: {
    fontSize: 15,
    fontFamily: 'Roboto',
    fontWeight: 700,
    lineHeight: 1.3,
    color: '#1f2937',
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    fontSize: 12.5,
    fontFamily: 'Roboto',
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#374151',
    marginTop: 10,
    marginBottom: 4,
  },
  h4: {
    fontSize: 11,
    fontFamily: 'Roboto',
    fontWeight: 700,
    lineHeight: 1.4,
    color: '#4b5563',
    marginTop: 8,
    marginBottom: 3,
  },
  // body text
  paragraph: {
    fontSize: 10.5,
    fontFamily: 'Roboto',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 1.65,
    textAlign: 'justify',
  },
  // lists
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingLeft: 8,
  },
  bullet: {
    width: 14,
    fontSize: 10.5,
    color: '#6366f1',
    fontWeight: 700,
  },
  listText: {
    flex: 1,
    fontSize: 10.5,
    fontFamily: 'Roboto',
    color: '#1f2937',
    lineHeight: 1.6,
  },
  // ordered list
  orderedNumber: {
    width: 18,
    fontSize: 10.5,
    color: '#6366f1',
    fontWeight: 700,
  },
  // code
  codeBlock: {
    backgroundColor: '#0d1117',
    borderRadius: 6,
    padding: 12,
    marginVertical: 8,
  },
  codeText: {
    fontFamily: 'RobotoMono',
    fontSize: 9,
    color: '#e6edf3',
    lineHeight: 1.5,
  },
  inlineCode: {
    fontFamily: 'RobotoMono',
    fontSize: 9.5,
    backgroundColor: '#f3f4f6',
    color: '#7c3aed',
  },
  // blockquote
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#6366f1',
    paddingLeft: 10,
    marginVertical: 6,
    backgroundColor: '#f5f3ff',
    padding: 8,
    borderRadius: 4,
  },
  blockquoteText: {
    fontSize: 10.5,
    fontFamily: 'Roboto',
    fontStyle: 'italic',
    color: '#4b5563',
    lineHeight: 1.6,
  },
  // divider
  hr: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#e5e7eb',
    marginVertical: 10,
  },
  // callout
  callout: {
    padding: 10,
    marginVertical: 8,
    borderRadius: 6,
    borderLeftWidth: 4,
    backgroundColor: '#eff6ff',
    borderLeftColor: '#3b82f6',
  },
  calloutTitle: {
    fontFamily: 'Roboto',
    fontWeight: 700,
    fontSize: 10.5,
    marginBottom: 4,
    color: '#1e3a8a',
    textTransform: 'uppercase',
  },
  calloutText: {
    fontFamily: 'Roboto',
    fontSize: 10.5,
    lineHeight: 1.6,
    color: '#1e3a8a',
  },
  // table
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginVertical: 10,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeaderRow: {
    backgroundColor: '#f9fafb',
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    padding: 6,
  },
  tableCellText: {
    fontSize: 9.5,
    fontFamily: 'Roboto',
    color: '#374151',
  },
  tableHeaderText: {
    fontSize: 9.5,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#111827',
  },
  // toc
  tocTitle: {
    fontSize: 18,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
    paddingBottom: 6,
  },
  tocItem1: {
    fontSize: 11,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#1f2937',
    marginTop: 6,
    marginBottom: 2,
  },
  tocItem2: {
    fontSize: 10.5,
    fontFamily: 'Roboto',
    color: '#4b5563',
    marginLeft: 12,
    marginBottom: 2,
  },
  tocItem3: {
    fontSize: 10,
    fontFamily: 'Roboto',
    color: '#6b7280',
    marginLeft: 24,
    marginBottom: 2,
  },
  // title page accent
  accentBar: {
    height: 4,
    backgroundColor: '#6366f1',
    borderRadius: 2,
    marginBottom: 12,
  },
});

// ── Markdown → PDF token parser ───────────────────────────────────────
function parseMarkdown(md) {
  const lines = md.split('\n');
  const tokens = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      tokens.push({ type: 'codeblock', lang, content: codeLines.join('\n') });
      i++;
      continue;
    }

    // headings
    const h4 = line.match(/^#### (.+)/);
    const h3 = line.match(/^### (.+)/);
    const h2 = line.match(/^## (.+)/);
    const h1 = line.match(/^# (.+)/);
    if (h1) { tokens.push({ type: 'h1', content: h1[1] }); i++; continue; }
    if (h2) { tokens.push({ type: 'h2', content: h2[1] }); i++; continue; }
    if (h3) { tokens.push({ type: 'h3', content: h3[1] }); i++; continue; }
    if (h4) { tokens.push({ type: 'h4', content: h4[1] }); i++; continue; }

    // Callout box
    const calloutMatch = line.match(/^>\s*\[!(NOTE|WARNING|IMPORTANT|TIP|CAUTION)\]/i);
    if (calloutMatch) {
      const type = calloutMatch[1].toUpperCase();
      const calloutLines = [];
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        calloutLines.push(lines[i].replace(/^>\s*/, ''));
        i++;
      }
      tokens.push({ type: 'callout', calloutType: type, content: calloutLines.join(' ') });
      continue;
    }

    // blockquote
    if (line.startsWith('> ')) {
      tokens.push({ type: 'blockquote', content: line.slice(2) });
      i++;
      continue;
    }

    // hr
    if (/^---+$/.test(line.trim())) {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    // Tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableRows = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        if (!/^[\|\-\s:]+$/.test(lines[i])) {
          const cells = lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim());
          if (cells.length > 0) tableRows.push(cells);
        }
        i++;
      }
      if (tableRows.length > 0) {
        tokens.push({ type: 'table', rows: tableRows });
      }
      continue;
    }

    // unordered list
    if (/^[\-\*] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[\-\*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[\-\*] /, ''));
        i++;
      }
      tokens.push({ type: 'ul', items });
      continue;
    }

    // ordered list
    if (/^\d+\. /.test(line)) {
      const items = [];
      let num = 1;
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push({ n: num++, text: lines[i].replace(/^\d+\. /, '') });
        i++;
      }
      tokens.push({ type: 'ol', items });
      continue;
    }

    // empty line → skip
    if (!line.trim()) { i++; continue; }

    // paragraph
    const paraLines = [line];
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith('#') && !lines[i].startsWith('```') && !lines[i].startsWith('> ') && !/^[\-\*] /.test(lines[i]) && !/^\d+\. /.test(lines[i]) && !/^---+$/.test(lines[i].trim())) {
      paraLines.push(lines[i]);
      i++;
    }
    tokens.push({ type: 'paragraph', content: paraLines.join(' ') });
  }

  return tokens;
}

// Syntax Highlighting helper
function renderCodeBlock(codeText) {
  const keywords = ['const', 'let', 'var', 'function', 'return', 'import', 'export', 'default', 'if', 'else', 'for', 'while', 'class', 'new', 'from', 'await', 'async'];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  const parts = codeText.split(regex);
  
  return parts.map((part, idx) => {
    if (keywords.includes(part)) {
      return <Text key={idx} style={{ color: '#ff7b72' }}>{part}</Text>;
    }
    return <Text key={idx}>{part}</Text>;
  });
}

// Strip inline markdown from text for PDF
function stripInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1');
}

// Bold-aware text render (simplistic)
function renderInlineText(text, baseStyle = {}) {
  // split by bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return <Text style={baseStyle}>{stripInline(text)}</Text>;

  return (
    <Text style={baseStyle}>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={idx} style={{ ...baseStyle, fontWeight: 700, fontFamily: 'Roboto' }}>{part.slice(2, -2)}</Text>;
        }
        const clean = part.replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1');
        return <Text key={idx}>{clean}</Text>;
      })}
    </Text>
  );
}

// ── PDF Document component ────────────────────────────────────────────
function PDFDoc({ tokens, label, includeToc }) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const tocTokens = tokens.filter(t => ['h1', 'h2', 'h3'].includes(t.type));

  return (
    <Document
      title="TextCraft PDF Export"
      author="TextCraft PDF"
      subject={label}
      creator="TextCraft PDF – textcraft.app"
    >
      {includeToc && tocTokens.length > 0 && (
        <Page size="A4" style={pdfStyles.page} wrap>
          <View style={pdfStyles.header} fixed>
            <Text style={pdfStyles.headerText}>TextCraft PDF</Text>
            <Text style={pdfStyles.headerText}>{today}</Text>
          </View>
          <View style={pdfStyles.footer} fixed>
            <Text style={pdfStyles.footerText}>{label} - Table of Contents</Text>
            <Text style={pdfStyles.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
          <Text style={pdfStyles.tocTitle}>Table of Contents</Text>
          {tocTokens.map((t, idx) => {
            const style = t.type === 'h1' ? pdfStyles.tocItem1 : t.type === 'h2' ? pdfStyles.tocItem2 : pdfStyles.tocItem3;
            return <Text key={idx} style={style}>{stripInline(t.content)}</Text>;
          })}
        </Page>
      )}

      <Page size="A4" style={pdfStyles.page} wrap>
        {/* Fixed header */}
        <View style={pdfStyles.header} fixed>
          <Text style={pdfStyles.headerText}>TextCraft PDF</Text>
          <Text style={pdfStyles.headerText}>{today}</Text>
        </View>

        {/* Fixed footer with page numbers */}
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>{label}</Text>
          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>

        {/* Content */}
        {tokens.map((token, idx) => {
          switch (token.type) {
            case 'h1':
              return (
                <View key={idx}>
                  <View style={pdfStyles.accentBar} />
                  <Text style={pdfStyles.h1}>{stripInline(token.content)}</Text>
                </View>
              );
            case 'h2':
              return <Text key={idx} style={pdfStyles.h2}>{stripInline(token.content)}</Text>;
            case 'h3':
              return <Text key={idx} style={pdfStyles.h3}>{stripInline(token.content)}</Text>;
            case 'h4':
              return <Text key={idx} style={pdfStyles.h4}>{stripInline(token.content)}</Text>;
            case 'paragraph':
              return renderInlineText(token.content, { ...pdfStyles.paragraph, key: idx });
            case 'codeblock':
              return (
                <View key={idx} style={pdfStyles.codeBlock}>
                  <Text style={pdfStyles.codeText}>{renderCodeBlock(token.content)}</Text>
                </View>
              );
            case 'callout':
              const colors = {
                NOTE: { bg: '#eff6ff', border: '#3b82f6', text: '#1e3a8a' },
                WARNING: { bg: '#fffbeb', border: '#f59e0b', text: '#78350f' },
                IMPORTANT: { bg: '#f5f3ff', border: '#8b5cf6', text: '#4c1d95' },
                TIP: { bg: '#f0fdf4', border: '#22c55e', text: '#14532d' },
                CAUTION: { bg: '#fef2f2', border: '#ef4444', text: '#7f1d1d' }
              };
              const theme = colors[token.calloutType] || colors.NOTE;
              return (
                <View key={idx} style={{ ...pdfStyles.callout, backgroundColor: theme.bg, borderLeftColor: theme.border }}>
                  <Text style={{ ...pdfStyles.calloutTitle, color: theme.text }}>{token.calloutType}</Text>
                  <Text style={{ ...pdfStyles.calloutText, color: theme.text }}>{stripInline(token.content)}</Text>
                </View>
              );
            case 'table':
              return (
                <View key={idx} style={pdfStyles.table}>
                  {token.rows.map((row, rIdx) => (
                    <View key={rIdx} style={rIdx === 0 ? pdfStyles.tableHeaderRow : pdfStyles.tableRow}>
                      {row.map((cell, cIdx) => (
                        <View key={cIdx} style={pdfStyles.tableCell}>
                          <Text style={rIdx === 0 ? pdfStyles.tableHeaderText : pdfStyles.tableCellText}>{stripInline(cell)}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              );
            case 'blockquote':
              return (
                <View key={idx} style={pdfStyles.blockquote}>
                  <Text style={pdfStyles.blockquoteText}>{stripInline(token.content)}</Text>
                </View>
              );
            case 'hr':
              return <View key={idx} style={pdfStyles.hr} />;
            case 'ul':
              return (
                <View key={idx}>
                  {token.items.map((item, j) => (
                    <View key={j} style={pdfStyles.listItem}>
                      <Text style={pdfStyles.bullet}>•</Text>
                      {renderInlineText(item, pdfStyles.listText)}
                    </View>
                  ))}
                </View>
              );
            case 'ol':
              return (
                <View key={idx}>
                  {token.items.map((item, j) => (
                    <View key={j} style={pdfStyles.listItem}>
                      <Text style={pdfStyles.orderedNumber}>{item.n}.</Text>
                      {renderInlineText(item.text, pdfStyles.listText)}
                    </View>
                  ))}
                </View>
              );
            default:
              return null;
          }
        })}
      </Page>
    </Document>
  );
}

// ── Raw PDF (plain text, no markdown) ─────────────────────────────────
function stripAllMarkdown(md) {
  if (!md) return '';
  return md
    .replace(/^#{1,6}\s+/gm, '')         // headings
    .replace(/^\s*>\s+/gm, '')           // blockquotes
    .replace(/\*\*(.+?)\*\*/g, '$1')     // bold
    .replace(/\*(.+?)\*/g, '$1')         // italic
    .replace(/`(.+?)`/g, '$1')           // inline code
    .replace(/```[\w]*\n([\s\S]*?)```/g, '$1') // code blocks
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')  // links
    .replace(/^\s*[-*+]\s+/gm, '• ')     // list items
    .replace(/^\s*\d+\.\s+/gm, match => match); // ordered lists (keep number)
}

function RawPDFDoc({ text }) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const plainText = stripAllMarkdown(text);

  return (
    <Document title="TextCraft PDF – Raw" author="TextCraft PDF">
      <Page size="A4" style={pdfStyles.page} wrap>
        <View style={pdfStyles.header} fixed>
          <Text style={pdfStyles.headerText}>TextCraft PDF – Raw Export</Text>
          <Text style={pdfStyles.headerText}>{today}</Text>
        </View>
        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Raw Text</Text>
          <Text
            style={pdfStyles.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>

        <Text style={{ ...pdfStyles.paragraph, fontFamily: 'Roboto', fontSize: 10.5, lineHeight: 1.6 }}>
          {plainText}
        </Text>
      </Page>
    </Document>
  );
}

// ── DownloadButton sub-component ──────────────────────────────────────
function DownloadButton({ doc, filename, label, variant = 'primary', disabled }) {
  if (disabled) {
    return (
      <button className={`btn btn-${variant} btn-md`} disabled>
        {label}
      </button>
    );
  }

  return (
    <PDFDownloadLink document={doc} fileName={filename}>
      {({ loading, error }) => (
        <button
          className={`btn btn-${variant} btn-md`}
          disabled={loading || !!error}
          title={error ? `Error: ${error}` : ''}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          {loading ? 'Preparing…' : label}
        </button>
      )}
    </PDFDownloadLink>
  );
}

// ── Main export ───────────────────────────────────────────────────────
export default function PDFDownloadSection({ rawText, formattedText, spellcheckedText }) {
  const hasRaw = !!rawText?.trim();
  const hasFormatted = !!formattedText?.trim();
  const hasSpellchecked = !!spellcheckedText?.trim();

  const rawTokens = useMemo(() => hasRaw ? parseMarkdown(rawText) : [], [rawText, hasRaw]);
  const fmtTokens = useMemo(() => hasFormatted ? parseMarkdown(formattedText) : [], [formattedText, hasFormatted]);
  const spTokens = useMemo(() => hasSpellchecked ? parseMarkdown(spellcheckedText) : [], [spellcheckedText, hasSpellchecked]);

  return (
    <>
      {/* Raw PDF */}
      <DownloadButton
        doc={<PDFDoc tokens={rawTokens} label="Original Text" />}
        filename="textcraft-original.pdf"
        label="Original PDF"
        variant="outline"
        disabled={!hasRaw}
      />

      {/* AI Formatted PDF */}
      <DownloadButton
        doc={<PDFDoc tokens={fmtTokens} label="AI Formatted" includeToc={true} />}
        filename="textcraft-formatted.pdf"
        label="✨ AI Formatted PDF"
        variant="primary"
        disabled={!hasFormatted}
      />

      {/* Spellchecked PDF */}
      {hasSpellchecked && (
        <DownloadButton
          doc={<PDFDoc tokens={spTokens} label="Spellchecked" />}
          filename="textcraft-spellchecked.pdf"
          label="✓ Spellchecked PDF"
          variant="success"
          disabled={false}
        />
      )}

      {!hasRaw && (
        <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
          Add text and use AI Format to enable downloads
        </span>
      )}
    </>
  );
}
