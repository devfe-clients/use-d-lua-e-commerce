const { MercadoPagoConfig, Preference } = require("mercadopago");

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { itens, orderId } = req.body;

  if (!itens || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: "O carrinho esta vazio." });
  }

  if (!orderId) {
    return res.status(400).json({ error: "ID do pedido nao informado." });
  }

  try {
    const items = itens.map((item) => ({
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
        external_reference: orderId,
        back_urls: {
          success: `https://use-dlua.vercel.app/pedido/confirmacao?pedido=${orderId}`,
          failure: `https://use-dlua.vercel.app/checkout?erro=pagamento`,
          pending: `https://use-dlua.vercel.app/pedido/confirmacao?pedido=${orderId}&status=pending`,
        },
        auto_return: "approved",
        statement_descriptor: "USE DLUA",
      },
    });

    return res.status(200).json({
      checkoutUrl: result.sandbox_init_point,
      preferenceId: result.id,
    });
  } catch (error) {
    console.error("Erro ao criar checkout:", error);
    return res.status(500).json({ error: "Erro ao criar preferencia de pagamento." });
  }
}