import { Resend } from "resend";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  });
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "orderId nao informado." });
  }

  try {
    // Busca o pedido no Firestore para ter os dados completos
    const db = getFirestore();
    const snap = await db.collection("orders").doc(orderId).get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Pedido nao encontrado." });
    }

    const order = snap.data();

    // Monta a lista de itens em HTML
    const itensHtml = order.itens
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
              ${item.quantity}x ${item.name} — ${item.size} / ${item.color}
            </td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">
              R$ ${(item.price * item.quantity / 100).toFixed(2).replace(".", ",")}
            </td>
          </tr>`
      )
      .join("");

    const totalFormatado = `R$ ${(order.total / 100).toFixed(2).replace(".", ",")}`;

    // Envia o email
    await resend.emails.send({
      // Em producao real com dominio proprio: from: "Use D'lua <noreply@usedlua.com.br>"
      // Sem dominio verificado, usa o remetente de teste do Resend:
      from: "Use D'lua <onboarding@resend.dev>",
      to: order.usuarioEmail ?? order.enderecoEntrega?.email,
      subject: `Pedido confirmado — #${order.id}`,
      html: `
        <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
          <h1 style="font-size: 22px; font-weight: 400; margin-bottom: 8px;">
            Pedido confirmado
          </h1>
          <p style="color: #666; margin-bottom: 32px;">
            Obrigada pela sua compra, ${order.enderecoEntrega.nome}.
          </p>

          <p style="margin-bottom: 8px;">
            <strong>Número do pedido:</strong> #${order.id}
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            ${itensHtml}
            <tr>
              <td style="padding: 12px 0; font-weight: 600;">Total</td>
              <td style="padding: 12px 0; font-weight: 600; text-align: right;">
                ${totalFormatado}
              </td>
            </tr>
          </table>

          <p style="margin-bottom: 4px;"><strong>Endereço de entrega:</strong></p>
          <p style="color: #666; line-height: 1.6;">
            ${order.enderecoEntrega.rua}, ${order.enderecoEntrega.numero}<br>
            ${order.enderecoEntrega.bairro}
          </p>

          <p style="margin-top: 32px; color: #666; font-size: 13px;">
            Você pode acompanhar o status do pedido em
            <a href="https://use-dlua.vercel.app/rastreamento" style="color: #1a1a1a;">
              use-dlua.vercel.app/rastreamento
            </a>
            usando o número <strong>#${order.id}</strong>.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ sent: true });
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return res.status(500).json({ error: "Erro ao enviar email." });
  }
}