const eastern = "America/New_York";

function partsInEastern(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: eastern,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
}

function part(parts: Intl.DateTimeFormatPart[], type: string) {
  return parts.find((item) => item.type === type)?.value || "";
}

function offsetInEastern(date: Date) {
  const bits = partsInEastern(date);
  let hour = Number(part(bits, "hour"));
  if (hour === 24) hour = 0;
  const asUtc = Date.UTC(
    Number(part(bits, "year")),
    Number(part(bits, "month")) - 1,
    Number(part(bits, "day")),
    hour,
    Number(part(bits, "minute")),
    Number(part(bits, "second")),
  );
  return asUtc - date.getTime();
}

export function isoToEasternInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const bits = partsInEastern(date);
  let hour = part(bits, "hour");
  if (hour === "24") hour = "00";
  return `${part(bits, "year")}-${part(bits, "month")}-${part(bits, "day")}T${hour}:${part(bits, "minute")}`;
}

export function easternInputToIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  let utc = Date.UTC(year, month - 1, day, hour, minute);
  for (let pass = 0; pass < 3; pass += 1) {
    utc = Date.UTC(year, month - 1, day, hour, minute) - offsetInEastern(new Date(utc));
  }
  const iso = new Date(utc).toISOString();
  if (isoToEasternInput(iso) !== value.trim()) return null;
  return iso;
}

export function easternLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    timeZone: eastern,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
