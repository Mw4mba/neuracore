import React, { useState, useEffect, useRef } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Strikethrough,
  Type,
  Terminal,
  Palette,
  Undo,
  Redo,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  Highlighter,
  TextQuote,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import Toggle from "./Toggle";
import type { Level } from "@tiptap/extension-heading";

interface MenuBarProps {
  editor: Editor | null;
}

type DropdownType = "headings" | "lists" | "colors" | null;

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const [selectionToolbarVisible, setSelectionToolbarVisible] = useState(false);
  const [selectionPosition, setSelectionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  if (!editor) return null;

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const headingOptions: { level: Level; label: string; icon: React.ReactNode }[] = [
    { level: 1, label: "Heading 1", icon: <Heading1 className="size-4" /> },
    { level: 2, label: "Heading 2", icon: <Heading2 className="size-4" /> },
    { level: 3, label: "Heading 3", icon: <Heading3 className="size-4" /> },
  ];

  const colors = [
    "#000000","#E57373","#F06292","#BA68C8","#9575CD","#7986CB","#64B5F6","#4DD0E1",
    "#4DB6AC","#81C784","#AED581","#DCE775","#FFF176","#FFD54F","#FFB74D","#FF8A65",
    "#A1887F","#E0E0E0","#FFFFFF",
  ];

  const undoRedo = [
    { icon: <Undo className="size-4" />, onClick: () => { editor.chain().focus().undo().run(); return true; }, tooltip: "Undo" },
    { icon: <Redo className="size-4" />, onClick: () => { editor.chain().focus().redo().run(); return true; }, tooltip: "Redo" },
  ];

  const headerListQuoteCode = [
    {
      icon: <Heading1 className="size-4" />,
      onClick: () => setActiveDropdown(activeDropdown === "headings" ? null : "headings"),
      tooltip: "Headers",
      dropdown: (
        <div className="dropdown-menu absolute top-9 left-0 flex flex-col gap-1 p-2 bg-bg-dark border border-border-secondary rounded-md w-32 shadow-md z-[2000]">
          {headingOptions.map((h) => (
            <button
              key={h.level}
              type="button"
              onClick={() => { editor.chain().focus().toggleHeading({ level: h.level }).run(); setActiveDropdown(null); return true; }}
              className={`flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-bg ${
                editor.isActive("heading", { level: h.level }) ? "bg-bg" : ""
              }`}
              title={h.label}
            >
              {h.icon} {h.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <List className="size-4" />,
      onClick: () => setActiveDropdown(activeDropdown === "lists" ? null : "lists"),
      tooltip: "Lists",
      dropdown: (
        <div className="dropdown-menu absolute top-9 left-0 flex flex-col gap-1 p-2 bg-bg-dark border border-border-secondary rounded-md w-42 shadow-md z-[2000]">
          <button
            type="button"
            onClick={() => { editor.chain().focus().toggleBulletList().run(); setActiveDropdown(null); return true; }}
            className="px-2 py-1 rounded hover:bg-bg"
          >
            Bullet List
          </button>
          <button
            type="button"
            onClick={() => { editor.chain().focus().toggleOrderedList().run(); setActiveDropdown(null); return true; }}
            className="px-2 py-1 rounded hover:bg-bg"
          >
            Numbered List
          </button>
        </div>
      ),
    },
    {
      icon: <TextQuote className="size-4" />,
      onClick: () => { editor.chain().focus().toggleBlockquote().run(); return true; },
      tooltip: "Blockquote",
    },
    {
      icon: <Terminal className="size-4" />,
      onClick: () => { editor.chain().focus().toggleCodeBlock().run(); return true; },
      tooltip: "Code Block",
    },
  ];

  const formatting = [
    { icon: <Bold className="size-4" />, onClick: () => { editor.chain().focus().toggleBold().run(); return true; }, tooltip: "Bold" },
    { icon: <Italic className="size-4" />, onClick: () => { editor.chain().focus().toggleItalic().run(); return true; }, tooltip: "Italic" },
    { icon: <Strikethrough className="size-4" />, onClick: () => { editor.chain().focus().toggleStrike().run(); return true; }, tooltip: "Strikethrough" },
    { icon: <Type className="size-4" />, onClick: () => { editor.chain().focus().toggleUnderline().run(); return true; }, tooltip: "Underline" },
    { icon: <Highlighter className="size-4" />, onClick: () => { editor.chain().focus().toggleHighlight().run(); return true; }, tooltip: "Highlight" },
    {
      icon: <LinkIcon className="size-4" />,
      onClick: () => {
        const url = window.prompt("Enter URL");
        if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        return true;
      },
      tooltip: "Insert Link",
    },
  ];

  const alignment = [
    { icon: <AlignLeft className="size-4" />, onClick: () => { editor.chain().focus().setTextAlign("left").run(); return true; }, tooltip: "Left Align" },
    { icon: <AlignCenter className="size-4" />, onClick: () => { editor.chain().focus().setTextAlign("center").run(); return true; }, tooltip: "Center Align" },
    { icon: <AlignRight className="size-4" />, onClick: () => { editor.chain().focus().setTextAlign("right").run(); return true; }, tooltip: "Right Align" },
    { icon: <AlignJustify className="size-4" />, onClick: () => { editor.chain().focus().setTextAlign("justify").run(); return true; }, tooltip: "Justify" },
  ];

  useEffect(() => {
    const handler = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setSelectionToolbarVisible(false);
        return;
      }

      const editorEl = editor.view.dom;
      const anchorNode = selection.anchorNode;
      const focusNode = selection.focusNode;

      if (!editorEl.contains(anchorNode) || !editorEl.contains(focusNode)) {
        setSelectionToolbarVisible(false);
        return;
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect();
      const toolbarWidth = 240;
      const toolbarHeight = 40;

      let left = rect.left + window.scrollX;
      let top = rect.top - toolbarHeight + window.scrollY - 8;

      if (left + toolbarWidth > window.innerWidth - 8) left = window.innerWidth - toolbarWidth - 8;
      if (left < 8) left = 8;

      if (top < window.scrollY + 8) top = rect.bottom + window.scrollY + 8;

      setSelectionPosition({ top, left });
      setSelectionToolbarVisible(true);
    };

    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [editor]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderGroup = (group: typeof undoRedo) => (
    <div className="flex items-center border-r border-border-secondary">
      {group.map((btn, i) => (
        <Toggle key={i} pressed={false} onPressedChange={btn.onClick}>
          <div title={btn.tooltip} className="md:px-2 py-1 hover:bg-bg cursor-pointer">
            {btn.icon}
          </div>
        </Toggle>
      ))}
    </div>
  );

  return (
    <>
      <div ref={toolbarRef} className="flex flex-wrap md:gap-2 bg-bg-dark border-b border-border-secondary p-2 rounded-t-lg relative z-[1000]">
        {renderGroup(undoRedo)}
        <div className="flex items-center border-r border-border-secondary">
          {headerListQuoteCode.map((btn, i) => (
            <div key={i} className="relative">
              <Toggle pressed={false} onPressedChange={btn.onClick}>
                <div title={btn.tooltip} className="md:px-2 py-1 hover:bg-bg cursor-pointer">{btn.icon}</div>
              </Toggle>
              {btn.dropdown && (
                (btn === headerListQuoteCode[0] && activeDropdown === "headings") ||
                (btn === headerListQuoteCode[1] && activeDropdown === "lists")
              ) && btn.dropdown}
            </div>
          ))}
        </div>
        <div className="hidden md:flex">
          {renderGroup(formatting)}
          {renderGroup(alignment)}
        </div>

        <div className="relative">
          <Toggle pressed={false} onPressedChange={() => setActiveDropdown(activeDropdown === "colors" ? null : "colors")}>
            <div title="Text Color" className="md:px-2 py-1 hover:bg-bg cursor-pointer">
              <Palette className="size-4" />
            </div>
          </Toggle>

          {activeDropdown === "colors" && (
            <div className="dropdown-menu absolute top-9 left-0 grid grid-cols-7 gap-1 p-2 bg-bg-dark border border-border-secondary rounded-md w-42 shadow-md z-[2000]">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { editor.chain().focus().setColor(c).run(); setActiveDropdown(null); return true; }}
                  className="w-5 h-5 cursor-pointer rounded-full border border-bg"
                  style={{ backgroundColor: c }}
                />
              ))}
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetColor().run(); setActiveDropdown(null); return true; }}
                className="col-span-7 mt-1 text-xs cursor-pointer text-center py-1 rounded bg-bg hover:bg-bg-dark border border-border-secondary"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {selectionToolbarVisible && (
        <div
          className={`absolute z-[1000] ${
            isMobile ? "flex flex-col" : "flex flex-wrap md:gap-2"
          } p-1 bg-bg-dark border border-border-secondary rounded-lg shadow-md`}
          style={{ top: selectionPosition.top, left: selectionPosition.left }}
        >
          {renderGroup(formatting)}
          {renderGroup(alignment)}
        </div>
      )}
    </>
  );
};

export default MenuBar;
