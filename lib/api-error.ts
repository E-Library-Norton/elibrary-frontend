export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
) {
  if (!error || typeof error !== "object") return fallback;

  const data = "data" in error ? error.data : undefined;
  if (!data || typeof data !== "object") return fallback;

  if (
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
  ) {
    return data.error.message;
  }

  if ("message" in data && typeof data.message === "string") {
    return data.message;
  }

  return fallback;
}
