document.addEventListener('DOMContentLoaded', function() {
  // Handle custom select dropdowns
  const selects = document.querySelectorAll('.select');

  selects.forEach(select => {
    const selected = select.querySelector('.selected');
    const optionsContainer = select.querySelector('.options');
    const options = select.querySelectorAll('.option');
    const radios = select.querySelectorAll('input[type="radio"]');

    // Set initial display text based on checked radio
    radios.forEach((radio, index) => {
      if (radio.checked) {
        selected.textContent = options[index].getAttribute('data-txt');
      }
    });

    // Toggle dropdown visibility
    selected.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      optionsContainer.style.display = 
        optionsContainer.style.display === 'block' ? 'none' : 'block';
    });

    // Handle option selection via label clicks
    options.forEach((option, index) => {
      option.addEventListener('click', function(e) {
        // Let the label naturally handle the radio button association (for attribute)
        // Just update the UI display
        const radioButton = radios[index];
        if (radioButton) {
          selected.textContent = option.getAttribute('data-txt');
          console.log(`Selected filter: ${radioButton.name} = ${radioButton.value}`);
          // Force a small delay to ensure radio is checked before hiding dropdown
          setTimeout(() => {
            optionsContainer.style.display = 'none';
          }, 10);
        }
      });
    });

    // Also handle direct radio button changes
    radios.forEach((radio, index) => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          selected.textContent = options[index].getAttribute('data-txt');
          console.log(`Radio changed: ${this.name} = ${this.value}`);
        }
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    const isSelect = event.target.closest('.select');
    if (!isSelect) {
      selects.forEach(select => {
        const opts = select.querySelector('.options');
        if (opts) opts.style.display = 'none';
      });
    }
  });

  // Handle form submission - ensure all values are properly set
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      // Get all form data to verify
      const formData = new FormData(this);
      console.log('Form submitting with data:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`);
      }
      // Form will naturally submit
    });
  }
});
