import Razorpay from 'razorpay';

export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
  }

  async createOrder(amount: number, currency: string, receipt: string): Promise<any> {
    return this.razorpay.orders.create({
      amount,
      currency,
      receipt,
    });
  }
}