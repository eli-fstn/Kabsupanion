// Max lengths for user-supplied text fields, enforced in route validation so a
// client can't submit unbounded payloads (DB bloat / abuse). Generous enough for
// legitimate use.
export const MAX_TITLE = 200;
export const MAX_NAME = 200;
export const MAX_CODE = 32;
export const MAX_DESCRIPTION = 5000;
export const MAX_ROOM = 100;

// True if a value is a string within [1, max] after trimming — i.e. non-empty
// and not over the cap. Length is checked on the trimmed value.
export function withinLen(value: string, max: number): boolean {
  return value.trim().length >= 1 && value.trim().length <= max;
}
