/* eslint-disable no-unused-vars */
class Carousel {
  constructor(element) {
    const thisCarousel = this;

    thisCarousel.render(element);
    thisCarousel.initPlugin(element);
  }

  render(element) {
    const thisCarousel = this;

    thisCarousel.element = element;
  }
  initPlugin() {
    const thisCarousel = this;

    // eslint-disable-next-line no-undef
    const fckl = new Flickity(thisCarousel.element, {
      autoPlay: 3000,
      imagesLoaded: true,
    });
  }
}

export default Carousel;