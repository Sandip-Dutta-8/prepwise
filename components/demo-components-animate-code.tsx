"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, Copy, Check } from "lucide-react";

interface CodeDemoProps {
    code?: string;
    filename?: string;
    language?: string;
    duration?: number;
    delay?: number;
    writing?: boolean;
    cursor?: boolean;
    className?: string;
}

const DEFAULT_CODE = `import { useState, useEffect } from "react";

const useFetch = (url, options) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          throw new Error("HTTP error!");
        }
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [url, options]);

  return { data, loading, error };
};

export default useFetch;
`;

type Token = { text: string; type: string };

function tokenizeLine(line: string): Token[] {
    const patterns: { type: string; regex: RegExp }[] = [
        { type: "comment", regex: /\/\/.*/ },
        { type: "string", regex: /(['"`])(?:\\.|(?!\1).)*\1/ },
        {
            type: "keyword",
            regex:
                /\b(import|const|let|var|function|return|if|else|try|catch|finally|async|await|from|export|default|new|throw|for|while)\b/,
        },
        { type: "boolean", regex: /\b(true|false|null|undefined)\b/ },
        { type: "number", regex: /\b\d+(\.\d+)?\b/ },
        { type: "function", regex: /\b[A-Za-z_$][\w$]*(?=\()/ },
        { type: "property", regex: /\.[A-Za-z_$][\w$]*/ },
    ];

    const combined = new RegExp(
        patterns.map((p) => `(${p.regex.source})`).join("|"),
        "g"
    );

    const tokens: Token[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = combined.exec(line)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ text: line.slice(lastIndex, match.index), type: "plain" });
        }
        let type = "plain";
        for (let i = 0; i < patterns.length; i++) {
            if (match[i + 1] !== undefined) {
                type = patterns[i].type;
                break;
            }
        }
        tokens.push({ text: match[0], type });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
        tokens.push({ text: line.slice(lastIndex), type: "plain" });
    }

    return tokens;
}

const TOKEN_COLORS: Record<string, string> = {
    comment: "text-stone-500 italic",
    string: "text-emerald-400",
    keyword: "text-purple-400",
    boolean: "text-amber-400",
    number: "text-amber-400",
    function: "text-sky-400",
    property: "text-sky-300",
    plain: "text-stone-300",
};

export const CodeDemo = ({
    code = DEFAULT_CODE,
    filename = "use-fetch.jsx",
    duration = 3000,
    delay = 0,
    writing = true,
    cursor = true,
    className = "",
}: CodeDemoProps) => {
    const [visibleChars, setVisibleChars] = useState(writing ? 0 : code.length);
    const [copied, setCopied] = useState(false);
    const frameRef = useRef<number | null>(null);

    useEffect(() => {
        const totalChars = code.length;

        if (!writing) {
            frameRef.current = requestAnimationFrame(() =>
                setVisibleChars(totalChars)
            );
            return () => {
                if (frameRef.current) cancelAnimationFrame(frameRef.current);
            };
        }

        let start: number | null = null;

        const step = (timestamp: number) => {
            if (start === null) start = timestamp;
            const elapsed = timestamp - start - delay;

            if (elapsed < 0) {
                setVisibleChars(0);
                frameRef.current = requestAnimationFrame(step);
                return;
            }

            const progress = Math.min(elapsed / duration, 1);
            setVisibleChars(Math.floor(progress * totalChars));

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(step);
            }
        };

        frameRef.current = requestAnimationFrame(step);

        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [code, duration, delay, writing]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard unavailable — fail silently
        }
    };

    const visibleCode = code.slice(0, visibleChars);
    const lines = visibleCode.split("\n");

    return (
        <div
            className={`w-full sm:w-110 h-120 rounded-xl bg-[#0f0f11] border border-white/10 overflow-hidden flex flex-col ${className}`}
        >
            {/* Header */}
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center justify-between px-3.5 shrink-0">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                    <Code2 size={14} className="text-amber-400" />
                    <span className="font-mono">{filename}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="text-stone-500 hover:text-stone-300 transition-colors"
                    aria-label="Copy code"
                    type="button"
                >
                    {copied ? (
                        <Check size={14} className="text-emerald-400" />
                    ) : (
                        <Copy size={14} />
                    )}
                </button>
            </div>

            {/* Code body */}
            <div className="flex-1 overflow-auto p-4 font-mono text-[13px] leading-relaxed">
                <pre className="whitespace-pre-wrap wrap-break-word">
                    {lines.map((line, i) => {
                        const tokens = tokenizeLine(line);
                        const isLastLine = i === lines.length - 1;
                        return (
                            <div key={i} className="flex">
                                <span className="select-none text-stone-600 w-7 shrink-0 text-right pr-3">
                                    {i + 1}
                                </span>
                                <span>
                                    {tokens.map((t, j) => (
                                        <span key={j} className={TOKEN_COLORS[t.type]}>
                                            {t.text}
                                        </span>
                                    ))}
                                    {isLastLine && cursor && visibleChars < code.length && (
                                        <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-0.5 animate-pulse align-middle" />
                                    )}
                                </span>
                            </div>
                        );
                    })}
                </pre>
            </div>
        </div>
    );
};

export default CodeDemo;