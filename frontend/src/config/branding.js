/**
 * NetClone Centralized Branding & Theme Configuration
 * 
 * Customize application branding, product naming, meta tags, and copyright information.
 * All brand references throughout the user interface read from this file or environment variables.
 */

export const BRAND_CONFIG = {
  // Brand Names & Identifiers
  name: import.meta.env.VITE_APP_NAME || 'NetClone',
  shortName: 'NetClone',
  code: 'netclone',
  
  // Versions & Badging
  version: '2.0.0',
  badgeText: 'v2.0 Cyber Twin',
  edition: 'Enterprise Security Edition',
  
  // Taglines & Explanations
  tagline: import.meta.env.VITE_APP_TAGLINE || 'AI-Driven Threat Simulation & Autonomous IoT Defense',
  fullTitle: `${import.meta.env.VITE_APP_NAME || 'NetClone'}: AI Cyber Twin & Multi-Layer IoT Defense`,
  
  // Corporate / Template Metadata
  company: 'NetClone Technologies',
  supportEmail: 'support@netclone.io',
  copyright: `© ${new Date().getFullYear()} NetClone Platform. All rights reserved.`,
  footerText: `${import.meta.env.VITE_APP_NAME || 'NetClone'} Framework v2.0 • AI-Driven Cyber Twin & MLSA Defense System • Commercial Digital Template`,
  
  // Document Title & Meta Description
  metaDescription: 'NetClone: Enterprise AI-Driven Cyber Twin Framework with Multi-Layer Security Authentication for Real-Time IoT Threat Simulation and Automated Defense.',
};

export default BRAND_CONFIG;
