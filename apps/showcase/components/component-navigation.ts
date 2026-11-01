/** Reset only the component pane; narrow layouts retain document scrolling. */
export function scrollComponentPanelToTop() {
  const panel = document.querySelector<HTMLElement>('.library-component-layout > .library-content, .library-component-layout > .component-directory');
  if (panel && window.matchMedia('(min-width:901px)').matches) {
    panel.scrollTo({ top: 0, behavior: 'instant' });
    return;
  }
  if (panel) window.scrollTo({ top: Math.max(0, window.scrollY + panel.getBoundingClientRect().top - (document.querySelector(".library-header")?.getBoundingClientRect().height ?? 0)), behavior: 'instant' });
}
