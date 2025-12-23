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
        selected.textContent = options[index].textContent;
      }
    });

    // Toggle dropdown visibility
    selected.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();

      // Close all other dropdowns first
      document.querySelectorAll('.select .options').forEach(opts => {
        if (opts !== optionsContainer) {
          opts.style.display = 'none';
        }
      });

      // Toggle current dropdown
      optionsContainer.style.display = 
        optionsContainer.style.display === 'block' ? 'none' : 'block';
    });

    // Handle option selection via label clicks
    // The label's "for" attribute will automatically check the radio
    options.forEach((option, index) => {
      option.addEventListener('click', function(e) {
        const radioButton = radios[index];

        // Update display text
        selected.textContent = option.textContent;

        // Log for debugging
        console.log(`Selected: ${radioButton.name} = ${radioButton.value}`);

        // Close dropdown after selection
        setTimeout(() => {
          optionsContainer.style.display = 'none';
        }, 100);
      });
    });

    // Also handle direct radio button changes (for accessibility)
    radios.forEach((radio, index) => {
      radio.addEventListener('change', function() {
        if (this.checked) {
          selected.textContent = options[index].textContent;
          console.log(`Radio changed: ${this.name} = ${this.value}`);
        }
      });
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', function(event) {
    const isSelect = event.target.closest('.select');
    if (!isSelect) {
      document.querySelectorAll('.select .options').forEach(opts => {
        opts.style.display = 'none';
      });
    }
  });

  // Handle form submission - log all values for debugging
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function(e) {
      const formData = new FormData(this);
      console.log('=== FORM SUBMISSION ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      console.log('======================');
    });
  }
});