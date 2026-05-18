/* Converts the old Gantt-style roadmap format into TipTap JSON so existing
   data is preserved as a task-list whiteboard on first open. */

interface LegacyItem {
  id: string;
  label: string;
  status: "done" | "in-progress" | "todo";
  quarter: string;
  description?: string;
}

interface LegacyCategory {
  id: string;
  label: string;
  items: LegacyItem[];
}

interface LegacyRoadmap {
  description?: string;
  categories?: LegacyCategory[];
}

function text(value: string) {
  return { type: "text", text: value };
}

function paragraph(children: object[]) {
  return { type: "paragraph", content: children };
}

function heading(level: 1 | 2 | 3, value: string) {
  return { type: "heading", attrs: { level }, content: [text(value)] };
}

function taskItem(checked: boolean, label: string, detail?: string) {
  const parts: object[] = [text(label)];
  if (detail) parts.push(text(` — ${detail}`));
  return {
    type: "taskItem",
    attrs: { checked },
    content: [paragraph(parts)],
  };
}

export function legacyToTiptap(roadmap: LegacyRoadmap): object {
  const nodes: object[] = [];

  if (roadmap.description) {
    nodes.push(paragraph([text(roadmap.description)]));
  }

  for (const cat of roadmap.categories ?? []) {
    nodes.push(heading(2, cat.label));
    nodes.push({
      type: "taskList",
      content: cat.items.map((item) =>
        taskItem(item.status === "done", item.label, item.description ?? `${item.quarter}`)
      ),
    });
  }

  return { type: "doc", content: nodes };
}
