/**
 * Property configuration loader.
 * Fetches operational identity from `property_config` table.
 * Same caching pattern as brand-config.js — 5-min TTL with hardcoded fallback.
 */
import { getSupabase } from './supabase.js';

let cachedConfig = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000;

const FALLBACK_CONFIG = {
  property: {
    name: 'Sponic Garden',
    short_name: 'SG',
    tagline: 'The Art and Science of Cultivation',
    address: 'Warsaw, Poland',
    city: 'Warsaw',
    state: '',
    zip: '',
    country: 'PL',
    latitude: 52.23,
    longitude: 21.01,
    timezone: 'Europe/Warsaw',
  },
  domain: {
    primary: 'sponicgarden.com',
    github_pages: 'sponicgarden.github.io/sponic-garden',
    camera_proxy: 'cam.sponicgarden.com',
  },
  email: {
    team: 'team@sponicgarden.com',
    admin_gmail: 'accounts@sponicgarden.com',
    notifications_from: 'notifications@sponicgarden.com',
    noreply_from: 'noreply@sponicgarden.com',
    automation: 'automation@sponicgarden.com',
  },
  payment: {
    zelle_email: 'accounts@sponicgarden.com',
    venmo_handle: '@SponicGarden',
  },
  ai_assistant: {
    name: 'PAI',
    full_name: 'Prompt Agricultural Intelligence',
    personality: 'the AI assistant for the property',
    email_from: 'pai@sponicgarden.com',
  },
  wifi: {
    network_name: 'Black Rock City',
  },
  mobile_app: {
    name: 'Sponic Garden',
    id: 'com.sponicgarden.app',
  },
};

export async function getPropertyConfig() {
  const now = Date.now();
  if (cachedConfig && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedConfig;
  }
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('property_config')
      .select('config')
      .eq('id', 1)
      .single();

    if (error || !data?.config) {
      console.warn('property_config fetch failed, using fallback:', error?.message);
      cachedConfig = FALLBACK_CONFIG;
    } else {
      cachedConfig = { ...FALLBACK_CONFIG, ...data.config };
    }
  } catch (e) {
    console.warn('property_config fetch error, using fallback:', e.message);
    cachedConfig = FALLBACK_CONFIG;
  }
  cacheTimestamp = Date.now();
  return cachedConfig;
}

/** Shorthand accessors for common config paths */
export async function getPropertyName() {
  return (await getPropertyConfig()).property?.name ?? FALLBACK_CONFIG.property.name;
}

export async function getDomain() {
  return (await getPropertyConfig()).domain?.primary ?? FALLBACK_CONFIG.domain.primary;
}

export async function getTimezone() {
  return (await getPropertyConfig()).property?.timezone ?? FALLBACK_CONFIG.property.timezone;
}
