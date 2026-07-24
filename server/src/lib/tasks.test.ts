import { describe, it, expect } from "vitest";
import { endOfDueDateManila } from "./tasks";

// The deadline sweep deletes tasks whose due-date CALENDAR DAY (Asia/Manila,
// UTC+8) has fully elapsed — not at the due clock-time. These cover the cutoff
// math since the sweep is destructive.
describe("endOfDueDateManila", () => {
  it("maps a mid-day due time to 23:59:59.999 of that Manila day (in UTC)", () => {
    // 2026-07-17 06:00Z == 2026-07-17 14:00 +08
    const cutoff = endOfDueDateManila(new Date("2026-07-17T06:00:00.000Z"));
    // end of 2026-07-17 in Manila == 2026-07-17 23:59:59.999 +08 == 15:59:59.999Z
    expect(cutoff.toISOString()).toBe("2026-07-17T15:59:59.999Z");
  });

  it("keeps a late-evening Manila due time on its own calendar day", () => {
    // 2026-07-17 15:00Z == 2026-07-17 23:00 +08 (still the 17th in Manila)
    const cutoff = endOfDueDateManila(new Date("2026-07-17T15:00:00.000Z"));
    expect(cutoff.toISOString()).toBe("2026-07-17T15:59:59.999Z");
  });

  it("rolls to the next Manila day when the UTC instant is past Manila midnight", () => {
    // 2026-07-17 16:00Z == 2026-07-18 00:00 +08 → the 18th in Manila
    const cutoff = endOfDueDateManila(new Date("2026-07-17T16:00:00.000Z"));
    expect(cutoff.toISOString()).toBe("2026-07-18T15:59:59.999Z");
  });

  it("a task due earlier today (Manila) survives until end of the Manila day", () => {
    // Pick 'now' as 2026-07-17 10:00 +08; a task due 08:00 +08 same day.
    const now = new Date("2026-07-17T02:00:00.000Z"); // 10:00 +08
    const due = new Date("2026-07-17T00:00:00.000Z"); // 08:00 +08
    expect(endOfDueDateManila(due).getTime()).toBeGreaterThan(now.getTime());
  });

  it("a task due yesterday (Manila) is already past its cutoff", () => {
    const now = new Date("2026-07-17T02:00:00.000Z"); // 10:00 +08 on the 17th
    const due = new Date("2026-07-16T00:00:00.000Z"); // 08:00 +08 on the 16th
    expect(endOfDueDateManila(due).getTime()).toBeLessThanOrEqual(now.getTime());
  });
});
