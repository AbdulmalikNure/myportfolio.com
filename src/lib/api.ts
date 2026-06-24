/**
 * Frontend API client — connects the portfolio to the Express backend.
 * All data that was previously hardcoded now comes from these endpoints.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return json.data;
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw json;
  return json;
}

// Track a page view — fire-and-forget, never throws
export const trackPageView = (page: string) => {
  fetch(`${BASE}/analytics/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'page_view', page }),
  }).catch(() => {});
};

export const apiClient = {
  getSettings:     () => get<any>('/settings'),
  getSkills:       () => get<any[]>('/skills'),
  getServices:     () => get<any[]>('/services'),
  getProjects:     (params = '') => get<any>(`/projects${params}`),
  getCertificates: () => get<any[]>('/certificates'),
  getGallery:      () => get<any[]>('/gallery'),
  getSocialLinks:  () => get<any[]>('/social-links'),
  getResume:       () => get<any>('/resume'),
  getTestimonials: () => get<any[]>('/testimonials'),
  getEducation:    () => get<any[]>('/education'),
  getBlog:         (params = '') => get<any>(`/blog${params}`),
  submitContact:   (data: object) => post<any>('/contact', data),
  getCvDocuments:  () => get<any[]>('/cv-documents'),
};
