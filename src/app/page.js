'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const PDFDownloadSection = dynamic(() => import('@/components/PDFDownloadSection'), {
  ssr: false,
  loading: () => null,
});

// ── tiny inline SVG icons ──────────────────────────────────────────────
function Svg({ children, size = 14, ...p }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      {children}
    </svg>
  );
}
const WandIcon = () => <Svg><path d="M15 4V2m0 14v-2M8 9h2m10 0h2M17.8 11.8 19 13M15 9h0M4.2 4.2 3 3m10.7 5.3 1.2-1.2M4.2 13.8 3 15M12 12l-8 8" /></Svg>;
const SpellIcon = () => <Svg><path d="M4 20L9.5 4L12 11M20 20L14.5 4L12 11M7.5 14h9" /></Svg>;
const ClearIcon = () => <Svg><path d="M18 6 6 18M6 6l12 12" /></Svg>;
const CopyIcon = () => <Svg><path d="M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9" /></Svg>;
const SettingsIcon = () => <Svg><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></Svg>;
const UndoIcon = () => <Svg><path d="M3 7v6h6" /><path d="M3 13a9 9 0 1 0 2.83-6.36L3 7" /></Svg>;
const AlertIcon = () => <Svg size={13}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" /></Svg>;
const CheckIcon = () => <Svg size={13}><path d="M20 6 9 17l-5-5" /></Svg>;
const SparklesIcon = () => (
  <Svg size={14}>
    <path d="M12 3 13.5 8.5 19 10 13.5 11.5 12 17 10.5 11.5 5 10 10.5 8.5 12 3Z" />
    <path d="M5 3 5.5 5.5 8 6 5.5 6.5 5 9 4.5 6.5 2 6 4.5 5.5 5 3Z" />
    <path d="M19 13 19.5 15 22 15.5 19.5 16 19 18 18.5 16 16 15.5 18.5 15 19 13Z" />
  </Svg>
);



// ── Toast ─────────────────────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <span style={{ color: 'var(--success)' }}>✓</span>}
          {t.type === 'error' && <span style={{ color: 'var(--error)' }}>!</span>}
          {t.type === 'warning' && <span style={{ color: 'var(--warning)' }}>⚠</span>}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Settings Modal ────────────────────────────────────────────────────
function SettingsModal({ open, onClose, apiKey, setApiKey, model, setModel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Settings</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><ClearIcon /></button>
        </div>
        <div className="form-group">
          <label className="form-label">OpenRouter API Key</label>
          <input id="api-key-input" type="password" className="form-input"
            value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..." spellCheck={false} />
          <p className="form-hint">
            Free key at{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--text-brand)' }}>
              openrouter.ai/keys
            </a>. Stored in your browser only.
          </p>
        </div>
        <div className="form-group">
          <label className="form-label">AI Model</label>
          <select id="model-select" className="form-select" value={model} onChange={e => setModel(e.target.value)}>
            <optgroup label="Free Tier">
              <option value="google/gemma-4-31b-it:free">Gemma 4 31B (free) ⭐ Default</option>
              <option value="google/gemma-4-26b-a4b-it:free">Gemma 4 26B MoE (free)</option>
              <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 70B (free)</option>
              <option value="meta-llama/llama-3.2-3b-instruct:free">Llama 3.2 3B (free, fast)</option>
              <option value="openai/gpt-oss-20b:free">GPT-OSS 20B (free)</option>
              <option value="qwen/qwen3-coder:free">Qwen3 Coder (free, best for code)</option>
            </optgroup>
            <optgroup label="Paid (Better Quality)">
              <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
              <option value="anthropic/claude-haiku">Claude Haiku</option>
              <option value="mistralai/mistral-small">Mistral Small</option>
            </optgroup>
          </select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
          <button className="btn btn-primary btn-md" onClick={onClose}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Uncertain Words Warning Panel ─────────────────────────────────────
function UncertainWordsPanel({ words, onDismiss }) {
  if (!words || words.length === 0) return null;
  return (
    <div className="uncertain-panel">
      <div className="uncertain-header">
        <span className="uncertain-icon"><AlertIcon /></span>
        <span className="uncertain-title">
          {words.length} word{words.length !== 1 ? 's' : ''} skipped — AI wasn't sure:
        </span>
        <button className="btn btn-ghost btn-sm uncertain-dismiss" onClick={onDismiss} title="Dismiss">
          <ClearIcon />
        </button>
      </div>
      <div className="uncertain-words">
        {words.map((w, i) => (
          <span key={i} className="uncertain-word">{w}</span>
        ))}
      </div>
      <p className="uncertain-hint">These may be proper nouns, technical terms, or abbreviations. Review them manually.</p>
    </div>
  );
}

// ── Diff highlighter ──────────────────────────────────────────────────
function computeChangedWords(original, corrected) {
  const origWords = original.split(/(\s+)/);
  const corrWords = corrected.split(/(\s+)/);
  // Simple diff: track how many words changed
  let changed = 0;
  const len = Math.max(origWords.length, corrWords.length);
  for (let i = 0; i < len; i++) {
    if (origWords[i] !== corrWords[i]) changed++;
  }
  return changed;
}

// ── Main App ──────────────────────────────────────────────────────────
export default function Home() {
  const [rawText, setRawText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [preSpellText, setPreSpellText] = useState(''); // snapshot before spellcheck (for undo)
  const [uncertainWords, setUncertainWords] = useState([]);
  const [spellFixCount, setSpellFixCount] = useState(0);
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(true);
  const [isFormatting, setIsFormatting] = useState(false);
  const [isSpellchecking, setIsSpellchecking] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('google/gemma-4-31b-it:free');
  const [activePreview, setActivePreview] = useState('formatted');
  const [isEditingFormatted, setIsEditingFormatted] = useState(false);

  const textareaRef = useRef(null);
  const toastId = useRef(0);

  // Persist settings
  useEffect(() => {
    const VALID_MODELS = [
      'google/gemma-4-31b-it:free',
      'google/gemma-4-26b-a4b-it:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'openai/gpt-oss-20b:free',
      'qwen/qwen3-coder:free',
      'openai/gpt-4o-mini',
      'anthropic/claude-haiku',
      'mistralai/mistral-small',
    ];
    try {
      const s = JSON.parse(localStorage.getItem('textcraft_settings') || '{}');
      if (s.apiKey) setApiKey(s.apiKey);
      // Only restore model if it's still a valid/active model
      if (s.model && VALID_MODELS.includes(s.model)) {
        setModel(s.model);
      } else if (s.model) {
        // Stale/removed model — reset to default and clear it
        localStorage.removeItem('textcraft_settings');
      }
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem('textcraft_settings', JSON.stringify({ apiKey, model }));
  }, [apiKey, model]);

  const addToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++toastId.current;
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const charCount = rawText.length;

  // ── API call ─────────────────────────────────────────────────────────
  async function callAI(action) {
    if (!rawText.trim()) { addToast('Please enter some text first.', 'error'); return; }

    const isFmt = action === 'format';
    if (isFmt) setIsFormatting(true);
    else setIsSpellchecking(true);

    setAiStatus({ type: 'loading', message: isFmt ? 'AI is formatting your text…' : 'Checking spelling & grammar…' });

    try {
      const mdInput = rawText || '';
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: mdInput, action, apiKey, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);

      if (isFmt) {
        setFormattedText(data.result);
        setActivePreview('formatted');
        setAiStatus({ type: 'success', message: 'Formatting done!' });
        addToast('Text formatted! ✨');
      } else {
        // ── INLINE SPELLCHECK ──
        const correctedMarkdown = data.result;
        const uncertain = data.uncertain || [];
        const changed = computeChangedWords(mdInput, data.result);

        // Save snapshot for undo
        setPreSpellText(rawText);
        // Apply corrections directly into the editor
        setRawText(correctedMarkdown);
        setUncertainWords(uncertain);
        setSpellFixCount(changed);

        if (changed === 0 && uncertain.length === 0) {
          setAiStatus({ type: 'success', message: 'No issues found — text looks great!' });
          addToast('No spelling issues found ✓');
        } else {
          setAiStatus({ type: 'success', message: `Fixed ~${changed} issue${changed !== 1 ? 's' : ''}${uncertain.length ? ` · ${uncertain.length} skipped` : ''}` });
          if (changed > 0) addToast(`Fixed ~${changed} spelling/grammar issue${changed !== 1 ? 's' : ''} ✓`);
          if (uncertain.length > 0) addToast(`${uncertain.length} word${uncertain.length !== 1 ? 's' : ''} skipped (unsure) ⚠`, 'warning', 5000);
        }
      }
      setTimeout(() => setAiStatus(null), 4000);
    } catch (err) {
      setAiStatus({ type: 'error', message: `Error: ${err.message}` });
      addToast(err.message || 'Something went wrong.', 'error');
      setTimeout(() => setAiStatus(null), 6000);
    } finally {
      if (isFmt) setIsFormatting(false);
      else setIsSpellchecking(false);
    }
  }

  function handleUndoSpellcheck() {
    if (!preSpellText) return;
    setRawText(preSpellText);
    setPreSpellText('');
    setUncertainWords([]);
    setSpellFixCount(0);
    addToast('Spellcheck undone');
  }

  function handleClear() {
    setRawText('');
    setFormattedText('');
    setPreSpellText('');
    setUncertainWords([]);
    setSpellFixCount(0);
    setAiStatus(null);
    textareaRef.current?.focus();
  }

  function handleCopyEditor() {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    addToast('Copied to clipboard!');
  }

  function handleCopyPreview() {
    if (!formattedText) return;
    navigator.clipboard.writeText(formattedText);
    addToast('Formatted text copied!');
  }



  return (
    <div className="app-shell">

      {/* ── HEADER ── */}
      <header className="header">
        <a className="header-logo" href="/" aria-label="TextCraft PDF Home">
          <div className="header-logo-icon">📄</div>
          <span className="header-logo-text">Text<span>Craft</span> PDF</span>
        </a>
        <div className="header-actions">
          <span className="badge badge-brand"><SparklesIcon /> AI Powered</span>
          <button id="settings-btn" className="btn btn-ghost btn-sm" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon /> Settings
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="main-content">

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <button
              id="format-btn"
              className={`btn btn-primary btn-md${isFormatting ? ' btn-loading' : ''}`}
              onClick={() => callAI('format')}
              disabled={isFormatting || isSpellchecking || !rawText.trim()}
              title="AI restructures text into headings, bullets, code blocks (content unchanged)"
            >
              {isFormatting
                ? <><Spinner /> Formatting…</>
                : <><WandIcon /> AI Format</>}
            </button>

            <div className="divider" />

            <button
              id="spellcheck-btn"
              className={`btn btn-secondary btn-md${isSpellchecking ? ' btn-loading' : ''}`}
              onClick={() => callAI('spellcheck')}
              disabled={isFormatting || isSpellchecking || !rawText.trim()}
              title="Fix spelling & grammar directly in the editor"
            >
              {isSpellchecking
                ? <><Spinner /> Checking…</>
                : <><SpellIcon /> Fix Spelling</>}
            </button>

            {/* Undo spellcheck */}
            {preSpellText && (
              <button
                id="undo-spellcheck-btn"
                className="btn btn-ghost btn-md"
                onClick={handleUndoSpellcheck}
                title="Undo spellcheck — restore original text"
              >
                <UndoIcon /> Undo
              </button>
            )}

            {rawText && (
              <>
                <div className="divider" />
                <button id="clear-btn" className="btn btn-ghost btn-md" onClick={handleClear}>
                  <ClearIcon /> Clear
                </button>
              </>
            )}
          </div>

          <div className="toolbar-right">
            {rawText && (
              <div className="stats-badge">
                <span>{wordCount}</span> words · <span>{charCount}</span> chars
              </div>
            )}
          </div>
        </div>

        {/* AI Status bar */}
        {aiStatus && (
          <div className={`ai-status ${aiStatus.type}`}>
            {aiStatus.type === 'loading' && <span className="pulse-dot" />}
            {aiStatus.type === 'success' && <CheckIcon />}
            {aiStatus.type === 'error' && <AlertIcon />}
            {aiStatus.message}
            {aiStatus.type === 'loading' && (
              <div className="loading-dots" style={{ marginLeft: 4 }}>
                <span /><span /><span />
              </div>
            )}
          </div>
        )}

        {/* Workspace */}
        <div className="workspace">

          {/* ── LEFT: Editor ── */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-title-dot" />
                Input Text
                {spellFixCount > 0 && (
                  <span className="badge badge-success" style={{ marginLeft: 8, fontSize: 10 }}>
                    <CheckIcon /> {spellFixCount} fixed
                  </span>
                )}
              </div>
              <div className="panel-actions">
                {/* Undo button (compact, in panel header) */}
                {preSpellText && (
                  <button className="btn btn-ghost btn-sm" onClick={handleUndoSpellcheck} title="Undo spellcheck">
                    <UndoIcon /> Undo
                  </button>
                )}
                <button className="btn btn-ghost btn-icon" onClick={handleCopyEditor} title="Copy text" disabled={!rawText}>
                  <CopyIcon />
                </button>
                {/* Browser spellcheck toggle */}
                <label
                  className="spellcheck-toggle"
                  title="Toggle browser spell-check underlines"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSpellcheckEnabled(s => !s)}
                >
                  <span className={`toggle-switch ${spellcheckEnabled ? 'active' : ''}`} />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Underline</span>
                </label>
              </div>
            </div>

            {/* Uncertain words warning */}
            <UncertainWordsPanel
              words={uncertainWords}
              onDismiss={() => setUncertainWords([])}
            />

            <div className="editor-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} data-color-mode="light">
              <MDEditor
                value={rawText}
                onChange={val => {
                  setRawText(val || '');
                  if (spellFixCount > 0) setSpellFixCount(0);
                  if (preSpellText) setPreSpellText('');
                  if (uncertainWords.length) setUncertainWords([]);
                }}
                preview="edit"
                height="100%"
                visibleDragbar={false}
              />
            </div>

            <div className="editor-footer">
              <span className="char-count">
                {charCount > 0 ? `${charCount.toLocaleString()} characters` : 'Empty'}
              </span>
            </div>
          </div>

          {/* ── RIGHT: Preview ── */}
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <div className={`panel-title-dot ${formattedText ? 'success' : ''}`} />
                AI Formatted Preview
              </div>
              <div className="panel-actions">
                {formattedText && (
                  <button className="btn btn-ghost btn-icon" onClick={handleCopyPreview} title="Copy formatted text">
                    <CopyIcon />
                  </button>
                )}
              </div>
            </div>

            <div className="preview-wrapper" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }} data-color-mode="light">
              {!formattedText ? (
                <div className="preview-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <strong>No formatted preview yet</strong>
                  <p>Click <strong>AI Format</strong> to structure your text</p>
                </div>
              ) : (
                <MDEditor
                  value={formattedText}
                  onChange={val => setFormattedText(val || '')}
                  preview="live"
                  height="100%"
                  visibleDragbar={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── DOWNLOAD SECTION ── */}
        <div className="download-section">
          <span className="download-section-label">📥 Download PDF</span>
          <div className="download-actions">
            <PDFDownloadSection
              rawText={rawText || ''}
              formattedText={formattedText || ''}
              spellcheckedText=""
            />
          </div>
        </div>

      </main>

      {/* Settings Modal */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey} setApiKey={setApiKey}
        model={model} setModel={setModel}
      />

      {/* Toasts */}
      <Toasts toasts={toasts} />
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="spinner" width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
