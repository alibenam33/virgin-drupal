/**
 * @file
 * Video paragraph behavior: poster with a play button over the player.
 *
 * The poster is hidden in the markup so that the player stays usable
 * without JavaScript.
 */
((Drupal, once) => {
  Drupal.behaviors.virginVideo = {
    attach(context) {
      once('virgin-video', '[data-video-poster]', context).forEach(
        (poster) => {
          const player = poster.closest('.paragraph__player');
          const play = poster.querySelector('[data-video-play]');
          if (!player || !play) {
            return;
          }
          poster.hidden = false;
          player.classList.add('is-poster-visible');
          play.addEventListener('click', () => {
            poster.hidden = true;
            player.classList.remove('is-poster-visible');
            const media = player.querySelector(
              '.paragraph__video iframe, .paragraph__video video',
            );
            if (media) {
              media.focus();
            }
          });
        },
      );
    },
  };
})(Drupal, once);
