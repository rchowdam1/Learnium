export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const json = await response.json();

  if (!response.ok || json.error) {
    throw new Error(json.error ?? "Request failed");
  }

  return json.data as T;
}
