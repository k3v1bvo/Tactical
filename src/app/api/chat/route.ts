import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getEnv(key: string): string {
  if (process.env[key]) return process.env[key] as string;
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        const [k, ...v] = trimmed.split('=');
        if (k.trim() === key) {
          return v.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return '';
}

const SYSTEM_TACTICAL_KNOWLEDGE = `
ERES: "OPERADOR TÁCTICO KILO-9", la IA militar de asistencia operativa de Tienda Táctica Cochabamba (Bolivia).
TONO: Profesional, técnico militar, conciso, respetuoso, resolutivo. Usas términos como "Afirmativo", "Operador", "Recibido", "Coordenadas", "Ficha técnica".
MONEDA: Siempre en Bolivianos (Bs.).

DATOS LOGÍSTICOS CLAVE:
- Base Central de Operaciones: Av. Heroínas #560, Cochabamba, Bolivia.
- Horario de Recojo: Lunes a Sábado de 09:00 a 19:00 (Gratis).
- Delivery Local: Cercado Cochabamba (Bs. 15, tiempo aprox 45-90 min en moto con precinto de seguridad).
- Zona Conurbada: Quillacollo, Sacaba, Tiquipaya, Colcapirhua (Bs. 25).
- Envíos Nacionales: La Paz, Santa Cruz, Oruro, Potosí, Sucre, Tarija, Beni, Pando (Bs. 35 por flota terrestre con guía de rastreo y precinto).

MODALIDAD DE PAGO EN BOLIVIA:
1. Pago 100% QR Simple: Desbloquea un SOUVENIR TÁCTICO DE REGALO (Parche de goma con velcro militar o pulsera Paracord 550 supervivencia).
2. Pago Dividido 50/50: 50% anticipo por QR para precintar el paquete + 50% al chofer o al recoger en mano.
3. Pago Contra Entrega en Efectivo: Válido en recojo en almacén Heroínas #560.

PRODUCTOS PRINCIPALES:
- Plate Carrier Nivel IV (Bs. 2,015.00): Sistema MOLLE, compatible con placas cerámicas/Kevlar NIJ IV. Color Multicam / Coyote / Negro.
- Botas Tácticas Desert Storm Vibram (Bs. 1,250.00): Membrana impermeable Gore-Tex, suela antideslizante Vibram, altura 8".
- Mira Holográfica EOTech XPS3 (Bs. 4,170.00): Retícula 68 MOA punto rojo, compatible con visión nocturna NVG, sumergible 10m.
- Mochila Táctica 72h Assault Pack 45L (Bs. 903.00): Cordura 1000D balística, compartimento hidratación 3L, sistema MOLLE.
- Guantes Tácticos Oakley SI Assault (Bs. 452.00): Nudillos de fibra de carbono, palma de cuero reforzado Kevlar.
- Cuchillo KA-BAR USMC Full Size (Bs. 625.00): Acero al carbono 1095 Cro-Van 7 pulgadas, funda Kydex.

CONTACTO DIRECTO WHATSAPP DE MANDO: +591 71234567.
`;

export async function POST(req: Request) {
  try {
    const { messages, userQuery } = await req.json();

    const query = (userQuery || (messages && messages[messages.length - 1]?.content) || '').toLowerCase();
    const geminiKey = getEnv('GEMINI_API_KEY');

    // 1. If Google Gemini API key is configured, query Gemini
    if (geminiKey && geminiKey.trim().length > 10) {
      try {
        const conversationHistory = (messages || []).slice(-6).map((m: any) => ({
          role: m.sender === 'user' || m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text || m.content || '' }],
        }));

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SYSTEM_TACTICAL_KNOWLEDGE}\n\nInstrucción: Responde a la siguiente consulta del operador de forma breve y estructurada:\n\n${query}`,
                    },
                  ],
                },
                ...conversationHistory,
              ],
              generationConfig: {
                maxOutputTokens: 500,
                temperature: 0.3,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return NextResponse.json({
              reply: replyText,
              source: 'gemini_ai',
            });
          }
        }
      } catch (geminiError) {
        console.warn('Gemini API query error, using Tactical Knowledge Engine:', geminiError);
      }
    }

    // 2. Intelligent Built-in Tactical Engine (Real-time keyword & intent reasoning)
    let reply = '';
    let quickActions: string[] = [];

    if (query.includes('chaleco') || query.includes('plate carrier') || query.includes('balist') || query.includes('placa')) {
      reply = `🛡️ **REPORTE BALÍSTICO — PLATE CARRIER NIVEL IV**\n\n- **Modelo:** Portaplacas Modular MOLLE Mil-Spec.\n- **Protección:** Compatible con placas balísticas Stand-Alone NIJ IV (detiene munición .30-06 M2 AP perforante).\n- **Material:** Cordura 1000D con tratamiento IR (antirreflejo nocturno).\n- **Inversión:** **Bs. 2,015.00**.\n- **Disponibilidad:** 15 unidades en almacén central de Cochabamba.`;
      quickActions = ['Ver Chalecos en Catálogo', '¿Cómo es el envío?', 'Coordinar Talla'];
    } else if (query.includes('bota') || query.includes('calzado') || query.includes('vibram') || query.includes('gore')) {
      reply = `🥾 **FICHA TÁCTICA — BOTAS COMBATE VIBRAM**\n\n- **Modelo:** Desert Storm 8" Waterproof.\n- **Suela:** Vibram con tracción multidireccional antideslizante.\n- **Membrana:** Gore-Tex 100% impermeable y transpirable.\n- **Inversión:** **Bs. 1,250.00**.\n- **Tallas disponibles:** 39 a 44 (Cochabamba con entrega inmediata).`;
      quickActions = ['Ver Botas', 'Consultar mi Talla', 'Pedir Delivery'];
    } else if (query.includes('mira') || query.includes('eotech') || query.includes('optica') || query.includes('punto rojo')) {
      reply = `🎯 **SISTEMA ÓPTICO — EOTECH XPS3 HOLOGRÁFICA**\n\n- **Retícula:** 68 MOA con punto de 1 MOA de precisión.\n- **Visión Nocturna:** Modo NVG compatible con fósforo verde/blanco.\n- **Sumergible:** Hasta 10 metros de profundidad.\n- **Inversión:** **Bs. 4,170.00**.\n- **Stock:** 8 unidades precintadas en caja hermética militar.`;
      quickActions = ['Ver en Catálogo', 'Ficha Técnica Completa'];
    } else if (query.includes('envio') || query.includes('entrega') || query.includes('delivery') || query.includes('donde') || query.includes('cochabamba')) {
      reply = `📍 **LOGÍSTICA DE DESPACHO — COCHABAMBA & BOLIVIA**\n\n1. **Recojo en Tienda Heroínas:** Av. Heroínas #560 (Lun-Sáb 09:00 a 19:00) — **Costo Bs. 0 (Gratis)**.\n2. **Delivery Moto Cercado:** Entrega rápida en 45 a 90 min — **Bs. 15**.\n3. **Zona Sacaba / Quillacollo:** Despacho con chofer verificado — **Bs. 25**.\n4. **Envíos Nacionales:** Toda Bolivia vía encomienda terrestre por flota con precinto y guía de rastreo — **Bs. 35**.`;
      quickActions = ['Ver Zonas de Envío', 'Pagar con QR Simple', 'Hablar por WhatsApp'];
    } else if (query.includes('pago') || query.includes('qr') || query.includes('transferencia') || query.includes('regalo') || query.includes('50')) {
      reply = `💳 **MODALIDADES DE PAGO TÁCTICO**\n\n- **100% QR Simple Inmediato:** Desbloquea un **Souvenir Militar de Regalo** (pulsera paracord o parche táctico) dentro de tu paquete.\n- **Pago Dividido 50/50:** 50% de anticipo por QR para confirmar y precintar tu orden, y el 50% restante lo cancelas al recibir el paquete.\n- **Contra Entrega Efectivo:** Al retirar en persona de Base Heroínas #560.`;
      quickActions = ['Ir a Checkout', 'Ver Regalo Táctico'];
    } else if (query.includes('mochila') || query.includes('assault') || query.includes('cordura')) {
      reply = `🎒 **MOCHILA ASALTO 72H PACK (45 LITROS)**\n\n- **Material:** Cordura 1000D resistente a abrasión y rasgaduras.\n- **Capacidad:** 45 Litros con sistema de correas de compresión.\n- **Compartimento de Hidratación:** Compatible con vejigas de 3L.\n- **Inversión:** **Bs. 903.00**.`;
      quickActions = ['Añadir al Carrito', 'Ver Mochila'];
    } else {
      reply = `Afirmativo, operador. En **Tienda Táctica Cochabamba** equipamos fuerzas especiales, seguridad y entusiastas con material táctico certificado.\n\n¿En qué podemos apoyarte hoy?\n- **Catálogo:** Chalecos Nivel IV, Botas Vibram, Óptica EOTech, Mochilas Cordura.\n- **Logística:** Entregas en Cercado (Heroínas #560) o envíos a toda Bolivia.\n- **Promoción:** 100% abono QR incluye souvenir militar sorpresa.`;
      quickActions = ['Ver Catálogo Completo', '¿Dónde queda la tienda?', 'Consultar Envíos'];
    }

    return NextResponse.json({
      reply,
      quickActions,
      source: 'tactical_engine',
    });
  } catch (error: any) {
    console.error('Error in tactical chat API:', error);
    return NextResponse.json(
      {
        reply: 'Operador, enlace táctico momentáneamente saturado. Para atención prioritaria comunícate al WhatsApp: +591 71234567.',
        source: 'error_fallback',
      },
      { status: 500 }
    );
  }
}
