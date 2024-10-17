class Transaction {

  constructor ({id, type, status, method, amount}) {
    this.id = id;
    this.type = type;
    this.status = status;
    this.method = method;
    this.amount = amount;
  }

  process() {
    if (this.status !== 'OPEN')
      this._throwError();
  
    try {
      const handler = Transaction.handlers[this.type][this.method];
      handler(this);
    }
    catch (error) {
      this._throwError();
    }
  }

  _throwError() {
    throw new Error(`\nInvalid transaction:\n${this.toString()}\n`);
  }

  toString() {
    let str = 'TRANSACTION\n';
    str += `id: ${this.id}\n`;
    str += `type: ${this.type}\n`;
    str += `status: ${this.status}\n`;
    str += `method: ${this.method}\n`;
    str += `amount: ${this.amount}\n`;
    return str;
  }

  static handlers = {
    "PAYMENT": {
      "PAYPAL": Transaction.processPayPalPayment,
      "PLAN": Transaction.processPlanPayment,
      "CREDIT_CARD": Transaction.processCreditCardPayment
    }, 
    "REFUND": {
      "PAYPAL": Transaction.processPayPalRefund,
      "PLAN": Transaction.processPlanRefund,
      "CREDIT_CARD": Transaction.processCreditCardRefund
    }
  }

  static processCreditCardPayment(transaction) {
    console.log(
      'Processing credit card payment for amount: ' + transaction.amount
    );
  }
  
  static processCreditCardRefund(transaction) {
    console.log(
      'Processing credit card refund for amount: ' + transaction.amount
    );
  }
  
  static processPayPalPayment(transaction) {
    console.log('Processing PayPal payment for amount: ' + transaction.amount);
  }
  
  static processPayPalRefund(transaction) {
    console.log('Processing PayPal refund for amount: ' + transaction.amount);
  }
  
  static processPlanPayment(transaction) {
    console.log('Processing plan payment for amount: ' + transaction.amount);
  }
  
  static processPlanRefund(transaction) {
    console.log('Processing plan refund for amount: ' + transaction.amount);
  }
}

main();

function main() {
  const transactionsData = [
    {
      id: 't1',
      type: 'PAYMENT',
      status: 'OPEN',
      method: 'CREDIT',
      amount: '23.99',
    },
    {
      id: 't2',
      type: 'PAYMENT',
      status: 'OPEN',
      method: 'PAYPALS',
      amount: '100.43',
    },
    {
      id: 't3',
      type: 'REFUND',
      status: 'OPEN',
      method: 'CREDIT_CARD',
      amount: '10.99',
    },
    {
      id: 't4',
      type: 'PAYMENT',
      status: 'CLOSED',
      method: 'PLAN',
      amount: '15.99',
    },
  ];

  const transactions = transactionsData.map(data => new Transaction(data));

  processTransactions(transactions);
}

function processTransactions(transactions) {

  if (!transactions || !transactions.length) {
    console.log('No transactions provided!');
    return;
  }

  for (const transaction of transactions) {
    try {
      transaction.process();
    }
    catch (error) {
      console.log(error.message || `Error processing transaction\n${transaction}`);
    }
  }
}

/*

main();

function main() {
  const transactions = [
    {
      id: 't1',
      type: 'PAYMENT',
      status: 'OPEN',
      method: 'CREDIT_CARD',
      amount: '23.99',
    },
    {
      id: 't2',
      type: 'PAYMENT',
      status: 'OPEN',
      method: 'PAYPAL',
      amount: '100.43',
    },
    {
      id: 't3',
      type: 'REFUND',
      status: 'OPEN',
      method: 'CREDIT_CARD',
      amount: '10.99',
    },
    {
      id: 't4',
      type: 'PAYMENT',
      status: 'CLOSED',
      method: 'PLAN',
      amount: '15.99',
    },
  ];

  processTransactions(transactions);
}

function processTransactions(transactions) {
  if (transactions && transactions.length > 0) {
    for (const transaction of transactions) {
      if (transaction.type === 'PAYMENT') {
        if (transaction.status === 'OPEN') {
          if (transaction.method === 'CREDIT_CARD') {
            processCreditCardPayment(transaction);
          } else if (transaction.method === 'PAYPAL') {
            processPayPalPayment(transaction);
          } else if (transaction.method === 'PLAN') {
            processPlanPayment(transaction);
          }
        } else {
          console.log('Invalid transaction type!');
        }
      } else if (transaction.type === 'REFUND') {
        if (transaction.status === 'OPEN') {
          if (transaction.method === 'CREDIT_CARD') {
            processCreditCardRefund(transaction);
          } else if (transaction.method === 'PAYPAL') {
            processPayPalRefund(transaction);
          } else if (transaction.method === 'PLAN') {
            processPlanRefund(transaction);
          }
        } else {
          console.log('Invalid transaction type!', transaction);
        }
      } else {
        console.log('Invalid transaction type!', transaction);
      }
    }
  } else {
    console.log('No transactions provided!');
  }
}

function processCreditCardPayment(transaction) {
  console.log(
    'Processing credit card payment for amount: ' + transaction.amount
  );
}

function processCreditCardRefund(transaction) {
  console.log(
    'Processing credit card refund for amount: ' + transaction.amount
  );
}

function processPayPalPayment(transaction) {
  console.log('Processing PayPal payment for amount: ' + transaction.amount);
}

function processPayPalRefund(transaction) {
  console.log('Processing PayPal refund for amount: ' + transaction.amount);
}

function processPlanPayment(transaction) {
  console.log('Processing plan payment for amount: ' + transaction.amount);
}

function processPlanRefund(transaction) {
  console.log('Processing plan refund for amount: ' + transaction.amount);
}

*/