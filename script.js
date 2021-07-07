'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2021-06-21T23:36:17.929Z',
    '2021-06-27T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
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
///////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const getDate = function (date2, locale) {
  const dayPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const date1 = new Date();
  const day = `${date2.getDate()}`.padStart(2, 0); // if the date only 1 digit, we have to pad 0 into to set 2 digits
  const month = `${date2.getMonth() + 1}`.padStart(2, 0);
  const year = date2.getFullYear();
  const displayDate = `${month}/${day}/${year}`;
  if (dayPassed(date2, date1) === 1) return `yesterday`;
  else if (dayPassed(date2, date1) === 0) return `today`;
  else if (dayPassed(date2, date1) <= 7)
    return `${dayPassed(date2, date1)} days ago`;
  return new Intl.DateTimeFormat(locale).format(date2);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date2 = new Date(acc.movementsDates[i]); // you can convert to the regular date moth year by using this one
    const displayDate = getDate(date2, acc.locale);
    const formatted = formattedNumber(acc.locale, mov, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatted}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const formattedNumber = function (locale, num, curr) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: curr, // it already fixed 2 number after the comma
  }).format(num);
};
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formattedNumber(
    acc.locale,
    acc.balance,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formattedNumber(acc.locale, incomes, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formattedNumber(acc.locale, out, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formattedNumber(
    acc.locale,
    interest,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};
const startLogOutTimer = function () {
  //Start time to 5 miniute
  let time = 10;
  //In each call, print the remaining time to UI
  const setUpTimer = function () {
    const min = `${Math.floor(time / 60)}`.padStart(2, 0);
    const second = `${time % 60}`.padStart(2, 0);
    labelTimer.textContent = `${min}:${second}`;
    if (time === 0) {
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Login to Get Started';
      clearInterval(mytimer);
    }
    time--;
  };
  setUpTimer();
  const mytimer = setInterval(
    () =>
      //decrease 1 second
      setUpTimer(),
    1000
  );
  return mytimer;
  // When 0 second, stop timer and log out user
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer22;
//FAKE ALWAYS LOGGEDIN

/*currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;*/

//Experimenting API
//Internationalizing format

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long', // long for long day
      year: 'numeric',
      weekday: 'long',
    };
    //const locale = navigator.language;
    //en-GB is representing for UK
    //en-US is representing for US
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    /*const now = new Date();
    //getdate of login
    const day = `${now.getDate()}`.padStart(2, 0); // if the date only 1 digit, we have to pad 0 into to set 2 digits
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    labelDate.textContent = `${month}/${day}/${year}`;*/
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
    if (timer22) clearInterval(timer22);
    timer22 = startLogOutTimer();
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
    if (timer22) clearInterval(timer22);
    timer22 = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);
  // we use floor because we want to round it down

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
      if (timer22) clearInterval(timer22);
      timer22 = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
//Add Date into our application

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
//exploring number and checking number
// Base 10 - 0 to 9. 1/10 = 0.1.
console.log(0.1 + 0.2); // cannot produce the result we expected
console.log(0.1 + 0.2 === 0.3);

//Conversion
console.log(Number('23'));
console.log(+'23'); // another way to conver string to number in JS

//Parsing
console.log(Number.parseInt('30px', 10));
console.log(Number.parseInt('e23', 10));

console.log(Number.parseInt(' 2.5 rem'));
console.log(Number.parseFloat('  2.5rem '));

//check NaN: not a number
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X')); // true
console.log(Number.isNaN(23 / 0));
//check if value is a number
// this one is the most use case. SHould remember this
console.log(Number.isFinite(20)); // true
console.log(Number.isFinite('20')); // false
console.log(Number.isFinite(+'20X')); //false
console.log(Number.isFinite(23 / 0)); //false

console.log(Number.isInteger(23)); //true
console.log(Number.isInteger(23.0)); //true
console.log(Number.isInteger(23 / 0)); //false

//MATH and rouding
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));
console.log(Math.min(5, 18, 23, 11, 2));

console.log(Math.PI * Number.parseFloat('10x') ** 2);
//should use floor because it is the way more flexible than trunc
console.log(Math.floor(Math.random() * 6) + 1); // random function
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max-min) => plus min to both sides => min...max
console.log(randomInt(10, 20));

//Rounding intergers
console.log(Math.trunc(23.3));

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3)); // round up
console.log(Math.ceil(23.9)); // round up

console.log(Math.floor(23.3)); // round down
console.log(Math.floor(23.9)); // round down

console.log(Math.trunc(-23.3)); // get truncated
console.log(Math.floor(-23.3));
//trunc and floor the same but work differently in negative way
// trunc round down and floor is otherwise in negative way

// Rounding decimal
console.log(+(2.7).toFixed(0)); // toFixed always return a string
console.log((2.7).toFixed(3)); // three number after comma
console.log(+(2.345).toFixed(2)); // two number after comma

console.log(5 % 2); // it's gonna produce remainder
console.log(5 / 2); // 5 = 2 + 2 + 1 the last one is remainder

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));
labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach((mov, i) => {
    if (i % 2 === 0) mov.style.backgroundColor = 'orangered';
    if (i % 3 === 0) mov.style.backgroundColor = 'blue';
  });
});
//Working with BigInt
//create BigInt number to store the big number
//it awlays contain the n in the end
console.log(BigInt(48384302));

//Operations
console.log(10000n + 10000n);
//we cannot mix bigInt number with another type
const num = 23;
const huge = 2024230849304390248029n;
console.log(huge + BigInt(num));

console.log(20n > 10); // still get true
console.log(20n === 20); // false because tripple equality is not a type of coersion

//Math function not gonna work with bigInt
//Division
console.log(12n / 3n); // it still works
console.log(10 / 3);

//Dates
//Create a date
/*
const now = new Date();
console.log(now);

console.log(new Date('Aug 02 2020 18:05:41'));
console.log(new Date('December 24, 2015'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037,10,19,15,23,5)); //the month in Javascript is zerobase
console.log(new Date(2037, 10, 31));

console.log(new Date(0))
console.log(new Date(3*24*60*60*1000)) // the number inside is timestamp as well as how we convert to miliseconds
*/
//Working with Date
/*
const future = new Date(2037,10,19,15,23,5);
   console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth() + 1);
console.log(future.getDate());
console.log(future.getDay);
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString()) // produce the string exactly the same with the movementDate string
console.log(future.getTime());// get timestamp
console.log(new Date(2142274985000));

console.log(Date.now()); //produce the timeStamp

future.setFullYear(2040); //set new year
console.log(future);*/

//Date Operation
const future = new Date(2037, 10, 19, 15, 23, 5);
console.log(+future);

const dayPassed = (date1, date2) => (date2 - date1) / (1000 * 60 * 60 * 24);
//convert to days

const calcDate = dayPassed(new Date(2037, 3, 14), new Date(2037, 3, 4));
console.log(Math.abs(calcDate));

// internationalizing numbers
const numB = 3884764.23;
const option = {
  style: 'currency', // different value for style: percent, currency
  unit: 'celsius',
  currency: 'EUR',
  // useGrouping: false, // without using grouping to group the number
};
console.log('US:   ', new Intl.NumberFormat('en-US', option).format(numB));
console.log('Germany:  ', new Intl.NumberFormat('de-DE', option).format(numB));
console.log('Syria:  ', new Intl.NumberFormat('ar-SY', option).format(numB));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(numB)
);
//setTimeOut and setInterval
const ingredients = ['olive', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} `),
  3000,
  ...ingredients
); // 3000 is the delay time the function released
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

//setInterval is the method to set time keep going in the period that we pass the data into parameter

console.log(
  setInterval(function () {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const second = now.getSeconds();
    return `${hour}:${min}:${second}`;
  }, 1000)
);
