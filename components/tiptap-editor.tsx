"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "cn";

export type TiptapEditorHandle = {
  appendText: (text: string) => void;
  clear: () => void;
  getText: () => string;
  setContent: (text: string) => void;
};

export const TiptapEditor = forwardRef<
  TiptapEditorHandle,
  {
    content?: string;
    onChange?: (text: string) => void;
    editable?: boolean;
    placeholder?: string;
    className?: string;
    "aria-label"?: string;
  }
>(function TiptapEditor(
  {
    content = "",
    onChange,
    editable = true,
    placeholder = "Draft appears here…",
    className,
    "aria-label": ariaLabel,
  },
  ref
) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content ? `<p>${escapeHtml(content)}</p>` : "",
    editable,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        class: cn(
          "min-h-[140px] px-3 py-2.5 leading-relaxed focus:outline-none",
          "[&_p]:mb-2 [&_p:last-child]:mb-0"
        ),
        style: "font-size: var(--text-13)",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getText());
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useImperativeHandle(
    ref,
    () => ({
      appendText(text: string) {
        if (!editor || !text) return;
        const { state, view } = editor;
        // Insert inside the last node so chunks stay one paragraph while streaming.
        const pos = Math.max(1, state.doc.content.size - 1);
        view.dispatch(state.tr.insertText(text, pos));
      },
      clear() {
        editor?.commands.clearContent(true);
      },
      getText() {
        return editor?.getText() ?? "";
      },
      setContent(text: string) {
        if (!editor) return;
        if (!text) {
          editor.commands.clearContent(true);
          return;
        }
        editor.commands.setContent(`<p>${escapeHtml(text)}</p>`);
      },
    }),
    [editor]
  );

  return (
    <EditorContent
      editor={editor}
      className={cn(
        "rounded-lg border border-border bg-card text-foreground",
        "[&_.tiptap]:outline-none",
        "[&_.is-editor-empty:first-child::before]:pointer-events-none",
        "[&_.is-editor-empty:first-child::before]:float-left",
        "[&_.is-editor-empty:first-child::before]:h-0",
        "[&_.is-editor-empty:first-child::before]:text-text-tertiary",
        "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
        className
      )}
    />
  );
});

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
