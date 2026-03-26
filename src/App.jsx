import { useMemo, useState } from "react";

/** ---------- Reusable UI ---------- */
function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 disabled:opacity-60 disabled:cursor-not-allowed";

  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/15",
    ghost: "hover:bg-white/10 text-slate-200",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? "Loading..." : children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return <div className={`glass rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/20 ${className}`}>{children}</div>;
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
      {subtitle ? <p className="text-slate-300 mt-1">{subtitle}</p> : null}
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
      {children}
    </span>
  );
}

/** ---------- States ---------- */
function EmptyState({ onUseSample }) {
  return (
    <div className="text-center py-10">
      <p className="text-slate-300 mb-4">No output yet. Try sample input to preview results instantly.</p>
      <Button onClick={onUseSample} variant="secondary">
        Use Sample Input
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="py-10 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-300/40 border-t-indigo-400" />
      <p className="mt-3 text-slate-300">Processing...</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
      <p className="text-red-300 text-sm">{message}</p>
      <Button variant="secondary" className="mt-3" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const samplePrompt = "Summarize why VoiceWell helps users improve speaking confidence.";

  const stats = useMemo(
    () => [
      { label: "Response Time", value: "Fast" },
      { label: "UI Readability", value: "High" },
      { label: "Demo Ready", value: "Yes" },
    ],
    []
  );

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setStatus("loading");
    setError("");
    setResult("");

    // Simulated API call (replace with your real API)
    setTimeout(() => {
      try {
        const generated = `✅ Generated Output

Prompt:
"${prompt}"

Result:
VoiceWell improves speaking confidence through guided practice, instant feedback loops, and clear progress visibility.
Users get structured prompts, low-friction repetition, and confidence metrics that make communication growth tangible.`;

        setResult(generated);
        setStatus("success");
      } catch (e) {
        setError("Something went wrong while generating output.");
        setStatus("error");
      }
    }, 1200);
  }

  function handleUseSample() {
    setPrompt(samplePrompt);
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    alert("Copied to clipboard ✅");
  }

  function handleReset() {
    setPrompt("");
    setResult("");
    setStatus("idle");
    setError("");
  }

  return (
    <div className={darkMode ? "min-h-screen bg-slate-950 text-slate-100" : "min-h-screen bg-slate-100 text-slate-900"}>
      {/* Navbar */}
      <header className={`sticky top-0 z-50 border-b ${darkMode ? "border-white/10 bg-slate-950/80" : "border-slate-300 bg-white/80"} backdrop-blur`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400" />
            <span className="font-bold tracking-tight">VoiceWell AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Hackathon Mode</Badge>
            <Button variant="ghost" onClick={() => setDarkMode((v) => !v)}>
              {darkMode ? "Light" : "Dark"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          Build confidence with <span className="gradient-text">VoiceWell AI</span>
        </h1>
        <p className={`mt-4 max-w-2xl ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
          A polished, fast, demo-ready frontend. Input your prompt, generate results, copy output, and present a clean user journey for judges.
        </p>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className={darkMode ? "" : "bg-white border-slate-200"}>
            <p className={darkMode ? "text-slate-400 text-sm" : "text-slate-600 text-sm"}>{s.label}</p>
            <p className="mt-1 text-lg font-bold">{s.value}</p>
          </Card>
        ))}
      </section>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 pb-12 grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Input Panel */}
        <Card className={darkMode ? "" : "bg-white border-slate-200"}>
          <SectionTitle title="Try It Live" subtitle="Enter prompt and generate output." />
          <label className={`text-sm ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            placeholder="Type your input here..."
            className={`mt-2 w-full rounded-xl p-3 outline-none border ${
              darkMode
                ? "bg-slate-900 border-white/15 text-white placeholder:text-slate-500 focus:border-indigo-400/60"
                : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
            }`}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleGenerate} loading={status === "loading"}>
              Generate
            </Button>
            <Button variant="secondary" onClick={handleUseSample}>
              Sample
            </Button>
            <Button variant="ghost" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </Card>

        {/* Output Panel */}
        <Card className={darkMode ? "" : "bg-white border-slate-200"}>
          <SectionTitle title="Output" subtitle="Clean result area for demo presentation." />

          {status === "idle" && !result && <EmptyState onUseSample={handleUseSample} />}
          {status === "loading" && <LoadingState />}
          {status === "error" && <ErrorState message={error} onRetry={handleGenerate} />}
          {status === "success" && (
            <div>
              <pre
                className={`whitespace-pre-wrap rounded-xl p-4 text-sm leading-relaxed border ${
                  darkMode ? "bg-slate-900 border-white/10 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                {result}
              </pre>
              <div className="mt-3">
                <Button variant="secondary" onClick={handleCopy}>
                  Copy Output
                </Button>
              </div>
            </div>
          )}
        </Card>
      </main>

      <footer className={`border-t ${darkMode ? "border-white/10" : "border-slate-200"}`}>
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-slate-400">
          Built for Hackathon Demo • Vite + React + Tailwind
        </div>
      </footer>
    </div>
  );
}