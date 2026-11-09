// Click the image to show hotspot coordinates in percent of the image size
const image = document.querySelector('.hotspot-image img');
const coordinates = document.querySelector('#coordinates');

// Convert the clicked point into percentages and display CSS custom property values.
image.addEventListener('click', (event) => {
  // offsetX/Y are relative to the image; clientWidth/Height use its displayed size.
  const x = (event.offsetX / image.clientWidth) * 100;
  const y = (event.offsetY / image.clientHeight) * 100;
  coordinates.textContent = `--x: ${x.toFixed(1)}%; --y: ${y.toFixed(1)}%`;
});

// The selected radio button puts one experiment class on <body> (see the end of styles.css)
const options = document.querySelectorAll('input[name="experiment"]');

// Register a change handler for each experiment option.
options.forEach((option) => {
  // Activate the selected experiment after removing the previous experiment classes.
  option.addEventListener('change', () => {
    // Remove each non-empty experiment class; an empty value means the correct version.
    options.forEach((other) => {
      if (other.value) {
        document.body.classList.remove(other.value);
      }
    });
    if (option.value) {
      document.body.classList.add(option.value);
    }
  });
});
