export function handleApiError(error, setGeneralError) {
  const res = error.response;

  if (!res) {
    setError("Network error. Please try again.");
    return;
  }

  const message = res.data?.message || res.data?.error;

  setError(message || "Something went wrong.");
}