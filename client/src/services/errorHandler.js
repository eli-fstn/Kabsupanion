export function handleApiError(error, setGeneralError) {
  const res = error.response;

  if (!res) {
    setGeneralError("Network error. Please try again.");
    return;
  }

  const message = res.data?.message || res.data?.error;

  setGeneralError(message || "Something went wrong.");
}