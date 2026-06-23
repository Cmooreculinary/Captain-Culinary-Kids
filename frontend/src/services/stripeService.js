import axios from "axios";
import { Storage } from "./storage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const client = axios.create({ baseURL: `${BACKEND_URL}/api`, timeout: 15000 });

export const StripeService = {
  async createCheckout() {
    try {
      const sessionId = Storage.getSessionId();
      const r = await client.post("/stripe/checkout", { cck_session_id: sessionId });
      return r.data.checkout_url;
    } catch {
      return null;
    }
  },

  async verifyPurchase(stripeSessionId) {
    try {
      const r = await client.get(`/stripe/verify/${stripeSessionId}`);
      return r.data.unlocked === true;
    } catch {
      return false;
    }
  },
};
