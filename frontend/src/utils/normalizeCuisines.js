export const normalizeCuisines = (value) => {
  const cuisines = [];

  const addCuisine = (value) => {
    const cuisine = value.trim().replaceAll("[", "").replaceAll("]", "").replace(/^["']+|["']+$/g, "").trim();
    if (cuisine && !cuisines.some((existing) => existing.toLowerCase() === cuisine.toLowerCase())) {
      cuisines.push(cuisine);
    }
  };

  const collect = (item, depth = 0) => {
    if (depth > 12) return;
    if (Array.isArray(item)) {
      item.forEach((value) => collect(value, depth + 1));
      return;
    }

    if (typeof item !== "string") return;
    const trimmed = item.trim();
    if (!trimmed) return;

    if (trimmed.startsWith("[") || trimmed.startsWith('"')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed !== trimmed) {
          collect(parsed, depth + 1);
          return;
        }
      } catch {
        const encodedValues = [...trimmed.matchAll(/"(?:\\.|[^"\\])*"/g)];
        if (encodedValues.length) {
          encodedValues.forEach(([encodedValue]) => {
            try {
              collect(JSON.parse(encodedValue), depth + 1);
            } catch {
              // Ignore malformed fragments and keep valid cuisine names.
            }
          });
          return;
        }
      }
    }

    trimmed.split(",").forEach(addCuisine);
  };

  collect(value);
  return cuisines;
};
