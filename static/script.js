document.addEventListener('DOMContentLoaded', function() {
  // Handle custom select dropdowns
  const selects = document.querySelectorAll('.select');

  selects.forEach(select => {
    const selected = select.querySelector('.selected');
    const optionsContainer = select.querySelector('.options');
    const options = select.querySelectorAll('.option');
    const inputs = select.querySelectorAll('input[type="radio"]');

    // Toggle dropdown visibility
    selected.addEventListener('click', function() {
      optionsContainer.style.display = 
        optionsContainer.style.display === 'block' ? 'none' : 'block';
    });

    // Handle option selection
    options.forEach((option, index) => {
      option.addEventListener('click', function() {
        const input = inputs[index];
        input.checked = true;
        selected.textContent = option.getAttribute('data-txt');
        optionsContainer.style.display = 'none';
      });
    });

    // Set initial display text based on checked radio
    inputs.forEach((input, index) => {
      if (input.checked) {
        selected.textContent = options[index].getAttribute('data-txt');
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    const isSelect = event.target.closest('.select');
    if (!isSelect) {
      selects.forEach(select => {
        select.querySelector('.options').style.display = 'none';
      });
    }
  });

  // Handle amenity checkboxes
  const amenityCheckboxes = document.querySelectorAll('input[name="amenity"]');
  amenityCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      // Could add live filtering here if needed
      console.log('Amenity selected:', this.value);
    });
  });

  // Handle form submission
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      console.log('Form submitted with filters');
      // Form will submit and page will reload with filtered results
    });
  }
});
