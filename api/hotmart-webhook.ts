// Colocar este archivo en: api/hotmart-webhook.ts (carpeta api/ en la raíz del repo)
// Vercel lo detecta automáticamente como función serverless — no requiere
// configuración extra en vercel.json para esto.
//
// URL pública resultante: https://machxapp.vercel.app/api/hotmart-webhook
// Esa es la URL que se registra en Hotmart → Tools → Webhook → Register Webhook.
//
// Variables de entorno requeridas en Vercel
// (Project Settings → Environment Variables, NO en el código):
//
//   HOTMART_HOTTOK             el Hottok de tu cuenta (Hotmart → Tools → Webhook → Authentication)
//   SUPABASE_URL               la misma URL que ya usa el frontend
//   SUPABASE_SERVICE_ROLE_KEY  service_role key de Supabase (Project Settings → API → service_role)
//
// IMPORTANTE: SUPABASE_SERVICE_ROLE_KEY nunca debe llevar el prefijo VITE_
// (eso la expondría al navegador y cualquiera podría escribir en `licencias`
// sin pasar por Hotmart). Las variables sin prefijo VITE_ solo existen en
// el servidor — es justo lo que se necesita aquí.

import { createClient } from '@supabase/supabase-js';
// Declaración mínima para que TypeScript reconozca `process.env` sin
// instalar @types/node — Vercel ya provee `process` en tiempo de ejecución,
// esto solo arregla el chequeo de tipos, no cambia el comportamiento.
declare const process: { env: Record<string, string | undefined> };

// Evento de Hotmart -> estado interno de la licencia.
const MAPA_ESTADO: Record<string, string> = {
  PURCHASE_APPROVED: 'activa',
  PURCHASE_COMPLETE: 'activa',
  PURCHASE_BILLET_PRINTED: 'pendiente', // boleto/OXXO emitido, aún sin pagar
  PURCHASE_DELAYED: 'pendiente',
  PURCHASE_CANCELED: 'cancelada',
  PURCHASE_EXPIRED: 'cancelada',
  PURCHASE_REFUNDED: 'reembolsada',
  PURCHASE_CHARGEBACK: 'contracargo',
  PURCHASE_PROTEST: 'contracargo',
};

// id de producto en Hotmart -> nombre de plan interno.
// Hoy solo existe Starter, así que se deja vacío y se usa PLAN_POR_DEFECTO.
// Cuando Professional se venda como producto separado en Hotmart, agregar
// su id aquí, ej: '7654321': 'professional'.
const MAPA_PLAN: Record<string, string> = {};
const PLAN_POR_DEFECTO = 'starter';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  // 1. Verificar que el aviso viene realmente de Hotmart y no de un tercero
  //    haciéndose pasar por Hotmart.
  const hottokRecibido = req.headers['x-hotmart-hottok'];
  if (!hottokRecibido || hottokRecibido !== process.env.HOTMART_HOTTOK) {
    res.status(401).send('Hottok inválido');
    return;
  }

  const body = req.body ?? {};
  const evento: string = body.event;
  const datos = body.data ?? {};

  const email: string | undefined = datos.buyer?.email;
  const idProducto = datos.product?.id;
  const transaccion: string | undefined = datos.purchase?.transaction;
  const fechaCompraMs: number | undefined =
    datos.purchase?.approved_date ?? datos.purchase?.order_date;

  const nuevoEstado = MAPA_ESTADO[evento];

  // Eventos que no nos interesan (ej. abandono de carrito, si algún día se
  // activa por error) — respondemos 200 igual para que Hotmart no marque
  // la configuración como rota y la desactive.
  if (!nuevoEstado || !email) {
    res.status(200).json({ recibido: true, procesado: false, evento: evento ?? null });
    return;
  }

  const plan = (idProducto && MAPA_PLAN[String(idProducto)]) || PLAN_POR_DEFECTO;

  const supabase = createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string
  );

  const { error } = await supabase.from('licencias').upsert(
    {
      email: email.toLowerCase().trim(),
      plan,
      id_producto_hotmart: idProducto ?? null,
      estado: nuevoEstado,
      transaccion_hotmart: transaccion ?? null,
      fecha_compra: fechaCompraMs ? new Date(fechaCompraMs).toISOString() : null,
      payload_crudo: body,
    },
    { onConflict: 'email' }
  );

  if (error) {
    console.error('Error guardando licencia desde webhook de Hotmart:', error);
    res.status(500).json({ recibido: true, procesado: false, error: error.message });
    return;
  }

  res.status(200).json({ recibido: true, procesado: true, evento, email, estado: nuevoEstado });
}
