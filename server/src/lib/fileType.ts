// Magic-byte (file signature) verification.
//
// FormData's `file.type` is supplied by the client and is trivially spoofable,
// so before we hand an upload to Cloudinary we confirm the actual leading bytes
// are consistent with the declared MIME type. This blocks e.g. an HTML/SVG/EXE
// payload masquerading as `image/png`.

type Signature = { offset: number; bytes: number[] };

// PK.. ZIP local-file header + empty-archive + spanned variants. OOXML files
// (.docx/.pptx) are ZIP containers, so they share these; we can't distinguish
// docx from pptx by magic bytes alone, which is fine — both are allowed.
const ZIP_SIGNATURES: Signature[] = [
  { offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] },
  { offset: 0, bytes: [0x50, 0x4b, 0x05, 0x06] },
  { offset: 0, bytes: [0x50, 0x4b, 0x07, 0x08] },
];
// OLE Compound File header — legacy .doc / .ppt.
const OLE_SIGNATURE: Signature[] = [
  { offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] },
];

const SIGNATURES: Record<string, Signature[]> = {
  "image/jpeg": [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }],
  "image/png": [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  "image/gif": [
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] }, // GIF87a
    { offset: 0, bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] }, // GIF89a
  ],
  "image/webp": [{ offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] }], // "RIFF" (+ "WEBP" @8, checked below)
  "application/pdf": [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46, 0x2d] }], // "%PDF-"
  "application/msword": OLE_SIGNATURE,
  "application/vnd.ms-powerpoint": OLE_SIGNATURE,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ZIP_SIGNATURES,
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ZIP_SIGNATURES,
};

// True iff the file's actual header bytes match a known signature for `mime`.
// Returns false for any MIME we don't have a signature for (fail closed).
export async function contentMatchesType(file: Blob, mime: string): Promise<boolean> {
  const sigs = SIGNATURES[mime];
  if (!sigs) return false;

  const header = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const matches = sigs.some((sig) =>
    sig.bytes.every((b, i) => header[sig.offset + i] === b)
  );
  if (!matches) return false;

  // WEBP is a RIFF container; also require the "WEBP" fourCC at offset 8 so a
  // plain WAV/AVI (also RIFF) can't pass as an image.
  if (mime === "image/webp") {
    const webp = [0x57, 0x45, 0x42, 0x50]; // "WEBP"
    return webp.every((b, i) => header[8 + i] === b);
  }
  return true;
}
