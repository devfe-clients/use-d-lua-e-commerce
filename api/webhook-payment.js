import { MercadoPagoConfig, Payment } from "mercadopago";
import admin from "firebase-admin";

// Inicializa o Firebase Admin so uma vez
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  // O Mercado Pago manda um GET para verificar que a URL existe
  // Precisa responder 200 senao ele nao salva o webhook
  if (req.method === "GET") {
    return res.status(200).json({ ok: true });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, data } = req.body;

    // O MP manda varios tipos de notificacao
    // A gente so processa pagamentos
    if (type !== "payment") {
      return res.status(200).json({ ignored: true });
    }

    // Busca os detalhes do pagamento na API do MP
    const payment = new Payment(mpClient);
    const paymentData = await payment.get({ id: data.id });

const orderId = paymentData.external_reference;
const status = paymentData.status;

// Se não tem external_reference, é pagamento de teste ou simulação — ignora
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
    // Retorna 200 mesmo com erro — o MP reenvía se receber 4xx ou 5xx
    // Isso evita um loop infinito de reenvios
    return res.status(200).json({ error: "Erro interno, mas recebido." });
  }
}