"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Nikita Zakharchenko",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: "Olena Sharabura",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
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

function displayMovements(movements, sort = false) {
  containerMovements.innerHTML = "";

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (movement, index) {
    const type = movement > 0 ? "deposit" : "withdrawal";

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${index + 1} 
          ${type}
        </div>
        <div class="movements__value">${movement}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

function calcDisplayBalance(account) {
  account.balance = account.movements.reduce(function (accumulator, movement) {
    return accumulator + movement;
  }, 0);

  labelBalance.textContent = `${account.balance}€`;
}

function calcDisplaySummary(currentAccount) {
  const incomes = currentAccount.movements
    .filter(function (movement) {
      return movement > 0;
    })
    .reduce(function (accumulator, movement) {
      return accumulator + movement;
    });

  labelSumIn.textContent = `${incomes}€`;

  const out = currentAccount.movements
    .filter(function (movement) {
      return movement < 0;
    })
    .reduce(function (accumulator, movement) {
      return accumulator + movement;
    }, 0);

  labelSumOut.textContent = `${Math.abs(out)}€`;

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

  labelSumInterest.textContent = `${interest}€`;
}

function updateUI(currentAccount) {
  displayMovements(currentAccount.movements);
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
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    updateUI(currentAccount);
  }

  // Clear input fields
  inputTransferAmount.value = inputTransferTo.value = "";
  inputTransferAmount.blur();
});

// Request loan
btnLoan.addEventListener("click", function (event) {
  event.preventDefault();

  const amount = Number(inputLoanAmount.value);

  const calcLoanValue = (mov) => mov >= amount * 0.1;

  if (amount > 0 && currentAccount.movements.some(calcLoanValue)) {
    currentAccount.movements.push(amount);

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

  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});