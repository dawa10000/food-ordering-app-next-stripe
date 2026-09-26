export const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}): ${body.slice(0, 200)}`,
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(
      `Request returned invalid JSON (${response.status}): ${body.slice(0, 200)}`,
    );
  }
};
