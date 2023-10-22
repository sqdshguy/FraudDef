function saveOptions() {
  const options = {};

  document
    .querySelectorAll('.switch input[type="checkbox"]')
    .forEach((checkbox) => {
      options[checkbox.getAttribute('data-id')] = checkbox.checked;
    });

  localStorage.setItem('userOptions', JSON.stringify(options));
}

function loadOptions() {
  const savedOptions = localStorage.getItem('userOptions');

  if (savedOptions) {
    const options = JSON.parse(savedOptions);

    document
      .querySelectorAll('.switch input[type="checkbox"]')
      .forEach((checkbox) => {
        const id = checkbox.getAttribute('data-id');
        checkbox.checked = options[id];
      });
  }
}

loadOptions();

document
  .querySelectorAll('.switch input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener('change', saveOptions);
  });
