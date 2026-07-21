import { AxiosError } from "axios";

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const res = axiosError.response;

  if (!res) {
    return "Network error. Please try again.";
  }

  const message = res.data?.message || res.data?.error;
  return message || "Something went wrong.";
}

export function handleApiError(
  error: unknown,
  setGeneralError: (msg: string) => void
) {
  setGeneralError(getErrorMessage(error));
}