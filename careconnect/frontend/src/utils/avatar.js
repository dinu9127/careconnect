const escapeSvgText = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const getAvatarPlaceholder = (name, size = 150) => {
  const firstName = (name || 'Caregiver').trim().split(/\s+/)[0] || 'Caregiver'
  const initials = escapeSvgText(firstName.slice(0, 1).toUpperCase())
  const radius = Math.round(size * 0.12)

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="100%" height="100%" rx="${radius}" fill="#4A5568" />
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.42)}" font-weight="700" fill="#FFFFFF">${initials}</text>
    </svg>
  `.replace(/\s+/g, ' ').trim()

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
