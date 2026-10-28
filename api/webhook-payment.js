import { MercadoPagoConfig, Payment } from "mercadopago";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export default async function handler(req, res) {
  // Inicializa só se ainda não foi inicializado
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  }

  const db = getFirestore();

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