"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Nikita Zakharchenko",
  movements: [200, 450, -400, 3000, -650, -133.9, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2023-02-01T12:23:34.971Z",
    "2023-02-02T12:23:34.971Z",
    "2023-02-03T12:23:34.971Z",
    "2023-02-04T12:23:34.971Z",
    "2023-02-05T12:23:34.971Z",
    "2023-02-06T12:23:34.971Z",
    "2023-02-07T12:23:34.971Z",
    "2023-02-08T12:23:34.971Z",
  ],
  currency: "EUR",
  locale: "de-DE",
};

const account2 = {
  owner: "Olena Sharabura",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2023-01-01T12:23:34.971Z",
    "2023-02-02T12:23:34.971Z",
    "2023-02-03T12:23:34.971Z",
    "2023-02-04T12:23:34.971Z",
    "2023-02-05T12:23:34.971Z",
    "2023-02-06T12:23:34.971Z",
    "2023-02-07T12:23:34.971Z",
    "2023-02-08T12:23:34.971Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

// Functions

function formatCurrency(value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

function calcDaysPassed(firstDate, secondDate) {
  return Math.round(Math.abs(secondDate - firstDate) / (1000 * 60 * 60 * 24));
}

function formatMovementDate(date, locale) {
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed == 0) {
    return "Today";
  } else if (daysPassed == 1) {
    return "Yesterday";
  } else if (daysPassed <= 7) {
    return `${daysPassed} days`;
  }

  // const day = `${date.getDay()}`.padStart(2, 0);
  // const month = `${date.getMonth()}`.padStart(2, 0);
  // const year = date.getFullYear();

  // return `${day}/${month}/${year}`;

  return Intl.DateTimeFormat(locale).format(date);
}

function computingUserNames(accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(" ")
      .map(function (name) {
        return name[0];
      })
      .join("");
  });
}

computingUserNames(accounts);

function displayMovements(account, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort
    ? account.movements.slice().sort((a, b) => a - b)
    : account.movements;

  movs.forEach(function (movement, index) {
    const type = movement > 0 ? "deposit" : "withdrawal";

    const date = new Date(account.movementsDates[index]);
    const displayDate = formatMovementDate(date, account.locale);

    const formatedMovement = formatCurrency(
      movement,
      account.locale,
      account.currency
    );

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${index + 1} 
          ${type}
        </div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatedMovement}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

function calcDisplayBalance(account) {
  account.balance = account.movements.reduce(function (accumulator, movement) {
    return accumulator + movement;
  }, 0);

  labelBalance.textContent = formatCurrency(
    account.balance,
    account.locale,
    account.currency
  );
}

function calcDisplaySummary(currentAccount) {
  const incomes = currentAccount.movements
    .filter(function (movement) {
      return movement > 0;
    })
    .reduce(function (accumulator, movement) {
      return accumulator + movement;
    });

  labelSumIn.textContent = formatCurrency(
    incomes,
    currentAccount.locale,
    currentAccount.currency
  );

  const out = currentAccount.movements
    .filter(function (movement) {
      return movement < 0;
    })
    .reduce(function (accumulator, movement) {
      return accumulator + movement;
    }, 0);

  labelSumOut.textContent = formatCurrency(
    out,
    currentAccount.locale,
    currentAccount.currency
  );

  const interest = currentAccount.movements
    .filter(function (movement) {
      return movement > 0;
    })
    .map(function (deposit) {
      return (deposit * currentAccount.interestRate) / 100;
    })
    .filter(function (interest, index, arr) {
      // console.log(arr);
      return interest >= 1; // 0.84 was exclude
    })
    .reduce(function (accumulator, movement) {
      return accumulator + movement;
    });

  labelSumInterest.textContent = formatCurrency(
    interest,
    currentAccount.locale,
    currentAccount.currency
  );
}

function updateUI(currentAccount) {
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
}

// Event handler
let currentAccount;

// Log in
btnLogin.addEventListener("click", function (event) {
  event.preventDefault();

  currentAccount = accounts.find(function (account) {
    return account.username == inputLoginUsername.value;
  });

  if (currentAccount?.pin == Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    containerApp.style.opacity = 100;

    // Create current date and time
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
      // weekday: "long",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    updateUI(currentAccount);
  }
});

// Transfer amount
btnTransfer.addEventListener("click", function (event) {
  event.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(function (account) {
    return account.username == inputTransferTo.value;
  });

  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username != currentAccount.username
  ) {
    // Doinig the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }

  // Clear input fields
  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur();
});

// Request loan
btnLoan.addEventListener("click", function (event) {
  event.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  const calcLoanValue = (mov) => mov >= amount * 0.1;

  if (amount > 0 && currentAccount.movements.some(calcLoanValue)) {
    currentAccount.movements.push(amount);

    // Add loan date
    currentAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }

  inputLoanAmount.value = "";
});

// Close account
btnClose.addEventListener("click", function (event) {
  event.preventDefault();

  if (
    currentAccount.username == inputCloseUsername.value &&
    currentAccount.pin == Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(function (account) {
      return account.username == currentAccount.username;
    });

    // Clear input fields
    inputCloseUsername.value = inputClosePin.value = "";

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }
});

let sorted = false;

// Sorting
btnSort.addEventListener("click", function (event) {
  event.preventDefault();

  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
