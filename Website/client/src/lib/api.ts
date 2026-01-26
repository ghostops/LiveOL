const API_BASE = '/api';

export async function fetchContent(page: string) {
  const response = await fetch(`${API_BASE}/content/${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${page}`);
  }
  return response.json();
}
