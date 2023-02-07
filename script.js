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
};

const account2 = {
  owner: "Olena Sharabura",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Olena Vovchenko",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Max Surkov",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

function displayMovements(movements) {
  containerMovements.innerHTML = "";

  movements.forEach(function (movement, index) {
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

function calcDisplayBalance(movements) {
  const balance = movements.reduce(function (accumulator, movement) {
    return accumulator + movement;
  }, 0);

  labelBalance.textContent = `${balance}€`;
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

// Event handler
let currentAccount;

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

    displayMovements(currentAccount.movements);
    calcDisplayBalance(currentAccount.movements);
    calcDisplaySummary(currentAccount);
  }
});
