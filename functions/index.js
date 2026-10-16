const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { MercadoPagoConfig, Preference } = require("mercadopago");

admin.initializeApp();

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

exports.createCheckout = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid ?? null;

  if (!data.itens || !Array.isArray(data.itens) || data.itens.length === 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "O carrinho esta vazio."
    );
  }

  if (!data.orderId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "ID do pedido nao informado."
    );
  }

  const items = data.itens.map((item) => ({
    id: item.productId,
    title: `${item.name} — ${item.size} / ${item.color}`,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: "BRL",
  }));

  const preference = new Preference(mpClient);

  const result = await preference.create({
    body: {
      items,
      external_reference: data.orderId,
      back_urls: {
        success: `https://use-dlua.vercel.app/pedido/confirmacao?pedido=${data.orderId}`,
        failure: `https://use-dlua.vercel.app/checkout?erro=pagamento`,
        pending: `https://use-dlua.vercel.app/pedido/confirmacao?pedido=${data.orderId}&status=pending`,
      },
      auto_return: "approved",
      statement_descriptor: "USE DLUA",
    },
  });

  const db = admin.firestore();
  await db.collection("orders").doc(data.orderId).update({
    mpPreferenceId: result.id,
    mpStatus: "pending",
  });

  return {
    checkoutUrl: result.init_point,
    preferenceId: result.id,
  };
});