export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (!response.ok || !contentType.includes("application/json")) {
    throw new Error(
      `Request failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  return JSON.parse(body) as T;
};
