/**
 * Brand Color Configuration — Single source of truth
 *
 * Update colors here and in styles/globals.css CSS variables.
 * This file is used by components that need programmatic color access
 * (charts, dynamic styles, email templates, etc.)
 */

export const BRAND_COLORS = {
  green: {
    DEFAULT: '#15803d',
    light: '#22c55e',
    dark: '#116932',
  },
  blue: {
    DEFAULT: '#2563EB',
    light: '#3B82F6',
    dark: '#1D4ED8',
  },
} as const;

export const COLORS = {
  // Brand identity
  brand: BRAND_COLORS,

  // Semantic colors (light theme)
  light: {
    heading: '#15803d',       // green — h1, h2
    headingLight: '#22c55e',
    subheading: '#0D9488',    // teal — h3, h4
    subheadingLight: '#14B8A6',
    text: '#374151',          // warm gray (not black)
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    surface: '#FAFBFC',
    surfaceLight: '#F3F4F6',
    surfaceLighter: '#E5E7EB',
    primary: '#FFFFFF',       // white base
    accent: '#2563EB',        // blue
    cta: '#15803d',           // green
    ctaDark: '#116932',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Dark theme overrides
  dark: {
    heading: '#4ADE80',       // lighter green
    headingLight: '#86EFAC',
    subheading: '#2DD4BF',    // lighter teal
    subheadingLight: '#5EEAD4',
    text: '#E2E8F0',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    surface: '#0F172A',
    surfaceLight: '#1E293B',
    surfaceLighter: '#334155',
    primary: '#111827',
    accent: '#60A5FA',
    cta: '#4ADE80',
    ctaDark: '#22c55e',
    brandGreen: '#4ADE80',
    brandBlue: '#60A5FA',
  },
} as const;

/** CSS variable name mapping for programmatic access */
export const CSS_VARS = {
  brandGreen: '--color-brand-green',
  brandBlue: '--color-brand-blue',
  heading: '--color-heading',
  subheading: '--color-subheading',
  text: '--color-text',
  textSecondary: '--color-text-secondary',
  accent: '--color-accent',
  cta: '--color-cta',
  surface: '--color-surface',
} as const;

/** Helper to get a CSS variable value at runtime */
export function getCSSVar(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
