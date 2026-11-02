/** Capture owned declarations, including longhands overwritten by a shorthand. */
export function preserveInlineStyles(element, properties) {
  const style = element.style
  const declarations = Array.from(style)
    .filter(name => properties.some(property => name === property || name.startsWith(`${property}-`) || (property === 'border-radius' && /^border-(top|bottom)-(left|right)-radius$/.test(name))))
    .map(name => [name, style.getPropertyValue(name), style.getPropertyPriority(name)])
  return () => {
    for (const property of properties) style.removeProperty(property)
    for (const [name, value, priority] of declarations) style.setProperty(name, value, priority)
  }
}
