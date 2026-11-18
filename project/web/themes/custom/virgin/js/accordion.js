/**
 * @file
 * Accordion paragraph behavior (disclosure pattern).
 *
 * Reads data-first-item-open / data-multiple-open on [data-accordion] and
 * toggles aria-expanded + hidden on each item.
 */
((Drupal, once) => {
  /**
   * Opens or closes an accordion item.
   *
   * @param {HTMLElement} item
   *   The [data-accordion-item] element.
   * @param {boolean} expanded
   *   TRUE to open the item.
   */
  function setExpanded(item, expanded) {
    const trigger = item.querySelector('[data-accordion-trigger]');
    const panel = item.querySelector('[data-accordion-panel]');
    if (!trigger || !panel) {
      return;
    }
    trigger.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    panel.hidden = !expanded;
    item.classList.toggle('is-open', expanded);
  }

  Drupal.behaviors.virginAccordion = {
    attach(context) {
      once('virgin-accordion', '[data-accordion]', context).forEach(
        (accordion) => {
          const multiple = accordion.dataset.multipleOpen === 'true';
          const firstOpen = accordion.dataset.firstItemOpen === 'true';
          // Direct items only: nested accordions are handled on their own.
          const items = Array.from(
            accordion.querySelectorAll('[data-accordion-item]'),
          ).filter((item) => item.closest('[data-accordion]') === accordion);

          items.forEach((item, index) => {
            setExpanded(item, firstOpen && index === 0);
            const trigger = item.querySelector('[data-accordion-trigger]');
            if (!trigger) {
              return;
            }
            trigger.addEventListener('click', () => {
              const expanded =
                trigger.getAttribute('aria-expanded') !== 'true';
              if (expanded && !multiple) {
                items
                  .filter((other) => other !== item)
                  .forEach((other) => setExpanded(other, false));
              }
              setExpanded(item, expanded);
            });
          });
          accordion.classList.add('is-enhanced');
        },
      );
    },
  };
})(Drupal, once);
