'use client';

import { useState } from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import { marked } from 'marked';

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
  accentBar: {
    height: 4,
    backgroundColor: '#6366f1',
    borderRadius: 2,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto',
    fontWeight: 700,
    color: '#111827',
    marginBottom: 16,
  }
});

// ── Dynamic Themes ──────────────────────────────────────────────────────
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return Math.abs(hash);
}

const THEMES = [
  { name: 'Corporate Blue', primary: '#174872', accent: '#2b78e4', bg: '#f8fafc' },
  { name: 'Emerald Green', primary: '#064e3b', accent: '#10b981', bg: '#ecfdf5' },
  { name: 'Crimson Red', primary: '#7f1d1d', accent: '#ef4444', bg: '#fef2f2' },
  { name: 'Royal Purple', primary: '#4c1d95', accent: '#8b5cf6', bg: '#f5f3ff' },
  { name: 'Slate Grey', primary: '#334155', accent: '#64748b', bg: '#f8fafc' }
];

function getHtmlStylesheet(text) {
  const hash = hashString(text || '');
  const theme = THEMES[hash % THEMES.length];

  return {
    h1: { fontSize: 24, fontFamily: 'Roboto', fontWeight: 700, lineHeight: 1.3, color: theme.primary, marginTop: 16, marginBottom: 12, borderBottomWidth: 2, borderBottomColor: theme.primary, paddingBottom: 6 },
    h2: { fontSize: 18, fontFamily: 'Roboto', fontWeight: 700, lineHeight: 1.3, color: theme.accent, marginTop: 16, marginBottom: 8 },
    h3: { fontSize: 14, fontFamily: 'Roboto', fontWeight: 700, lineHeight: 1.4, color: theme.primary, marginTop: 12, marginBottom: 6, borderLeftWidth: 4, borderLeftColor: theme.accent, paddingLeft: 10 },
    h4: { fontSize: 11, fontFamily: 'Roboto', fontWeight: 700, lineHeight: 1.4, color: '#4b5563', marginTop: 8, marginBottom: 3 },
    p: { fontSize: 11, fontFamily: 'Roboto', color: '#333333', marginBottom: 8, lineHeight: 1.6 },
    ul: { paddingLeft: 16, marginBottom: 8 },
    ol: { paddingLeft: 16, marginBottom: 8 },
    li: { fontSize: 11, fontFamily: 'Roboto', color: '#333333', lineHeight: 1.6, marginBottom: 4 },
    code: { fontFamily: 'RobotoMono', fontSize: 9.5, backgroundColor: '#f3f4f6', color: '#7c3aed' },
    pre: { backgroundColor: '#0d1117', borderRadius: 6, padding: 12, marginVertical: 8, fontFamily: 'RobotoMono', fontSize: 9, color: '#e6edf3', lineHeight: 1.5 },
    blockquote: { borderLeftWidth: 3, borderLeftColor: theme.primary, paddingLeft: 10, marginVertical: 6, backgroundColor: theme.bg, padding: 8, borderRadius: 4, fontSize: 11, fontFamily: 'Roboto', fontStyle: 'italic', color: '#4b5563', lineHeight: 1.6 },
    hr: { borderBottomWidth: 1, borderBottomColor: '#d1d5db', marginVertical: 12 },
    table: { display: 'flex', flexDirection: 'column', marginVertical: 10, borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#e5e7eb' },
    tr: { flexDirection: 'row' },
    th: { flex: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 8, backgroundColor: '#f1f5f9', fontSize: 10, fontFamily: 'Roboto', fontWeight: 700, color: '#1e293b' },
    td: { flex: 1, borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', padding: 8, fontSize: 10, fontFamily: 'Roboto', color: '#334155' },
    a: { color: theme.accent, textDecoration: 'none' },
    strong: { fontWeight: 700 },
    em: { fontStyle: 'italic' },
  };
}

// ── PDF Document component ────────────────────────────────────────────
function PDFDoc({ text, label }) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const htmlContent = marked.parse(text || '');
  const stylesheet = getHtmlStylesheet(text);

  return (
    <Document
      title="TextCraft PDF Export"
      author="TextCraft PDF"
      subject={label}
      creator="TextCraft PDF – textcraft.app"
    >
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

        <Html stylesheet={stylesheet}>{htmlContent}</Html>
      </Page>
    </Document>
  );
}

// ── DownloadButton sub-component ──────────────────────────────────────
function DownloadButton({ doc, filename, label, variant = 'primary', disabled }) {
  const [loading, setLoading] = useState(false);

  if (disabled) {
    return (
      <button className={`btn btn-${variant} btn-md`} disabled>
        {label}
      </button>
    );
  }

  const handleDownload = async () => {
    try {
      setLoading(true);
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`btn btn-${variant} btn-md`}
      onClick={handleDownload}
      disabled={loading}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      </svg>
      {loading ? 'Preparing…' : label}
    </button>
  );
}

// ── Main export ───────────────────────────────────────────────────────
export default function PDFDownloadSection({ rawText, formattedText, spellcheckedText }) {
  const hasRaw = !!rawText?.trim();
  const hasFormatted = !!formattedText?.trim();
  const hasSpellchecked = !!spellcheckedText?.trim();

  return (
    <>
      <DownloadButton
        doc={<PDFDoc text={rawText} label="Original Text" />}
        filename="textcraft-original.pdf"
        label="Original PDF"
        variant="outline"
        disabled={!hasRaw}
      />

      <DownloadButton
        doc={<PDFDoc text={formattedText} label="AI Formatted" />}
        filename="textcraft-formatted.pdf"
        label="✨ AI Formatted PDF"
        variant="primary"
        disabled={!hasFormatted}
      />

      {hasSpellchecked && (
        <DownloadButton
          doc={<PDFDoc text={spellcheckedText} label="Spellchecked" />}
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
