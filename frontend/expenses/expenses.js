const API_URL = 'http://localhost:3000';

const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '../login/index.html';
}

/* ==========================
        HELPERS
========================== */

async function apiRequest(url, options = {}) {
  const response = await fetch(API_URL + url, {
    ...options,

    headers: {
      'Content-Type': 'application/json',

      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}

function formatMoney(value) {
  return Number(value).toLocaleString('pl-PL') + ' zł';
}

/* ==========================
        ELEMENTS
========================== */

const balanceElement = document.querySelector('.summary-card strong');

const incomeElement = document.querySelector('.income strong');

const expenseElement = document.querySelector('.expense strong');

const saveElement = document.querySelector('.save strong');

const transactionContainer = document.querySelector('.transactions');

const nameInput = document.querySelector('.form-row input[type="text"]');

const amountInput = document.querySelector('.form-row input[type="number"]');

const typeSelect = document.querySelector('.form-row select');

const addButton = document.querySelector('.form-row button');

/* ==========================
        LOAD FINANCES
========================== */

async function loadFinances() {
  try {
    const data = await apiRequest('/finances');

    if (!data.success) return;

    updateSummary(data.summary);

    renderTransactions(data.finances);
  } catch (error) {
    console.log(error);
  }
}

function updateSummary(summary) {
  balanceElement.textContent = formatMoney(summary.balance);

  incomeElement.textContent = '+ ' + formatMoney(summary.income);

  expenseElement.textContent = '- ' + formatMoney(summary.expense);

  const save = summary.balance > 0 ? summary.balance : 0;

  saveElement.textContent = formatMoney(save);
}

/* ==========================
        TRANSACTIONS
========================== */

function renderTransactions(finances) {
  const old = document.querySelectorAll('.transaction');

  old.forEach((item) => item.remove());

  finances.forEach((finance) => {
    const div = document.createElement('div');

    div.className = 'transaction';

    const title = document.createElement('span');

    title.textContent = finance.title;

    const amount = document.createElement('strong');

    if (finance.type === 'income') {
      amount.className = 'plus';

      amount.textContent = '+ ' + formatMoney(finance.amount);
    } else {
      amount.className = 'minus';

      amount.textContent = '- ' + formatMoney(finance.amount);
    }

    div.append(title, amount);

    transactionContainer.appendChild(div);
  });
}

/* ==========================
        ADD FINANCE
========================== */

addButton.addEventListener('click', async () => {
  const title = nameInput.value.trim();

  const amount = Number(amountInput.value);

  const type = typeSelect.value;

  if (!title || !amount) {
    alert('Uzupełnij dane');

    return;
  }

  const result = await apiRequest('/finances', {
    method: 'POST',

    body: JSON.stringify({
      title,

      type,

      amount,

      date: new Date().toISOString().split('T')[0],
    }),
  });

  if (result.success) {
    nameInput.value = '';

    amountInput.value = '';

    loadFinances();
  }
});

/* ==========================
        LIMITS
========================== */

async function loadLimits() {
  const data = await apiRequest('/finance/limits');

  if (!data.success) return;

  console.log('Limity:', data.limits);
}

async function addLimit(category, amount, month, year) {
  return await apiRequest('/finance/limits', {
    method: 'POST',

    body: JSON.stringify({
      category,

      limitAmount: amount,

      month,

      year,
    }),
  });
}
/* ==========================
        GOALS
========================== */

const goalContainer = document.querySelector('.goal-container');

async function loadGoals() {
  try {
    const data = await apiRequest('/finance/goals');

    if (!data.success) return;

    renderGoals(data.goals);
  } catch (error) {
    console.log(error);
  }
}

function renderGoals(goals) {
  const oldCards = goalContainer.querySelectorAll('.goal-card');

  oldCards.forEach((card) => card.remove());

  goals.forEach((goal) => {
    const card = document.createElement('div');

    card.className = 'goal-card';

    const title = document.createElement('h3');

    title.textContent = goal.title;

    const target = document.createElement('p');

    target.textContent = 'Cel: ' + formatMoney(goal.target_amount);

    const progress = document.createElement('div');

    progress.className = 'progress';

    const bar = document.createElement('div');

    bar.className = 'goal-progress';

    const percent = Math.min(
      (Number(goal.saved_amount) / Number(goal.target_amount)) * 100,

      100,
    );

    bar.style.width = percent + '%';

    progress.appendChild(bar);

    const amount = document.createElement('span');

    amount.textContent = `${formatMoney(goal.saved_amount)}
             /
             ${formatMoney(goal.target_amount)}`;

    const button = document.createElement('button');

    button.textContent = 'Wpłać';

    button.className = 'add-goal';

    button.addEventListener('click', async () => {
      const value = prompt('Kwota wpłaty:');

      if (!value || Number(value) <= 0) return;

      await apiRequest(`/finance/goals/${goal.id}`, {
        method: 'PUT',

        body: JSON.stringify({
          amount: Number(value),
        }),
      });

      loadGoals();
    });

    card.append(
      title,

      target,

      progress,

      amount,

      button,
    );

    goalContainer.appendChild(card);
  });

  createAddGoalButton();
}

/* ==========================
        ADD GOAL BUTTON
========================== */

function createAddGoalButton() {
  const old = document.querySelector('.add-new-goal');

  if (old) old.remove();

  const button = document.createElement('button');

  button.className = 'add-goal add-new-goal';

  button.textContent = '+ Dodaj cel';

  button.addEventListener('click', async () => {
    const title = prompt('Nazwa celu:');

    const amount = prompt('Kwota celu:');

    if (!title || !amount) return;

    const result = await apiRequest('/finance/goals', {
      method: 'POST',

      body: JSON.stringify({
        title,

        targetAmount: Number(amount),
      }),
    });

    if (result.success) {
      loadGoals();
    }
  });

  goalContainer.appendChild(button);
}

/* ==========================
        USER DATA
========================== */

async function loadUser() {
  try {
    const data = await apiRequest('/user');

    if (data.success) {
      console.log('Użytkownik:', data.name);
    }
  } catch (error) {
    console.log(error);
  }
}

/* ==========================
        LOGOUT
========================== */

const logout = document.getElementById('logout');

if (logout) {
  logout.addEventListener('click', () => {
    localStorage.removeItem('token');

    window.location.href = '../login/index.html';
  });
}

/* ==========================
        START APP
========================== */

document.addEventListener('DOMContentLoaded', () => {
  loadUser();

  loadFinances();

  loadGoals();

  loadLimits();
});
