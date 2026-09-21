"use client";

import React from "react";
import Link from "next/link";

interface AgentMarkdownProps {
  content: string;
  isUser?: boolean;
}

// Regex to capture markdown inline patterns:
// 1. Links: [label](url)
// 2. Bold: **text**
// 3. Italic: *text* or _text_
// 4. Code: `code`
const INLINE_REGEX =
  /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;

/**
 * Parses inline markdown tokens into styled React elements.
 */
export function parseInline(text: string, isUser = false): React.ReactNode {
  if (!text) return null;

  const parts = text.split(INLINE_REGEX);
  if (parts.length === 1) return text;

  const boldColor = isUser ? "#FFFFFF" : "#0F172A";
  const linkColor = isUser ? "#93C5FD" : "var(--color-aomori-blue, #1C4F7C)";
  const codeBg = isUser
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(28, 79, 124, 0.08)";
  const codeColor = isUser ? "#FFFFFF" : "var(--color-aomori-dark, #133858)";

  return parts.map((part, index) => {
    if (!part) return null;

    // Link: [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isInternal = href.startsWith("/") || href.startsWith("#");

      const linkStyle: React.CSSProperties = {
        color: linkColor,
        fontWeight: 600,
        textDecoration: "underline",
        textUnderlineOffset: "3px",
        cursor: "pointer",
      };

      if (isInternal) {
        return (
          <Link key={index} href={href} style={linkStyle}>
            {parseInline(label, isUser)}
          </Link>
        );
      }
      return (
        <a
          key={index}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
        >
          {parseInline(label, isUser)}
        </a>
      );
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong
          key={index}
          style={{
            fontWeight: 700,
            color: boldColor,
          }}
        >
          {parseInline(inner, isUser)}
        </strong>
      );
    }

    // Italic: *text* or _text_
    if (
      (part.startsWith("*") && part.endsWith("*") && part.length >= 2) ||
      (part.startsWith("_") && part.endsWith("_") && part.length >= 2)
    ) {
      const inner = part.slice(1, -1);
      return (
        <em
          key={index}
          style={{
            fontStyle: "italic",
            opacity: 0.95,
          }}
        >
          {parseInline(inner, isUser)}
        </em>
      );
    }

    // Inline Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={index}
          style={{
            backgroundColor: codeBg,
            color: codeColor,
            padding: "2px 6px",
            borderRadius: "4px",
            fontSize: "0.85em",
            fontFamily: "var(--font-mono, monospace)",
          }}
        >
          {inner}
        </code>
      );
    }

    return part;
  });
}

/**
 * Checks if a line represents a list item:
 * - Starts with '• ', '- ', '* ', or '1. ', '2. ', etc.
 */
function isListItem(line: string): boolean {
  return /^([•\-*]|\d+\.)\s+/.test(line.trim());
}

/**
 * Extracts clean item text removing the list marker.
 */
function stripListMarker(line: string): string {
  return line.trim().replace(/^([•\-*]|\d+\.)\s+/, "");
}

/**
 * Checks if a line is a section header (e.g. ♨️ **Cultura de Aomori**: or ### Header)
 */
function isHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (/^#{1,6}\s+/.test(trimmed)) return true;
  // Emoji followed by bold title
  if (/^[\p{Emoji}\u2000-\u3300]\s*\*\*.*?\*\*[:]?$/u.test(trimmed))
    return true;
  return false;
}

/**
 * Formats and renders rich markdown content for agent and user chat bubbles.
 */
export function AgentMarkdown({ content, isUser = false }: AgentMarkdownProps) {
  if (!content) return null;

  // Split by horizontal rule separators (e.g. `\n---\n` or `\n\n---\n\n`)
  const sections = content.split(/\n\s*---\s*\n/);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        fontSize: "0.93rem",
        lineHeight: 1.62,
        color: isUser ? "#FFFFFF" : "var(--color-text-title, #1E293B)",
      }}
    >
      {sections.map((section, sIdx) => {
        // Split section by double newlines into blocks
        const rawBlocks = section.split(/\n{2,}/).filter((b) => b.trim());

        return (
          <React.Fragment key={sIdx}>
            {sIdx > 0 && (
              <div
                style={{
                  height: "1px",
                  backgroundColor: isUser
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(28, 79, 124, 0.12)",
                  margin: "8px 0",
                }}
              />
            )}

            {rawBlocks.map((block, bIdx) => {
              const lines = block
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);

              // Check if block contains list items
              const hasList = lines.some((l) => isListItem(l));

              if (hasList) {
                // Group lines into pre-list paragraphs, list items, and post-list paragraphs
                const elements: React.ReactNode[] = [];
                let currentListItems: string[] = [];

                const flushList = () => {
                  if (currentListItems.length > 0) {
                    elements.push(
                      <ul
                        key={`ul-${elements.length}`}
                        style={{
                          listStyle: "none",
                          padding: 0,
                          margin: "6px 0 8px 0",
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        {currentListItems.map((item, iIdx) => (
                          <li
                            key={iIdx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "8px",
                              lineHeight: 1.55,
                            }}
                          >
                            <span
                              style={{
                                color: isUser
                                  ? "#93C5FD"
                                  : "var(--color-aomori-blue, #1C4F7C)",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                                lineHeight: 1.4,
                                userSelect: "none",
                                flexShrink: 0,
                              }}
                            >
                              •
                            </span>
                            <div style={{ flex: 1 }}>
                              {parseInline(stripListMarker(item), isUser)}
                            </div>
                          </li>
                        ))}
                      </ul>
                    );
                    currentListItems = [];
                  }
                };

                lines.forEach((line) => {
                  if (isListItem(line)) {
                    currentListItems.push(line);
                  } else {
                    flushList();
                    if (isHeaderLine(line)) {
                      elements.push(
                        <div
                          key={`hdr-${elements.length}`}
                          style={{
                            fontWeight: 700,
                            fontSize: "0.98rem",
                            color: isUser
                              ? "#FFFFFF"
                              : "var(--color-aomori-dark, #133858)",
                            margin: "4px 0 2px 0",
                          }}
                        >
                          {parseInline(line.replace(/^#{1,6}\s+/, ""), isUser)}
                        </div>
                      );
                    } else {
                      elements.push(
                        <p
                          key={`p-${elements.length}`}
                          style={{
                            margin: "3px 0",
                            lineHeight: 1.55,
                            fontWeight:
                              line.startsWith("**") && line.endsWith("**")
                                ? 600
                                : "normal",
                          }}
                        >
                          {parseInline(line, isUser)}
                        </p>
                      );
                    }
                  }
                });
                flushList();

                return (
                  <div key={bIdx} style={{ margin: "2px 0" }}>
                    {elements}
                  </div>
                );
              }

              // Single or multi-line non-list block
              if (lines.length === 1 && isHeaderLine(lines[0])) {
                const headerText = lines[0].replace(/^#{1,6}\s+/, "");
                return (
                  <div
                    key={bIdx}
                    style={{
                      fontWeight: 700,
                      fontSize: "1rem",
                      color: isUser
                        ? "#FFFFFF"
                        : "var(--color-aomori-dark, #133858)",
                      margin: "4px 0 2px 0",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {parseInline(headerText, isUser)}
                  </div>
                );
              }

              return (
                <p key={bIdx} style={{ margin: "3px 0", lineHeight: 1.6 }}>
                  {lines.map((l, lIdx) => (
                    <React.Fragment key={lIdx}>
                      {lIdx > 0 && <br />}
                      {parseInline(l, isUser)}
                    </React.Fragment>
                  ))}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}
