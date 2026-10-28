import { MercadoPagoConfig, Payment } from "mercadopago";
import * as adminModule from "firebase-admin";

const admin = adminModule.default ?? adminModule;

export default async function handler(req, res) {
  if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  });

  if (req.method === "GET") {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, data } = req.body;

    if (type !== "payment") {
      return res.status(200).json({ ignored: true });
    }

    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: data.id });

    const orderId = paymentData.external_reference;
    const status = paymentData.status;

    if (!orderId) {
      console.log("Webhook recebido sem external_reference, ignorando.");
      return res.status(200).json({ ignored: "no external_reference" });
    }

    const statusMap = {
      approved: "pago",
      pending: "pending",
      in_process: "pending",
      rejected: "cancelado",
      cancelled: "cancelado",
      refunded: "cancelado",
    };

    const newStatus = statusMap[status] ?? "pending";

    const db = admin.firestore();
    await db.collection("orders").doc(orderId).update({
      status: newStatus,
      mpPaymentId: String(data.id),
      mpStatus: status,
      [`historico.${newStatus}`]: new Date().toISOString(),
    });

    return res.status(200).json({ received: true });

  } catch (error) {
    console.error("Erro no webhook:", error);
    return res.status(200).json({ error: "Erro interno, mas recebido." });
  }
}