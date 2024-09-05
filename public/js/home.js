function startJiggle() {
    $('video-js').transition({
      animation: 'jiggle',
    });
  }
  
  startJiggle();
  
  // Set the interval for jiggle effect
  var jiggleInterval = setInterval(startJiggle, 7000);
  
  $(document).ready(function () {
    // Stop the jiggle effect when clicking on the video
    $('video-js').on('click', function () {
      clearInterval(jiggleInterval);
    });
  
    // Close messages with fade effect
    $('.message .close').on('click', function () {
      $(this).closest('.message').transition('fade');
    });
  
    // Slick slider for testimonials
    $('#testimonials').slick({
      dots: false,
      arrows: true,
      infinite: true,
      speed: 800,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 6000,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    });
  
    // Slick slider for popular courses
    $('.slider').slick({
      slidesToShow: 2,
      slidesToScroll: 1,
      zIndex: 1,
      accessibility: true,
      arrows: true,
      dots: false,
      centerMode: true,
      variableWidth: true,
      infinite: true,
      focusOnSelect: true,
      cssEase: 'linear',
      touchMove: true,
      prevArrow: '<button class="slick-prev"> < </button>',
      nextArrow: '<button class="slick-next"> > </button>',
      responsive: [
        {
          breakpoint: 576,
          settings: {
            centerMode: false,
            variableWidth: false,
          },
        },
      ],
    });
  });
  