import { AxiosError } from "axios";

export function handleApiError(
  error: unknown,
  setGeneralError: (msg: string) => void
) {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  const res = axiosError.response;

  if (!res) {
    setGeneralError("Network error. Please try again.");
    return;
  }

  const message = res.data?.message || res.data?.error;
  setGeneralError(message || "Something went wrong.");
}