import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { parseInline, AgentMarkdown } from "../src/components/AgentMarkdown";

test("Markdown Parser: parseInline transforma negritas sin dejar asteriscos", () => {
  const rendered = parseInline(
    "Hola **Sensei**, bienvenido a **Aomori**"
  ) as React.ReactNode[];
  assert.ok(Array.isArray(rendered));
  assert.equal(rendered[0], "Hola ");

  // Elemento 1 es un React element de tipo strong
  const strong1 = rendered[1] as React.ReactElement<{
    children: React.ReactNode;
  }>;
  assert.equal(strong1.type, "strong");
  assert.equal(strong1.props.children, "Sensei");

  assert.equal(rendered[2], ", bienvenido a ");
  const strong2 = rendered[3] as React.ReactElement<{
    children: React.ReactNode;
  }>;
  assert.equal(strong2.type, "strong");
  assert.equal(strong2.props.children, "Aomori");
});

test("Markdown Parser: parseInline convierte enlaces markdown [texto](url) en links", () => {
  const rendered = parseInline(
    "Descubre más en nuestra [Guía Cultural](/cultura)."
  ) as React.ReactNode[];
  assert.ok(Array.isArray(rendered));
  assert.equal(rendered[0], "Descubre más en nuestra ");

  const linkEl = rendered[1] as React.ReactElement<{
    href?: string;
    children: React.ReactNode;
  }>;
  assert.ok(linkEl.props.href === "/cultura");
  assert.equal(linkEl.props.children, "Guía Cultural");
});

test("Markdown Parser: parseInline maneja código y cursivas limpiamente", () => {
  const rendered = parseInline(
    "Usa el comando `ollama run` y relájate en *Sukayu*."
  ) as React.ReactNode[];
  assert.ok(Array.isArray(rendered));

  const codeEl = rendered[1] as React.ReactElement<{
    children: React.ReactNode;
  }>;
  assert.equal(codeEl.type, "code");
  assert.equal(codeEl.props.children, "ollama run");

  const emEl = rendered[3] as React.ReactElement<{ children: React.ReactNode }>;
  assert.equal(emEl.type, "em");
  assert.equal(emEl.props.children, "Sukayu");
});

test("Markdown Parser: AgentMarkdown renderiza el mensaje cultural del Sensei sin romper bloques", () => {
  const content = `♨️ **Cultura de Aomori - Etiqueta de Onsen**:

**Reglas del Onsen en Japón:**
• **Sin ropa**: Todos entran completamente desnudos al baño tradicional comunitario.
• **Ducharse antes**: Siempre ducharse antes de entrar.
• **Tatuajes**: Consultar antes.

En Aomori, el **Sukayu Onsen** es el más famoso.

Descubre más detalles en nuestra [Guía Cultural](/cultura).`;

  const component = AgentMarkdown({ content, isUser: false });
  assert.ok(component !== null);
  assert.equal(component.type, "div");
});
