import { describe, it, expect } from "vitest";
import { contentMatchesType } from "./fileType";

const blob = (bytes: number[]) => new Blob([new Uint8Array(bytes)]);
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0];
const JPEG = [0xff, 0xd8, 0xff, 0xe0, 0, 0];
const PDF = [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31];
const ZIP = [0x50, 0x4b, 0x03, 0x04, 0, 0];
const WEBP = [0x52, 0x49, 0x46, 0x46, 8, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
const RIFF_AVI = [0x52, 0x49, 0x46, 0x46, 8, 0, 0, 0, 0x41, 0x56, 0x49, 0x20];
const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("contentMatchesType (magic bytes)", () => {
  it("accepts real content matching its declared type", async () => {
    expect(await contentMatchesType(blob(PNG), "image/png")).toBe(true);
    expect(await contentMatchesType(blob(JPEG), "image/jpeg")).toBe(true);
    expect(await contentMatchesType(blob(PDF), "application/pdf")).toBe(true);
    expect(await contentMatchesType(blob(ZIP), DOCX)).toBe(true);
    expect(await contentMatchesType(blob(WEBP), "image/webp")).toBe(true);
  });

  it("rejects spoofed content", async () => {
    expect(await contentMatchesType(blob(JPEG), "image/png")).toBe(false);
    const html = new Blob([new TextEncoder().encode("<!DOCTYPE html>")]);
    expect(await contentMatchesType(html, "image/png")).toBe(false);
    expect(await contentMatchesType(html, "application/pdf")).toBe(false);
    // RIFF but not WEBP (e.g. AVI) must not pass as an image.
    expect(await contentMatchesType(blob(RIFF_AVI), "image/webp")).toBe(false);
  });

  it("fails closed for a MIME type it has no signature for", async () => {
    expect(await contentMatchesType(blob(PNG), "application/x-msdownload")).toBe(false);
  });
});
