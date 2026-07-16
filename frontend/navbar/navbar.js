const buttons = document.querySelectorAll('.navbar button');
const profileButton = document.getElementById('profile-button');

const profileMenu = document.querySelector('.profile-menu');

profileButton.addEventListener('click', () => {
  profileMenu.classList.toggle('open');
});

// zamykanie po kliknięciu poza menu

document.addEventListener('click', (event) => {
  if (!profileMenu.contains(event.target)) {
    profileMenu.classList.remove('open');
  }
});

// ustawienia

const settingsButton = document.querySelector('[data-page="settings"]');

settingsButton.addEventListener('click', () => {
  window.location.href = '../settings/settings.html';
});

// wylogowanie

const logoutButton = document.getElementById('logout');

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('token');

  window.location.href = '../index.html';
});

const pages = {
  home: '../home/home.html',

  notes: '../notes/notes.html',

  calendar: '../calendar/calendar.html',

  day: '../day/day.html',

  expenses: '../expenses/expenses.html',

  profile: '../profile/profile.html',
};

buttons.forEach((button) => {
  // jeżeli przycisk jest aktualnie aktywny
  if (button.classList.contains('active')) {
    button.disabled = true;

    return;
  }

  button.addEventListener('click', () => {
    const page = button.dataset.page;

    if (pages[page]) {
      window.location.href = pages[page];
    }
  });
});
