export function previewFeedback(...message) { window.dispatchEvent(new CustomEvent('highway-preview-feedback', { detail: message.join(' ') + ' · preview only' })); }
