/**
 * @file
 * Minimal lightbox for the image gallery paragraph.
 *
 * Wraps each gallery image in a button opening a native <dialog> (focus
 * trap, Escape key and focus restoration handled by the browser). Previous /
 * next buttons and arrow keys navigate between the images.
 */
((Drupal, once) => {
  let dialog = null;
  let current = { images: [], index: 0 };

  /**
   * Shows the current image in the dialog.
   */
  function show() {
    const source = current.images[current.index];
    const image = dialog.querySelector('.virgin-lightbox__image');
    image.src = source.currentSrc || source.src;
    image.alt = source.alt || '';
    dialog.querySelector('.virgin-lightbox__caption').textContent =
      source.alt || '';
    dialog.querySelector('.virgin-lightbox__counter').textContent =
      Drupal.t('Image @current of @total', {
        '@current': current.index + 1,
        '@total': current.images.length,
      });
    const single = current.images.length < 2;
    dialog.querySelector('.virgin-lightbox__prev').hidden = single;
    dialog.querySelector('.virgin-lightbox__next').hidden = single;
  }

  /**
   * Moves to the previous / next image.
   *
   * @param {number} step
   *   -1 or 1.
   */
  function move(step) {
    const total = current.images.length;
    current.index = (current.index + step + total) % total;
    show();
  }

  /**
   * Creates the shared dialog element.
   *
   * @return {HTMLDialogElement}
   *   The dialog.
   */
  function getDialog() {
    if (dialog) {
      return dialog;
    }
    dialog = document.createElement('dialog');
    dialog.className = 'virgin-lightbox';
    dialog.setAttribute('aria-label', Drupal.t('Enlarged image'));
    dialog.innerHTML = `
      <figure class="virgin-lightbox__figure">
        <img class="virgin-lightbox__image" src="" alt="">
        <figcaption class="virgin-lightbox__caption"></figcaption>
      </figure>
      <p class="virgin-lightbox__counter" aria-live="polite"></p>
      <button type="button" class="virgin-lightbox__prev"><span class="visually-hidden"></span></button>
      <button type="button" class="virgin-lightbox__next"><span class="visually-hidden"></span></button>
      <button type="button" class="virgin-lightbox__close"><span class="visually-hidden"></span></button>`;
    dialog.querySelector('.virgin-lightbox__prev span').textContent =
      Drupal.t('Previous image');
    dialog.querySelector('.virgin-lightbox__next span').textContent =
      Drupal.t('Next image');
    dialog.querySelector('.virgin-lightbox__close span').textContent =
      Drupal.t('Close');
    dialog
      .querySelector('.virgin-lightbox__prev')
      .addEventListener('click', () => move(-1));
    dialog
      .querySelector('.virgin-lightbox__next')
      .addEventListener('click', () => move(1));
    dialog
      .querySelector('.virgin-lightbox__close')
      .addEventListener('click', () => dialog.close());
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        move(-1);
      } else if (event.key === 'ArrowRight') {
        move(1);
      }
    });
    // Close when clicking the backdrop.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    document.body.appendChild(dialog);
    return dialog;
  }

  Drupal.behaviors.virginLightbox = {
    attach(context) {
      if (typeof HTMLDialogElement !== 'function') {
        return;
      }
      once('virgin-lightbox', '[data-lightbox="true"]', context).forEach(
        (gallery) => {
          const images = Array.from(
            gallery.querySelectorAll('.paragraph__gallery img'),
          );
          images.forEach((img, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'paragraph__zoom';
            button.setAttribute(
              'aria-label',
              img.alt
                ? Drupal.t('Enlarge image: @alt', { '@alt': img.alt })
                : Drupal.t('Enlarge image @number', { '@number': index + 1 }),
            );
            img.parentNode.insertBefore(button, img);
            button.appendChild(img);
            button.addEventListener('click', () => {
              current = { images, index };
              getDialog();
              show();
              dialog.showModal();
            });
          });
        },
      );
    },
  };
})(Drupal, once);
