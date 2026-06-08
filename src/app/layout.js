import './globals.css';

export const metadata = {
  title: 'TextCraft PDF – AI-Powered Text to PDF Converter',
  description: 'Paste your text, let AI beautifully format it, and download a polished PDF instantly. Preserve every word – only the layout changes.',
  keywords: 'text to pdf, ai formatting, pdf generator, spellcheck, markdown pdf',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
