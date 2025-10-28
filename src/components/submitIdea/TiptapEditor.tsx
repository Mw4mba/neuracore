// src/components/Tiptap.tsx
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Placeholder from "@tiptap/extension-placeholder";
import MenuBar from "./Menu-bar";
import Blockquote from "@tiptap/extension-blockquote";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight } from "lowlight";

interface TiptapProps {
  content?: string;
  onChange?: (value: string) => void;
}

const Tiptap: React.FC<TiptapProps> = ({ content = "", onChange }) => {
  const [initialContent] = useState<string>(content);
  const lowlight = createLowlight();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { HTMLAttributes: { class: "list-disc ml-3" } },
        orderedList: { HTMLAttributes: { class: "list-decimal ml-3" } },
        codeBlock: false, // disable default code block
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: { class: "code-block" },
      }),
      Highlight.configure({ HTMLAttributes: { class: "hover:bg-green-500" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Blockquote,
      TextStyle, // required for Color
      Color,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    immediatelyRender: false,
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "editor w-full min-h-70 bg-bg-dark  border-border-secondary   px-1.5 py-4 focus-within:ring-2 focus-within:ring-brand-primary transition-all",
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    editor.setOptions({
      editorProps: {
        handleKeyDown(view, event) {
          if ((event.metaKey || event.ctrlKey) && event.key === "z") {
            editor.commands.undo();
            return true;
          }
          if (
            (event.metaKey || event.ctrlKey) &&
            (event.key === "y" || (event.shiftKey && event.key === "Z"))
          ) {
            editor.commands.redo();
            return true;
          }
          return false;
        },
      },
    });
  }, [editor]);

  // Update content when `content` prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="min-h-[156px] border rounded-md bg-slate-50 py-2 px-3">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="editor border border-border-secondary rounded-lg overflow-hidden bg-bg-dark">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
