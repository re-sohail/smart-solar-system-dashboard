const capitalize = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateTitleFromPath = pathname => {
  const segment = pathname.split('/').filter(Boolean);

  if (segment.length === 0) return 'Dashboard';

  const lastSegment = segment[segment.length - 1];

  if (!isNaN(lastSegment)) {
    const parentSegment = segment[segment.length - 2];
    return `${capitalize(parentSegment)} Details`;
  }

  return capitalize(lastSegment);
};
