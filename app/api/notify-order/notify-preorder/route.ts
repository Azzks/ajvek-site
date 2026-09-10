import { Resend } from "resend";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { getProduct } from "@/lib/products";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PREORDER_LIMIT = 20;

export async function POST(request: Request) {
  const preorder = await request.json();

  try {
    // 1. Email de notification à l'équipe AJVEK (inchangé)
    const { error: ownerEmailError } = await resend.emails.send({
      from: "AJVEK <onboarding@resend.dev>",
      to: "ajvek.contact@gmail.com",
      subject: `Nouvelle précommande — ${preorder.product_name}`,
      text: `Nouvelle précommande !\nProduit: ${preorder.product_name}\nCouleur: ${preorder.color}\nTaille: ${preorder.size}\nNom: ${preorder.name}\nEmail: ${preorder.email}\nTéléphone: ${preorder.phone || "-"}`,
    });

    if (ownerEmailError) {
      console.error("[notify-preorder] Erreur email équipe:", ownerEmailError);
    }

    // 2. Vérifie si l'objectif de 20 précommandes est atteint, et déclenche
    // les liens de paiement si c'est le cas (une seule fois).
    await maybeTriggerPayments();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[notify-preorder] Erreur générale:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function maybeTriggerPayments() {
  const { count } = await supabaseAdmin
    .from("preorders")
    .select("*", { count: "exact", head: true });

  console.log("[notify-preorder] Nombre total de précommandes:", count);

  if (!count || count < PREORDER_LIMIT) return;

  // Garde-fou : si des liens ont déjà été envoyés, on ne le refait pas
  const { data: alreadySent } = await supabaseAdmin
    .from("preorders")
    .select("id")
    .not("checkout_url", "is", null)
    .limit(1);

  if (alreadySent && alreadySent.length > 0) {
    console.log("[notify-preorder] Liens déjà envoyés, on ne refait rien.");
    return;
  }

  const { data: allPreorders, error } = await supabaseAdmin
    .from("preorders")
    .select("*");

  if (error) {
    console.error("[notify-preorder] Erreur lecture preorders:", error);
    return;
  }
  if (!allPreorders) return;

  console.log(`[notify-preorder] Déclenchement des paiements pour ${allPreorders.length} précommandes.`);

  for (const p of allPreorders) {
    const product = getProduct(p.product_slug);
    if (!product) {
      console.error("[notify-preorder] Produit introuvable pour slug:", p.product_slug);
      continue;
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: `${product.name} — ${p.color} — Taille ${p.size}`,
              },
              unit_amount: Math.round(product.priceValue * 100),
            },
            quantity: 1,
          },
        ],
        customer_email: p.email,
        success_url: "https://ajvek.fr/paiement/succes",
        cancel_url: "https://ajvek.fr/paiement/annule",
      });

      if (!session.url) {
        console.error("[notify-preorder] Pas d'URL Stripe retournée pour:", p.email);
        continue;
      }

      await supabaseAdmin
        .from("preorders")
        .update({ checkout_url: session.url })
        .eq("id", p.id);

      const { error: customerEmailError } = await resend.emails.send({
        from: "AJVEK <commandes@ajvek.fr>",
        to: p.email,
        subject: "Ta précommande AJVEK est prête à être payée !",
        text: `Bonjour ${p.name},\n\nBonne nouvelle : les 20 précommandes sont complètes, la production va être lancée !\n\nTu peux maintenant finaliser ton achat (${product.name} — ${p.color} — Taille ${p.size}, ${product.price}) via ce lien sécurisé :\n${session.url}\n\nMerci de ta confiance,\nL'équipe AJVEK`,
      });

      if (customerEmailError) {
        console.error(`[notify-preorder] Erreur email client (${p.email}):`, customerEmailError);
      } else {
        console.log(`[notify-preorder] Lien de paiement envoyé à ${p.email}`);
      }
    } catch (stripeErr) {
      console.error(`[notify-preorder] Erreur Stripe pour ${p.email}:`, stripeErr);
    }
  }
}