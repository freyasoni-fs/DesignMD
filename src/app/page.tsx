"use client";

import { useState } from "react";
import { ExtractedDesignSystem } from "@/lib/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractedDesignSystem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [markdownUrl, setMarkdownUrl] = useState<string | null>(null);
  
  // Apply Design states
  const [mode, setMode] = useState<'extract' | 'apply'>('extract');
  const [themeCode, setThemeCode] = useState<{css: string, tailwind: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [themeTab, setThemeTab] = useState<'css' | 'tailwind'>('css');

  const analyzeWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze website");
      }

      const data = await res.json();
      setResult(data);

      const mdRes = await fetch("/api/generate-markdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (mdRes.ok) {
        const mdText = await mdRes.text();
        const blob = new Blob([mdText], { type: 'text/markdown' });
        setMarkdownUrl(URL.createObjectURL(blob));
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    setError(null);
    setThemeCode(null);

    try {
      const text = await file.text();
      const res = await fetch("/api/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: text }),
      });

      if (!res.ok) throw new Error("Failed to generate theme");

      const data = await res.json();
      setThemeCode(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError(String(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans selection:bg-orange-500/30">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-4 pt-12">
          <h1 className="text-5xl font-extrabold tracking-tight text-blue-950">
            Design <span className="text-[#F37021]">{mode === 'extract' ? 'Extractor' : 'Generator'}</span>
          </h1>
          <p className="text-lg text-slate-600">
            {mode === 'extract' ? 'Turn any website into an AI-ready design system.' : 'Upload a design.md file to instantly generate CSS and Tailwind themes.'}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="bg-slate-200 p-1 rounded-lg flex gap-1">
            <button
              onClick={() => setMode('extract')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition ${mode === 'extract' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Extract Design
            </button>
            <button
              onClick={() => setMode('apply')}
              className={`px-6 py-2 rounded-md font-medium text-sm transition ${mode === 'apply' ? 'bg-white text-blue-950 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Apply Design
            </button>
          </div>
        </div>

        {mode === 'extract' && (
          <form onSubmit={analyzeWebsite} className="max-w-2xl mx-auto flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className="flex-1 px-5 py-4 rounded-xl bg-white border border-slate-300 shadow-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-[#F37021] focus:border-[#F37021] outline-none transition"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-4 bg-[#F37021] text-white font-bold rounded-xl shadow-lg shadow-[#F37021]/30 hover:bg-[#d95e16] hover:shadow-[#F37021]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Analyzing..." : "Analyze Website"}
            </button>
          </form>
        )}

        {mode === 'apply' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {!themeCode && (
              <div className="flex justify-center border-2 border-dashed border-slate-300 rounded-xl p-12 bg-white hover:border-[#F37021] transition">
                <label className="flex flex-col items-center cursor-pointer">
                  <span className="text-4xl mb-4">📁</span>
                  <span className="text-lg font-bold text-slate-700">Upload design.md</span>
                  <span className="text-sm text-slate-500 mt-2">Select the file extracted from a website</span>
                  <input type="file" accept=".md" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>
            )}
            
            {isGenerating && (
              <div className="text-center p-4 text-[#F37021] font-bold animate-pulse">
                Generating theme files...
              </div>
            )}

            {themeCode && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="flex bg-slate-800 p-2 gap-2">
                  <button
                    onClick={() => setThemeTab('css')}
                    className={`px-4 py-2 rounded text-sm font-bold ${themeTab === 'css' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    globals.css
                  </button>
                  <button
                    onClick={() => setThemeTab('tailwind')}
                    className={`px-4 py-2 rounded text-sm font-bold ${themeTab === 'tailwind' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    tailwind.config.ts
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(themeTab === 'css' ? themeCode.css : themeCode.tailwind);
                      alert('Copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-[#F37021] text-white text-sm font-bold rounded hover:bg-[#d95e16] transition"
                  >
                    Copy Code
                  </button>
                  <button
                    onClick={() => setThemeCode(null)}
                    className="px-4 py-2 bg-slate-600 text-white text-sm font-bold rounded hover:bg-slate-500 transition"
                  >
                    Upload Another
                  </button>
                </div>
                <div className="p-4 bg-slate-900 overflow-x-auto max-h-[600px] overflow-y-auto">
                  <pre className="text-slate-300 font-mono text-sm">
                    {themeTab === 'css' ? themeCode.css : themeCode.tailwind}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto p-5 bg-red-50 text-red-600 border border-red-200 rounded-xl">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-100 p-3 gap-2 overflow-x-auto">
              {['overview', 'colors', 'typography', 'components', 'css-vars', 'raw'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-white text-[#F37021] shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-blue-950 hover:bg-slate-200/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </button>
              ))}
              <div className="flex-1" />
              {markdownUrl && (
                <a
                  href={markdownUrl}
                  download="design.md"
                  className="px-5 py-2.5 bg-blue-50 text-blue-800 border border-blue-200 text-sm font-bold rounded-lg hover:bg-blue-900 hover:text-white transition-all"
                >
                  Download design.md
                </a>
              )}
            </div>

            <div className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-950">Overview</h2>
                    <p className="text-slate-500 text-sm mt-2">Extracted from {result.metadata.url}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center shadow-sm">
                      <div className="text-4xl font-extrabold text-[#F37021]">{result.colors.length}</div>
                      <div className="text-sm text-slate-500 mt-2 font-medium uppercase tracking-wider">Colors</div>
                    </div>
                    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center shadow-sm">
                      <div className="text-4xl font-extrabold text-[#F37021]">{result.typography.length}</div>
                      <div className="text-sm text-slate-500 mt-2 font-medium uppercase tracking-wider">Typography</div>
                    </div>
                    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center shadow-sm">
                      <div className="text-4xl font-extrabold text-[#F37021]">{result.buttonStyles.length}</div>
                      <div className="text-sm text-slate-500 mt-2 font-medium uppercase tracking-wider">Buttons</div>
                    </div>
                    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50 text-center shadow-sm">
                      <div className="text-4xl font-extrabold text-[#F37021]">{result.cssVariables.length}</div>
                      <div className="text-sm text-slate-500 mt-2 font-medium uppercase tracking-wider">Variables</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-950">Colors</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {result.colors.map((color, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
                        <div className="h-28 w-full relative border-b border-slate-100" style={{ backgroundColor: color.hex }}>
                          <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-800 font-mono shadow-sm">
                            {color.usageCount} uses
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="font-mono text-sm font-bold text-slate-900">{color.hex}</div>
                          <div className="text-xs text-slate-500 mt-1 truncate">{color.rgb}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'typography' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-950">Typography Mapping</h2>
                  <div className="space-y-4">
                    {result.typography.map((type, idx) => (
                      <div key={idx} className="p-6 border border-slate-200 rounded-xl bg-slate-50 hover:border-slate-300 transition">
                        <div className="text-xs text-slate-600 mb-4 font-mono flex gap-6 bg-white p-3 rounded-lg border border-slate-200 overflow-x-auto">
                          <span className="text-[#F37021] font-bold">Tag: {type.tag.toUpperCase()}</span>
                          <span>Weight: {type.weight}</span>
                          <span>Size: {type.size}</span>
                          <span>Color: {type.color}</span>
                          <span>Family: {type.fontFamily.split(',')[0]}</span>
                        </div>
                        <div style={{
                          fontFamily: type.fontFamily,
                          fontWeight: type.weight,
                          fontSize: type.size,
                          lineHeight: type.lineHeight,
                          color: type.color !== '#000000' && type.color !== '#ffffff' ? type.color : 'inherit',
                          letterSpacing: type.letterSpacing !== 'normal' ? type.letterSpacing : 'normal'
                        }} className="px-2">
                          The quick brown fox jumps over the lazy dog.
                        </div>
                      </div>
                    ))}
                  </div>

                  {result.fonts && result.fonts.length > 0 && (
                    <div className="pt-6 border-t border-slate-200 mt-8">
                      <h3 className="text-xl font-bold text-blue-950 mb-4">Font Sources</h3>
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                        <table className="w-full text-left text-sm text-slate-700">
                          <thead className="bg-slate-100 text-slate-900 border-b border-slate-200">
                            <tr>
                              <th className="px-6 py-4 font-semibold">Font Family</th>
                              <th className="px-6 py-4 font-semibold">Source URL</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.fonts.map((f, i) => (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="px-6 py-3 text-blue-900 font-bold whitespace-nowrap">{f.family}</td>
                                <td className="px-6 py-3 font-mono text-xs max-w-md truncate" title={f.source}>
                                  {f.source !== 'System/Extracted' ? (
                                    <a href={f.source} target="_blank" rel="noreferrer" className="text-[#F37021] hover:underline">{f.source}</a>
                                  ) : (
                                    <span className="text-slate-400">{f.source}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'components' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-950">Extracted Buttons</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {result.buttonStyles.map((btn, idx) => (
                      <div key={idx} className="p-6 border border-slate-200 rounded-xl bg-slate-50 space-y-6 shadow-sm">
                        <div className="flex items-center justify-center p-8 border border-dashed border-slate-300 rounded-lg bg-white">
                           <button style={{
                             backgroundColor: btn.background,
                             color: btn.color,
                             borderRadius: btn.borderRadius,
                             padding: btn.padding,
                             fontSize: btn.fontSize,
                             fontWeight: btn.fontWeight,
                             border: btn.border !== 'none' ? btn.border : undefined,
                           }}>Sample Button</button>
                        </div>
                        <div className="text-xs text-slate-600 font-mono space-y-2 bg-white p-4 rounded-lg border border-slate-200">
                          <div><span className="text-[#F37021] font-semibold">Class:</span> {btn.className}</div>
                          <div><span className="text-[#F37021] font-semibold">Bg:</span> {btn.background}</div>
                          <div><span className="text-[#F37021] font-semibold">Text:</span> {btn.color}</div>
                          <div><span className="text-[#F37021] font-semibold">Radius:</span> {btn.borderRadius}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'css-vars' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-blue-950">CSS Custom Properties</h2>
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto shadow-sm">
                    <table className="w-full text-left text-sm text-slate-700 font-mono">
                      <thead className="bg-slate-100 text-slate-900 sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Variable</th>
                          <th className="px-6 py-4 font-semibold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.cssVariables.map((v, i) => (
                          <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                            <td className="px-6 py-3 text-blue-800">{v.name}</td>
                            <td className="px-6 py-3 truncate max-w-xs text-slate-600" title={v.value}>{v.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'raw' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-blue-950">Raw JSON Output</h2>
                  <pre className="bg-slate-900 border border-slate-800 text-orange-400 p-6 rounded-xl overflow-x-auto text-xs font-mono shadow-inner">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
