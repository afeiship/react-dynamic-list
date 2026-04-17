// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { subscribe, emitChange } from "../src/event";

describe("event", () => {
  it("subscribe and emitChange work together", () => {
    const calls: Array<[string, number | undefined]> = [];
    const unsub = subscribe("event-test", (action, index) => {
      calls.push([action, index]);
    });
    emitChange("event-test", "add", 0);
    emitChange("event-test", "remove");
    expect(calls).toEqual([
      ["add", 0],
      ["remove", undefined],
    ]);
    unsub();
  });

  it("unsubscribe stops receiving events", () => {
    const calls: string[] = [];
    const unsub = subscribe("event-test2", (action) => {
      calls.push(action);
    });
    emitChange("event-test2", "add");
    unsub();
    emitChange("event-test2", "remove");
    expect(calls).toEqual(["add"]);
  });
});
