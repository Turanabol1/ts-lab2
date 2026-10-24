export type CreditCardPayment = {
  type: 'card';
  cardNumber: string;
  cardHolder: string;
  cvv: string;
};

export type CashOnDeliveryPayment = {
  type: 'cash';
  cashAmountToPay: number;
};

export type OnlineServicePayment = {
  type: 'online_service';
  serviceName: 'ApplePay' | 'GooglePay';
  transactionRef: string;
};

export type PaymentDetails = CreditCardPayment | CashOnDeliveryPayment | OnlineServicePayment;

export function isCreditCardPayment(payment: PaymentDetails): payment is CreditCardPayment {
  return payment.type === 'card';
}

export function maskCardNumber(payment: PaymentDetails): string {
  if (isCreditCardPayment(payment)) {
    const digits = payment.cardNumber.replace(/\s/g, '');
    return `**** **** **** ${digits.slice(-4)}`;
  }
  return 'Не вимагає маскування';
}

export function processPayment(payment: PaymentDetails, amount: number): string {
  switch (payment.type) {
    case 'card':
      return `Успішно списано ${amount} грн з картки платника ${payment.cardHolder}.`;
    case 'cash':
      if (payment.cashAmountToPay > amount) {
        const change = payment.cashAmountToPay - amount;
        return `Оплата готівкою при отриманні: підготувати решту ${change} грн (клієнт дає ${payment.cashAmountToPay} грн).`;
      }
      return `Оплата готівкою при отриманні: точна сума ${amount} грн.`;
    case 'online_service':
      return `Авторизацію через ${payment.serviceName} підтверджено (транзакція ${payment.transactionRef}), сума ${amount} грн.`;
    default: {
      // сюди не можна потрапити: якщо додати новий спосіб оплати і не обробити його, тут буде помилка компіляції
      const _exhaustiveCheck: never = payment;
      throw new Error(`Невідомий спосіб оплати: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}
