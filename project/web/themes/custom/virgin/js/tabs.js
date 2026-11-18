/**
 * @file
 * Tabs paragraph behavior (WAI-ARIA tabs pattern, automatic activation).
 *
 * Builds role="tab" buttons from the rendered tab items, then turns the
 * items into role="tabpanel". Without JavaScript the items stay displayed as
 * stacked sections.
 */
((Drupal, once) => {
  Drupal.behaviors.virginTabs = {
    attach(context) {
      once('virgin-tabs', '[data-tabs]', context).forEach((tabs) => {
        const tablist = tabs.querySelector('[data-tablist]');
        const container = tabs.querySelector('[data-tab-panels]');
        if (!tablist || !container) {
          return;
        }
        const panels = Array.from(container.children).filter((child) =>
          child.hasAttribute('data-tab-panel'),
        );
        if (!panels.length) {
          return;
        }
        const vertical = tabs.dataset.orientation === 'vertical';
        const buttons = [];

        /**
         * Selects a tab.
         *
         * @param {number} index
         *   The index of the tab to select.
         * @param {boolean} focus
         *   Whether the tab must receive the focus.
         */
        function select(index, focus) {
          buttons.forEach((button, i) => {
            const selected = i === index;
            button.setAttribute('aria-selected', selected ? 'true' : 'false');
            button.tabIndex = selected ? 0 : -1;
            panels[i].hidden = !selected;
          });
          if (focus) {
            buttons[index].focus();
          }
        }

        panels.forEach((panel, index) => {
          const tabId = `${panel.dataset.tabId || panel.id}-tab`;
          const heading = panel.querySelector('[data-tab-title]');
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'paragraph__tab';
          button.id = tabId;
          button.setAttribute('role', 'tab');
          button.setAttribute('aria-controls', panel.id);

          if (panel.dataset.tabIcon) {
            const icon = document.createElement('span');
            icon.className = `paragraph__tab-icon icon icon--${panel.dataset.tabIcon}`;
            icon.setAttribute('aria-hidden', 'true');
            button.appendChild(icon);
          }
          const label = document.createElement('span');
          label.className = 'paragraph__tab-label';
          label.textContent = heading ? heading.textContent.trim() : '';
          button.appendChild(label);

          button.addEventListener('click', () => select(index, false));
          button.addEventListener('keydown', (event) => {
            const last = buttons.length - 1;
            let target = null;
            switch (event.key) {
              case vertical ? 'ArrowDown' : 'ArrowRight':
                target = index === last ? 0 : index + 1;
                break;
              case vertical ? 'ArrowUp' : 'ArrowLeft':
                target = index === 0 ? last : index - 1;
                break;
              case 'Home':
                target = 0;
                break;
              case 'End':
                target = last;
                break;
              default:
                return;
            }
            event.preventDefault();
            select(target, true);
          });

          buttons.push(button);
          tablist.appendChild(button);

          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', tabId);
          panel.tabIndex = 0;
          if (heading) {
            // The tab button now labels the panel.
            heading.hidden = true;
          }
        });

        tablist.hidden = false;
        tabs.classList.add('is-enhanced');
        select(0, false);
      });
    },
  };
})(Drupal, once);
