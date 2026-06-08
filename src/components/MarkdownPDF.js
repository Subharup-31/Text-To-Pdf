import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, Link } from "@react-pdf/renderer";

// Register fonts
// We use relative paths if running in browser, or absolute paths if window is undefined.
const getFontUrl = (filename) => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/fonts/${filename}`;
  }
  // Fallback for SSR
  return `/fonts/${filename}`;
};

try {
  Font.register({
    family: "Roboto",
    fonts: [
      { src: getFontUrl("Roboto-Regular.ttf"), fontWeight: "normal" },
      { src: getFontUrl("Roboto-Bold.ttf"), fontWeight: "bold" },
      { src: getFontUrl("Roboto-Italic.ttf"), fontWeight: "normal", fontStyle: "italic" },
    ],
  });

  Font.register({
    family: "RobotoMono",
    fonts: [
      { src: getFontUrl("RobotoMono-Regular.ttf"), fontWeight: "normal" },
      { src: getFontUrl("RobotoMono-Bold.ttf"), fontWeight: "bold" },
    ],
  });
} catch (error) {
  console.error("Error registering fonts in react-pdf:", error);
}

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 54,
    paddingBottom: 54,
    paddingLeft: 60,
    paddingRight: 60,
    fontFamily: "Roboto",
    fontSize: 10,
    color: "#2D3748",
    lineHeight: 1.5,
  },
  header: {
    fontSize: 8,
    color: "#A0AEC0",
    marginBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 4,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 60,
    right: 60,
    fontSize: 8,
    color: "#A0AEC0",
    borderTopWidth: 0.5,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  h1: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A202C",
    marginTop: 15,
    marginBottom: 10,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginTop: 18,
    marginBottom: 8,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4A5568",
    marginTop: 14,
    marginBottom: 6,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4A5568",
    marginTop: 12,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
    textAlign: "justify",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
  inlineCode: {
    fontFamily: "RobotoMono",
    backgroundColor: "#F7FAFC",
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    color: "#E53E3E",
    fontSize: 9,
  },
  link: {
    color: "#3182CE",
    textDecoration: "underline",
  },
  codeBlock: {
    backgroundColor: "#1A202C",
    padding: 10,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 12,
  },
  codeText: {
    fontFamily: "RobotoMono",
    color: "#EDF2F7",
    fontSize: 8.5,
    lineHeight: 1.4,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 12,
  },
  bulletPoint: {
    width: 12,
    fontSize: 10,
    color: "#4A5568",
  },
  listNumber: {
    width: 18,
    fontSize: 10,
    color: "#4A5568",
  },
  listItemText: {
    flex: 1,
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginTop: 12,
    marginBottom: 12,
  },
  pageNumber: {
    fontSize: 8,
  },
});

// Inline text parser
const parseInlineText = (text) => {
  if (!text) return [];
  const parts = [];
  let currentIndex = 0;
  
  // Matches: **bold**, *italic*, `code`, [text](url)
  const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|\`(.*?)\`|\[(.*?)\]\((.*?)\))/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    
    if (matchIndex > currentIndex) {
      parts.push({ type: "text", content: text.substring(currentIndex, matchIndex) });
    }
    
    if (match[1].startsWith("**")) {
      parts.push({ type: "bold", content: match[2] });
    } else if (match[1].startsWith("*")) {
      parts.push({ type: "italic", content: match[3] });
    } else if (match[1].startsWith("`")) {
      parts.push({ type: "code", content: match[4] });
    } else if (match[1].startsWith("[")) {
      parts.push({ type: "link", content: match[5], url: match[6] });
    }
    
    currentIndex = regex.lastIndex;
  }
  
  if (currentIndex < text.length) {
    parts.push({ type: "text", content: text.substring(currentIndex) });
  }
  
  return parts.length > 0 ? parts : [{ type: "text", content: text }];
};

// Render inline elements
const renderInlineElements = (text, customStyle = {}) => {
  const parts = parseInlineText(text);
  return parts.map((part, index) => {
    switch (part.type) {
      case "bold":
        return (
          <Text key={index} style={[styles.bold, customStyle]}>
            {part.content}
          </Text>
        );
      case "italic":
        return (
          <Text key={index} style={[styles.italic, customStyle]}>
            {part.content}
          </Text>
        );
      case "code":
        return (
          <Text key={index} style={[styles.inlineCode, customStyle]}>
            {part.content}
          </Text>
        );
      case "link":
        return (
          <Link key={index} src={part.url} style={[styles.link, customStyle]}>
            {part.content}
          </Link>
        );
      default:
        return (
          <Text key={index} style={customStyle}>
            {part.content}
          </Text>
        );
    }
  });
};

// Parser to convert markdown text to blocks
const parseMarkdownToBlocks = (markdownText) => {
  if (!markdownText) return [];
  const lines = markdownText.split("\n");
  const blocks = [];
  let inCodeBlock = false;
  let codeContent = [];
  let codeLanguage = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect code blocks
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push({
          type: "code",
          content: codeContent.join("\n"),
          language: codeLanguage,
        });
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith("# ")) {
      blocks.push({ type: "h1", content: trimmed.slice(2) });
    } else if (trimmed.startsWith("## ")) {
      blocks.push({ type: "h2", content: trimmed.slice(3) });
    } else if (trimmed.startsWith("### ")) {
      blocks.push({ type: "h3", content: trimmed.slice(4) });
    } else if (trimmed.startsWith("#### ")) {
      blocks.push({ type: "h4", content: trimmed.slice(5) });
    }
    // Horizontal Rule
    else if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push({ type: "hr" });
    }
    // Bullet lists
    else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      blocks.push({ type: "bullet", content: trimmed.slice(2) });
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      blocks.push({ type: "number", index: match[1], content: match[2] });
    }
    // Spacer
    else if (trimmed === "") {
      blocks.push({ type: "spacer" });
    }
    // Regular paragraph text
    else {
      // Group consecutive text lines into one paragraph block
      const prevBlock = blocks[blocks.length - 1];
      if (prevBlock && prevBlock.type === "paragraph" && blocks[blocks.length - 2]?.type !== "spacer") {
        prevBlock.content += " " + trimmed;
      } else {
        blocks.push({ type: "paragraph", content: trimmed });
      }
    }
  }

  // Handle unclosed code blocks
  if (inCodeBlock && codeContent.length > 0) {
    blocks.push({
      type: "code",
      content: codeContent.join("\n"),
      language: codeLanguage,
    });
  }

  return blocks.filter((b) => b.type !== "spacer");
};

// Main Document Component
export const MarkdownPDF = ({ text, isFormatted = true }) => {
  // If not formatted, we treat the entire text as simple paragraphs preserving newlines
  const renderContent = () => {
    if (!isFormatted) {
      // Simple rendering: just print raw text preserving line breaks
      const paragraphs = text.split("\n\n");
      return (
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header} fixed>
            <Text>Raw Document Export</Text>
            <Text>Text-to-PDF App</Text>
          </View>

          {/* Body */}
          {paragraphs.map((para, index) => {
            if (!para.trim()) return null;
            return (
              <Text key={index} style={[styles.paragraph, { fontFamily: "RobotoMono", fontSize: 9.5 }]}>
                {para}
              </Text>
            );
          })}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Generated on: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>
      );
    }

    // Split document into pages by manual page-break tag if present
    const pageTexts = text.split("<!-- page-break -->");
    
    return pageTexts.map((pageText, pageIndex) => {
      const blocks = parseMarkdownToBlocks(pageText);
      if (blocks.length === 0) return null;

      return (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header} fixed>
            <Text>AI Formatted Document</Text>
            <Text>Generated via OpenRouter</Text>
          </View>

          {/* Dynamic Blocks */}
          {blocks.map((block, blockIndex) => {
            switch (block.type) {
              case "h1":
                return <Text key={blockIndex} style={styles.h1}>{renderInlineElements(block.content)}</Text>;
              case "h2":
                return <Text key={blockIndex} style={styles.h2}>{renderInlineElements(block.content)}</Text>;
              case "h3":
                return <Text key={blockIndex} style={styles.h3}>{renderInlineElements(block.content)}</Text>;
              case "h4":
                return <Text key={blockIndex} style={styles.h4}>{renderInlineElements(block.content)}</Text>;
              case "paragraph":
                return <Text key={blockIndex} style={styles.paragraph}>{renderInlineElements(block.content)}</Text>;
              case "bullet":
                return (
                  <View key={blockIndex} style={styles.listItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.listItemText}>{renderInlineElements(block.content)}</Text>
                  </View>
                );
              case "number":
                return (
                  <View key={blockIndex} style={styles.listItem}>
                    <Text style={styles.listNumber}>{block.index}.</Text>
                    <Text style={styles.listItemText}>{renderInlineElements(block.content)}</Text>
                  </View>
                );
              case "code":
                return (
                  <View key={blockIndex} style={styles.codeBlock} break={block.content.split('\n').length > 10}>
                    <Text style={styles.codeText}>{block.content}</Text>
                  </View>
                );
              case "hr":
                return <View key={blockIndex} style={styles.hr} />;
              default:
                return null;
            }
          })}

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>Confidential • Generated {new Date().toLocaleDateString()}</Text>
            <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          </View>
        </Page>
      );
    });
  };

  return <Document>{renderContent()}</Document>;
};
export default MarkdownPDF;
