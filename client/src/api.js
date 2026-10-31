const BASE = (
  import.meta.env.VITE_API_URL || "https://quickwash-new.onrender.com/api"
).replace(/\/$/, "");
export function getToken(role) {
  return localStorage.getItem(`ff_token_${role}`);
}
export async function api(path, role, method = "GET", body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const token = getToken(role);
    const response = await fetch(BASE + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error("The request took too long. Please try again.");
    if (error instanceof TypeError)
      throw new Error(
        "Could not connect to QuickWash. Check your internet connection and API URL.",
      );
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
