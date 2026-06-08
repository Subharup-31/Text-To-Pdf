# TextCraft: Text to PDF & AI Formatter

TextCraft is a modern web application built with Next.js that allows users to write or paste text, beautifully format it using AI (powered by Google Gemini), and export it to high-quality PDF documents.

## Features

- **WYSIWYG Editing:** A rich text editor built with `react-quill` for a smooth writing experience.
- **AI Formatting:** Instantly structure messy notes into organized, professional formats. The AI automatically generates:
  - Markdown Tables for tabular data
  - Callout blocks (Notes, Warnings, Tips)
  - Syntax highlighted code blocks
  - Bulleted and numbered lists
- **Advanced PDF Generation:** Uses `@react-pdf/renderer` to build precise, customized PDFs entirely on the client side.
- **Table of Contents:** Automatically generates a paginated Table of Contents for AI-formatted documents.
- **Raw or Formatted:** Choose between downloading a raw text PDF or a fully styled AI-formatted PDF.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** CSS Modules / Vanilla CSS (Custom Design System)
- **Editor:** `react-quill-new` (with Turndown for Markdown conversion)
- **PDF Engine:** `@react-pdf/renderer`
- **AI Integration:** Google Gemini API

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Subharup-31/Text-To-Pdf.git
   cd Text-To-Pdf
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app.

## Deployment

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new). Don't forget to add your `GEMINI_API_KEY` to the Vercel Environment Variables before deploying.
