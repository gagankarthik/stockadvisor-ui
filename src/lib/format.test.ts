import { describe, it, expect } from "vitest";
import {
  fmtMoney,
  fmtNum,
  fmtPct,
  fmtSignedPct,
  fmtCompact,
  dirClass,
  ageLabel,
  scoreTone,
  signalTone,
} from "./format";

describe("formatters — null/NaN/Infinity all render the em-dash placeholder", () => {
  const bad = [null, undefined, NaN, Infinity, -Infinity] as const;
  it.each(bad)("fmtMoney(%s) === '—'", (v) => expect(fmtMoney(v)).toBe("—"));
  it.each(bad)("fmtNum(%s) === '—'", (v) => expect(fmtNum(v)).toBe("—"));
  it.each(bad)("fmtPct(%s) === '—'", (v) => expect(fmtPct(v)).toBe("—"));
  it.each(bad)("fmtSignedPct(%s) === '—'", (v) => expect(fmtSignedPct(v)).toBe("—"));
  it.each(bad)("fmtCompact(%s) === '—'", (v) => expect(fmtCompact(v)).toBe("—"));
});

describe("fmtMoney", () => {
  it("formats USD with default 2dp", () => expect(fmtMoney(1234.5)).toBe("$1,234.50"));
  it("respects a custom precision", () => expect(fmtMoney(1234.5, 0)).toBe("$1,235"));
});

describe("fmtNum", () => {
  it("groups thousands", () => expect(fmtNum(1234567, 0)).toBe("1,234,567"));
  it("keeps requested decimals", () => expect(fmtNum(3.14159, 2)).toBe("3.14"));
});

describe("fmtPct / fmtSignedPct", () => {
  it("appends a percent sign", () => expect(fmtPct(12.34, 1)).toBe("12.3%"));
  it("prefixes + for non-negative", () => expect(fmtSignedPct(5, 1)).toBe("+5.0%"));
  it("keeps - for negatives (no double sign)", () => expect(fmtSignedPct(-5, 1)).toBe("-5.0%"));
  it("treats zero as non-negative", () => expect(fmtSignedPct(0, 0)).toBe("+0%"));
});

describe("dirClass — semantic up/down/neutral color", () => {
  it("positive → up", () => expect(dirClass(1)).toBe("text-up"));
  it("negative → down", () => expect(dirClass(-1)).toBe("text-down"));
  it("zero → neutral", () => expect(dirClass(0)).toBe("text-mute"));
  it("null → neutral", () => expect(dirClass(null)).toBe("text-mute"));
});

describe("ageLabel — coarse relative time", () => {
  it("under a minute", () => expect(ageLabel(30)).toBe("just now"));
  it("minutes", () => expect(ageLabel(5 * 60)).toBe("5m ago"));
  it("hours", () => expect(ageLabel(3 * 3600)).toBe("3h ago"));
  it("days", () => expect(ageLabel(2 * 86400)).toBe("2d ago"));
  it("null → em-dash", () => expect(ageLabel(null)).toBe("—"));
});

describe("scoreTone — banded color for a 0..100 score", () => {
  it("80+ → brass-2", () => expect(scoreTone(85)).toBe("text-brass-2"));
  it("60–79 → brass", () => expect(scoreTone(60)).toBe("text-brass"));
  it("40–59 → chalk", () => expect(scoreTone(40)).toBe("text-chalk"));
  it("<40 → mute", () => expect(scoreTone(10)).toBe("text-mute"));
  it("null → mute", () => expect(scoreTone(null)).toBe("text-mute"));
});

describe("signalTone — BUY/SELL/other palette", () => {
  it("BUY is up-toned", () => expect(signalTone("BUY").fg).toBe("text-up"));
  it("SELL is down-toned", () => expect(signalTone("SELL").fg).toBe("text-down"));
  it("HOLD/unknown is muted", () => {
    expect(signalTone("HOLD").fg).toBe("text-mute");
    expect(signalTone(null).fg).toBe("text-mute");
  });
});
