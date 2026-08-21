import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const IncognitoContext = createContext();

export const ADULT_KEYWORDS = ['sex', 'nsfw', 'adult', '18+', 'xxx', 'porn', 'erotic', 'hentai'];

export const isAdultCategory = (category) => {
  if (!category) return false;
  const slug = (typeof category === 'object' ? (category.slug || category.name || '') : String(category)).toLowerCase();
  const name = (typeof category === 'object' ? (category.name || '') : '').toLowerCase();
  return slug === 'sex' || name === 'sex' || ADULT_KEYWORDS.some(kw => slug.includes(kw) || name.includes(kw));
};

export const isAdultResource = (resource) => {
  if (!resource) return false;
  if (resource.isNsfw === true) return true;
  if (isAdultCategory(resource.category)) return true;

  if (Array.isArray(resource.tags)) {
    const hasAdultTag = resource.tags.some(tag =>
      ADULT_KEYWORDS.includes(String(tag).toLowerCase().trim())
    );
    if (hasAdultTag) return true;
  }
  return false;
};

export const IncognitoProvider = ({ children }) => {
  // Ephemeral Incognito Mode - session based (starts false by default for safe browsing)
  const [isIncognito, setIsIncognito] = useState(() => {
    try {
      return sessionStorage.getItem('auralink_incognito_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [blurNsfw, setBlurNsfw] = useState(() => {
    try {
      const stored = localStorage.getItem('auralink_blur_nsfw');
      return stored !== null ? stored === 'true' : true;
    } catch {
      return true;
    }
  });

  const { showToast } = useToast();

  const toggleIncognito = useCallback(() => {
    setIsIncognito((prev) => {
      const next = !prev;
      try {
        if (next) {
          sessionStorage.setItem('auralink_incognito_mode', 'true');
        } else {
          sessionStorage.removeItem('auralink_incognito_mode');
        }
      } catch (e) {
        console.error(e);
      }

      if (next) {
        showToast('Incognito Stealth Active: 18+ Channels Unlocked (No trace saved)', 'info');
      } else {
        showToast('Safe Browsing Active: 18+ Channels Shielded', 'success');
      }
      return next;
    });
  }, [showToast]);

  const enableIncognito = useCallback(() => {
    setIsIncognito(true);
    try {
      sessionStorage.setItem('auralink_incognito_mode', 'true');
    } catch (e) {
      console.error(e);
    }
    showToast('Incognito Stealth Active: 18+ Channels Unlocked', 'info');
  }, [showToast]);

  const disableIncognito = useCallback(() => {
    setIsIncognito(false);
    try {
      sessionStorage.removeItem('auralink_incognito_mode');
    } catch (e) {
      console.error(e);
    }
    showToast('Safe Mode Engaged: 18+ Content Shielded', 'success');
  }, [showToast]);

  const toggleBlurNsfw = useCallback(() => {
    setBlurNsfw((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('auralink_blur_nsfw', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  }, []);

  // Keyboard shortcut listener: Alt + I to toggle Incognito Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        toggleIncognito();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleIncognito]);

  const filterCategories = useCallback(
    (categories = []) => {
      if (isIncognito) return categories;
      return categories.filter((cat) => !isAdultCategory(cat));
    },
    [isIncognito]
  );

  return (
    <IncognitoContext.Provider
      value={{
        isIncognito,
        toggleIncognito,
        enableIncognito,
        disableIncognito,
        blurNsfw,
        toggleBlurNsfw,
        filterCategories,
        isAdultResource,
        isAdultCategory
      }}
    >
      {children}
    </IncognitoContext.Provider>
  );
};

export const useIncognito = () => {
  const context = useContext(IncognitoContext);
  if (!context) {
    throw new Error('useIncognito must be used within an IncognitoProvider');
  }
  return context;
};
