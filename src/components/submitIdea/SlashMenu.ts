// slashExtension.ts
import Suggestion from "@tiptap/suggestion";
import { Extension } from "@tiptap/core";

/**
 * This extension triggers a suggestion when the user types "/".
 * It doesn't insert a new node itself — it lets the UI (SlashMenu) handle the command insertion.
 *
 * Note: keep it lightweight. We expose events through `onChange`/`onExit` callbacks via suggestion.
 */

type CommandItem = {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string; // for easy matching if needed
  command: (props: { editor: any; range: { from: number; to: number } }) => void;
};

const SlashExtension = Extension.create({
  name: "slashMenu",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: true,
        command: ({ editor, range, props }: any) => {
          // default no-op; UI will call actual command when user chooses one
        },
        items: () => [],
        render: () => null,
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashExtension;
export type { CommandItem };
