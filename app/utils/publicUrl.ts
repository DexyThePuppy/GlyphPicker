import { joinURL } from 'ufo'

/** Resolve a public/ asset path against Nuxt `app.baseURL` (needed on GitHub Pages). */
export function publicUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return joinURL(base, path.replace(/^\//, ''))
}
