import type { Env } from "../types";

export type CloudinaryUploadResult = {
  publicId: string;
  secureUrl: string;
  resourceType: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
};

// Cloudinary signature: SHA-1( sorted_params_string + api_secret )
// Uses Web Crypto — no Node deps, Workers-safe.
async function sign(params: Record<string, string>, apiSecret: string): Promise<string> {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  const buffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(paramString + apiSecret)
  );
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Upload a file to Cloudinary. `folder` organises assets in the Media Library.
// Returns a normalised subset of the Cloudinary response.
export async function uploadFile(
  file: File | Blob,
  folder: string,
  env: Env
): Promise<CloudinaryUploadResult> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { folder, timestamp };
  const signature = await sign(params, env.CLOUDINARY_API_SECRET);

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", env.CLOUDINARY_API_KEY);
  form.append("timestamp", timestamp);
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const body = await res.json<{ error?: { message?: string } }>();
    throw new Error(body?.error?.message ?? "Cloudinary upload failed");
  }

  const data = await res.json<{
    public_id: string;
    secure_url: string;
    resource_type: string;
    format: string;
    bytes: number;
    width?: number;
    height?: number;
  }>();

  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    resourceType: data.resource_type,
    format: data.format,
    bytes: data.bytes,
    width: data.width,
    height: data.height,
  };
}

// Delete an asset by public_id. Pass the resource_type returned by uploadFile
// (e.g. "image", "raw") so Cloudinary targets the correct resource bucket.
export async function deleteFile(
  publicId: string,
  resourceType: string,
  env: Env
): Promise<void> {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const params = { public_id: publicId, timestamp };
  const signature = await sign(params, env.CLOUDINARY_API_SECRET);

  const form = new FormData();
  form.append("public_id", publicId);
  form.append("api_key", env.CLOUDINARY_API_KEY);
  form.append("timestamp", timestamp);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/destroy`,
    { method: "POST", body: form }
  );

  if (!res.ok) {
    const body = await res.json<{ error?: { message?: string } }>();
    throw new Error(body?.error?.message ?? "Cloudinary delete failed");
  }
}
