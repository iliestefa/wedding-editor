export const padTimeUnit = (value) => String(value).padStart(2, '0');

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
