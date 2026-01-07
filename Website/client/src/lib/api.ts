const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api';

export async function fetchContent(page: string) {
  const response = await fetch(`${API_BASE}/content/${page}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${page}`);
  }
  return response.json();
}
