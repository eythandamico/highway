// Version 2: related bright colors for soft mesh gradients.
// Keep palette order stable so each account retains its assigned color.
export const AVATAR_PALETTE = [
  {name:"Pink", blend:"#FFD074", accent:"#B99AF1", start:"#F891EE", end:"#ED71E7"},
  {name:"Butter", blend:"#F891EE", accent:"#FFB68E", start:"#FFDE92", end:"#FFD074"},
  {name:"Cyan", blend:"#B99AF1", accent:"#78DFB2", start:"#8DEFFA", end:"#63DFF2"},
  {name:"Lime", blend:"#FFDE92", accent:"#63DFF2", start:"#8AF16A", end:"#60E83E"},
  {name:"Lilac", blend:"#F891EE", accent:"#87C3F6", start:"#CFB5FF", end:"#B99AF1"},
  {name:"Peach", blend:"#ED71E7", accent:"#FFDE92", start:"#FFCDAB", end:"#FFB68E"},
  {name:"Mint", blend:"#63DFF2", accent:"#E4E46D", start:"#A1F1CC", end:"#78DFB2"},
  {name:"Sky", blend:"#B99AF1", accent:"#78DFB2", start:"#ACDAFF", end:"#87C3F6"},
  {name:"Rose", blend:"#FFB66C", accent:"#B99AF1", start:"#FFB5CD", end:"#F894B7"},
  {name:"Apricot", blend:"#F894B7", accent:"#E4E46D", start:"#FFCE90", end:"#FFB66C"},
  {name:"Periwinkle", blend:"#63DFF2", accent:"#ED71E7", start:"#BDC5FF", end:"#A1ACF2"},
  {name:"Lemon", blend:"#60E83E", accent:"#FFB68E", start:"#F1EF93", end:"#E4E46D"},
] as const;
export function avatarIdentity(id: string) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < id.length; i++) {
    const ch = id.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
