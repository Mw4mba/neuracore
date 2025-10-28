// // SlashMenu.tsx
// import React, { useEffect, useRef, useState } from "react";
// import { Editor } from "@tiptap/react";
// import {
//   Heading1,
//   Heading2,
//   Heading3,
//   List,
//   ListOrdered,
//   Quote,
//   Code,
//   Slash,
//   RefreshCw,
//   AlignLeft,
//   Zap,
//   Type,
//   MagicWand,
//   RotateCw,
// } from "lucide-react";
// import type { CommandItem } from "./slashExtension";

// /**
//  * SlashMenu component:
//  * - props.editor: tiptap editor instance
//  * - listens for suggestion plugin state via editor.extension.storage or using editor.on events
//  *
//  * This implementation uses a simple approach:
//  * - Detect the "slash" token by listening to "transaction" and checking the text before the cursor.
//  * - Show the popup anchored to the current selection using getBoundingClientRect
//  *
//  * This avoids deep coupling to the suggestion plugin API while remaining robust.
//  *
//  * NOTE: If you prefer to use @tiptap/suggestion render API directly, swap in the plugin render hooks.
//  */

// interface SlashMenuProps {
//   editor: Editor;
//   theme?: "auto" | "light" | "dark";
// }

// const COMMANDS: CommandItem[] = [
//   // Heading group
//   {
//     id: "h1",
//     title: "Heading 1",
//     subtitle: "Big section heading",
//     icon: "H1",
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleHeading({ level: 1 }).run();
//     },
//   },
//   {
//     id: "h2",
//     title: "Heading 2",
//     subtitle: "Medium section heading",
//     icon: "H2",
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleHeading({ level: 2 }).run();
//     },
//   },
//   {
//     id: "h3",
//     title: "Heading 3",
//     subtitle: "Smaller heading",
//     icon: "H3",
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleHeading({ level: 3 }).run();
//     },
//   },

//   // Lists & blocks
//   {
//     id: "bullet",
//     title: "Bulleted list",
//     subtitle: "Create a bullet list",
//     icon: "UL",
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleBulletList().run();
//     },
//   },
//   {
//     id: "ordered",
//     title: "Numbered list",
//     subtitle: "Create an ordered list",
//     icon: "OL",
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleOrderedList().run();
//     },
//   },
//   {
//     id: "quote",
//     title: "Quote",
//     subtitle: "Create a block quote",
//     icon: "QUOTE",
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleBlockquote().run();
//     },
//   },
//   {
//     id: "code",
//     title: "Code block",
//     subtitle: "Insert code block",
//     icon: "CODE",
//     command: ({ editor, range }) => {
//       editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
//     },
//   },

//   // AI actions group
//   {
//     id: "ai_summarize",
//     title: "AI: Summarize selection",
//     subtitle: "Create a short summary of the selected text",
//     icon: "AI_SUM",
//     command: async ({ editor, range }: any) => {
//       const selectedText = editor.state.doc.textBetween(
//         editor.state.selection.from,
//         editor.state.selection.to,
//         " "
//       );

//       // placeholder: call your backend or AI function
//       const result = await callAI("summarize", selectedText);
//       // replace the selection with the AI result
//       editor.chain().focus().deleteRange(range).insertContent(result).run();
//     },
//   },
//   {
//     id: "ai_expand",
//     title: "AI: Expand / Elaborate",
//     subtitle: "Make the selection more detailed",
//     icon: "AI_EXPAND",
//     command: async ({ editor, range }: any) => {
//       const text = editor.state.doc.textBetween(
//         editor.state.selection.from,
//         editor.state.selection.to,
//         " "
//       );
//       const result = await callAI("expand", text);
//       editor.chain().focus().deleteRange(range).insertContent(result).run();
//     },
//   },
//   {
//     id: "ai_rewrite",
//     title: "AI: Rewrite (tone)",
//     subtitle: "Rewrite selection with better clarity or tone",
//     icon: "AI_REWRITE",
//     command: async ({ editor, range }: any) => {
//       const text = editor.state.doc.textBetween(
//         editor.state.selection.from,
//         editor.state.selection.to,
//         " "
//       );
//       const result = await callAI("rewrite", text);
//       editor.chain().focus().deleteRange(range).insertContent(result).run();
//     },
//   },
//   {
//     id: "ai_fix_grammar",
//     title: "AI: Fix grammar",
//     subtitle: "Correct grammar and spelling",
//     icon: "AI_GRAMMAR",
//     command: async ({ editor, range }: any) => {
//       const text = editor.state.doc.textBetween(
//         editor.state.selection.from,
//         editor.state.selection.to,
//         " "
//       );
//       const result = await callAI("grammar", text);
//       editor.chain().focus().deleteRange(range).insertContent(result).run();
//     },
//   },
// ];

// /** Temporary stub for calling AI — replace with your own API call */
// async function callAI(action: string, text: string) {
//   // Example: POST /api/ai with {action, text} and return result.text
//   // Replace with your implementation.
//   // For demo, return a fake message with a small delay:
//   await new Promise((r) => setTimeout(r, 700));
//   switch (action) {
//     case "summarize":
//       return `Summary: ${text.slice(0, 120)}${text.length > 120 ? "…" : ""}`;
//     case "expand":
//       return `${text}\n\n(Expanded with more detail: add supporting points, examples, and context.)`;
//     case "rewrite":
//       return `${text} — rewritten for clarity and flow.`;
//     case "grammar":
//       return `${text} — grammar & spelling corrected.`;
//     default:
//       return text;
//   }
// }

// /** Utility: fuzzy filter (simple) */
// function fuzzyMatch(input: string, term: string) {
//   return term.toLowerCase().includes(input.toLowerCase());
// }

// export default function SlashMenu({ editor, theme = "auto" }: { editor: Editor; theme?: "auto" | "light" | "dark" }) {
//   const [open, setOpen] = useState(false);
//   const [query, setQuery] = useState("");
//   const [items, setItems] = useState<CommandItem[]>(COMMANDS);
//   const [selectedIndex, setSelectedIndex] = useState(0);
//   const anchorRef = useRef<DOMRect | null>(null);
//   const menuRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!editor) return;

//     const handleTransaction = () => {
//       const { state } = editor;
//       const { from } = state.selection;
//       // get up to 50 chars before the cursor
//       const start = Math.max(0, from - 50);
//       const textBefore = state.doc.textBetween(start, from, "\n");
//       // simple detection for "/"
//       const match = textBefore.match(/(^|\s)\/([^\s]*)$/);
//       if (match) {
//         setOpen(true);
//         setQuery(match[2] || "");
//         setSelectedIndex(0);

//         // compute anchor rect from DOM selection
//         const sel = window.getSelection();
//         if (sel && sel.rangeCount) {
//           const range = sel.getRangeAt(0).cloneRange();
//           range.collapse(true);
//           const rect = range.getBoundingClientRect();
//           anchorRef.current = rect;
//         }
//       } else {
//         setOpen(false);
//         setQuery("");
//         anchorRef.current = null;
//       }
//     };

//     editor.on("transaction", handleTransaction);
//     return () => {
//       editor.off("transaction", handleTransaction);
//     };
//   }, [editor]);

//   useEffect(() => {
//     // filter items by query
//     if (!query) {
//       setItems(COMMANDS);
//     } else {
//       const q = query.trim();
//       const filtered = COMMANDS.filter((c) => fuzzyMatch(q, `${c.title} ${c.subtitle || ""}`));
//       setItems(filtered);
//     }
//   }, [query]);

//   useEffect(() => {
//     // keyboard nav
//     const onKey = (e: KeyboardEvent) => {
//       if (!open) return;
//       if (e.key === "ArrowDown") {
//         e.preventDefault();
//         setSelectedIndex((i) => Math.min(items.length - 1, i + 1));
//       } else if (e.key === "ArrowUp") {
//         e.preventDefault();
//         setSelectedIndex((i) => Math.max(0, i - 1));
//       } else if (e.key === "Enter") {
//         e.preventDefault();
//         // run command at selectedIndex
//         const item = items[selectedIndex];
//         if (!item) return;
//         // figure range of the / trigger to delete it first
//         const { state } = editor;
//         const { from } = state.selection;
//         const start = Math.max(0, from - 50);
//         const textBefore = state.doc.textBetween(start, from, "\n");
//         const match = textBefore.match(/(^|\s)\/([^\s]*)$/);
//         let rangeFrom = from, rangeTo = from;
//         if (match) {
//           const matchLen = match[2] ? match[2].length + 1 : 1; // slash + query
//           rangeFrom = from - matchLen;
//           rangeTo = from;
//         }
//         item.command({ editor, range: { from: rangeFrom, to: rangeTo } });
//         setOpen(false);
//       } else if (e.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [open, items, selectedIndex, editor]);

//   if (!open || !anchorRef.current) return null;

//   // compute position
//   const anchor = anchorRef.current;
//   const top = Math.max(8, anchor.bottom + window.scrollY + 6);
//   const left = Math.max(8, anchor.left + window.scrollX - 8);

//   return (
//     <div
//       ref={menuRef}
//       className="absolute z-50"
//       style={{ top, left, minWidth: 320 }}
//     >
//       <div className="rounded-lg overflow-hidden shadow-lg ring-1 ring-black/8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-700">
//         <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
//           <Slash className="h-4 w-4 text-neutral-400" />
//           <input
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             autoFocus
//             className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-400 text-neutral-800 dark:text-neutral-100"
//             placeholder="Type a command (e.g. heading, summarize)..."
//           />
//         </div>

//         <div className="max-h-64 overflow-auto">
//           {items.length === 0 ? (
//             <div className="p-3 text-sm text-neutral-500">No commands</div>
//           ) : (
//             items.map((item, idx) => {
//               const active = idx === selectedIndex;
//               return (
//                 <button
//                   key={item.id}
//                   onMouseEnter={() => setSelectedIndex(idx)}
//                   onClick={() => {
//                     // compute range again (same logic as Enter)
//                     const { state } = editor;
//                     const { from } = state.selection;
//                     const start = Math.max(0, from - 50);
//                     const textBefore = state.doc.textBetween(start, from, "\n");
//                     const match = textBefore.match(/(^|\s)\/([^\s]*)$/);
//                     let rangeFrom = from, rangeTo = from;
//                     if (match) {
//                       const matchLen = match[2] ? match[2].length + 1 : 1;
//                       rangeFrom = from - matchLen;
//                       rangeTo = from;
//                     }
//                     item.command({ editor, range: { from: rangeFrom, to: rangeTo } });
//                     setOpen(false);
//                   }}
//                   className={`w-full text-left px-3 py-2 flex items-center gap-3 transition ${
//                     active
//                       ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-50"
//                       : "hover:bg-neutral-50 dark:hover:bg-neutral-850 text-neutral-700 dark:text-neutral-200"
//                   }`}
//                 >
//                   <div className="flex-shrink-0 h-8 w-8 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm font-medium">
//                     {/* Render small icon or initials */}
//                     {item.id.startsWith("ai") ? <Zap className="h-4 w-4" /> : <Type className="h-4 w-4" />}
//                   </div>

//                   <div className="flex-1">
//                     <div className="text-sm font-medium">{item.title}</div>
//                     <div className="text-xs text-neutral-500 dark:text-neutral-400">{item.subtitle}</div>
//                   </div>

//                   <div className="text-xs text-neutral-400">↵</div>
//                 </button>
//               );
//             })
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
