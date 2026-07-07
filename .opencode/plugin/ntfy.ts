import type { Plugin } from "@opencode-ai/plugin"

const TOPIC = "TU_STOCK_IA";
const URL = `https://ntfy.sh/${TOPIC}`;

async function notify(body: Record<string, unknown>) {
  try {
    await fetch(URL, {
      method: "POST",
      body: JSON.stringify({ topic: TOPIC, ...body }),
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // silent fail — notificacion no critica
  }
}

export default (async () => {
  let working = false;
  let notified = false;

  return {
    "tool.execute.after": () => {
      working = true;
      notified = false;
    },
    "chat.message": (msg: unknown) => {
      if (!working || notified) return;
      const m = msg as Record<string, unknown> | undefined;
      if (m?.role === "assistant") {
        notified = true;
        working = false;
        notify({
          title: "✅ TUSTOCK",
          message: "Tarea completada exitosamente",
          tags: ["white_check_mark"],
          priority: 4,
        });
      }
    },
  };
}) satisfies Plugin;
