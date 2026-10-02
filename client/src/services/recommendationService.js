import API from './api';

const INTERESTS_KEY = 'auralink_user_interests';

/**
 * Fetch smart recommendations from the server
 */
export async function getRecommendations({
  resourceId = null,
  category = null,
  tags = null,
  limit = 8,
  includeNsfw = false
} = {}) {
  try {
    const params = {
      limit,
      includeNsfw: Boolean(includeNsfw)
    };

    if (resourceId) params.resourceId = resourceId;
    if (category && category !== 'all') params.category = category;
    if (tags) params.tags = Array.isArray(tags) ? tags.join(',') : tags;

    // If on homepage and no explicit tags, inject top interest tags from local profile
    if (!resourceId && !tags && !includeNsfw) {
      const profile = getUserInterestProfile();
      if (profile.tags?.length > 0) {
        params.tags = profile.tags.slice(0, 5).join(',');
      }
      if (!params.category && profile.categories?.length > 0) {
        params.category = profile.categories[0];
      }
    }

    const res = await API.get('/resources/recommendations', { params });
    if (res.data?.success) {
      return res.data.data || [];
    }
    return [];
  } catch (err) {
    console.warn('[recommendationService] Failed to load recommendations:', err.message);
    return [];
  }
}

/**
 * Get user interest profile from storage
 */
export function getUserInterestProfile() {
  try {
    const raw = localStorage.getItem(INTERESTS_KEY);
    if (!raw) return { tags: [], categories: [] };
    return JSON.parse(raw);
  } catch (e) {
    return { tags: [], categories: [] };
  }
}

/**
 * Record interaction (view / click / save) to refine future recommendations.
 * Strictly bypassed when Incognito is active to guarantee zero-trace browsing.
 */
export function recordResourceInteraction(resource, isIncognito = false) {
  if (isIncognito || !resource) return;

  try {
    const profile = getUserInterestProfile();
    const tagList = Array.isArray(resource.tags) ? resource.tags : [];
    const catSlug = resource.category?.slug || (typeof resource.category === 'string' ? resource.category : null);

    // Update tags (keep most recent 12 unique)
    const combinedTags = [...tagList.map(t => t.toLowerCase().trim()), ...profile.tags];
    const uniqueTags = [...new Set(combinedTags.filter(Boolean))].slice(0, 12);

    // Update categories (keep most recent 4 unique)
    let uniqueCats = profile.categories || [];
    if (catSlug && catSlug !== 'sex') {
      uniqueCats = [catSlug, ...uniqueCats.filter(c => c !== catSlug)].slice(0, 4);
    }

    localStorage.setItem(
      INTERESTS_KEY,
      JSON.stringify({
        tags: uniqueTags,
        categories: uniqueCats,
        updatedAt: Date.now()
      })
    );
  } catch (e) {
    // Fail silently without disturbing UX
  }
}
