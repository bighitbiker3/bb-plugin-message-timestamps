import type { ExperimentalMessageMetadataProps } from "@get-bb/plugin-sdk";
import { definePluginApp } from "@get-bb/plugin-sdk/app";

function startOfLocalDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatSentAt(timestamp: number): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const time = formatTime(date);
  const day = startOfLocalDay(date);
  const today = startOfLocalDay(now);
  const dayMs = 86_400_000;

  if (day === today) return time;
  if (day === today - dayMs) return `Yesterday ${time}`;

  const datePart = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
  return `${datePart}, ${time}`;
}

function formatFull(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function SentAt({ message }: ExperimentalMessageMetadataProps) {
  if (message.role !== "user" || message.initiator !== "user") return null;
  const label = formatSentAt(message.createdAt);
  if (!label) return null;
  return (
    <time
      dateTime={new Date(message.createdAt).toISOString()}
      title={`Sent ${formatFull(message.createdAt)}`}
    >
      {label}
    </time>
  );
}

export default definePluginApp((app) => {
  app.slots.experimental_messageMetadata({
    id: "sent-at",
    placement: "above",
    component: SentAt,
  });
});
