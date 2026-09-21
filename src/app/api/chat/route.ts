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
ERES: "OPERADOR TÁCTICO KILO-9", el asistente de inteligencia artificial militar de Tienda Táctica Cochabamba (Bolivia).
TONO: Profesional militar, respetuoso, conciso, de alta precisión. Hablas con terminología táctica ("Afirmativo", "Operador", "Recibido", "Telemetría", "Coordenadas", "Precinto de seguridad").
MONEDA: Siempre en Bolivianos (Bs.).

DATOS CLAVE DE OPERACIÓN:
- Base de Operaciones: Av. Heroínas #560, Cochabamba, Bolivia.
- Horario de Recojo Almacén: Lunes a Sábado de 09:00 a 19:00 (Costo: Bs. 0 Gratis).
- Delivery Local: Cercado Cochabamba (Bs. 15, despacho motorizado en 45 a 90 minutos).
- Zonas Conurbadas: Quillacollo, Sacaba, Tiquipaya, Colcapirhua (Bs. 25).
- Envíos a Toda Bolivia: La Paz, Santa Cruz, Oruro, Potosí, Sucre, Tarija, Beni, Pando (Bs. 35 por encomienda de flota terrestre con precinto de seguridad numerado).

MODALIDAD DE PAGOS (QR SIMPLE BOLIVIA):
1. Pago 100% por QR Simple: Bonificación automática de un PACK DE STICKERS TÁCTICOS EXCLUSIVOS DE REGALO.
2. Pago Dividido 50/50: 50% de anticipo por QR para precintar el paquete y el 50% restante al recibir en mano.
3. Pago Contra Entrega en Efectivo: Al retirar directamente de Base Heroínas #560.

ARSENAL DISPONIBLE:
1. Plate Carrier Nivel IV (ID: prod-01) - Bs. 2,015.00: Cordura 1000D, sistema MOLLE, compatible con placas Stand-Alone NIJ IV.
2. Botas Tácticas Desert Storm Vibram (ID: prod-02) - Bs. 1,250.00: Suela Vibram antideslizante, membrana Gore-Tex impermeable 8". Tallas 39 a 44.
3. Mira Holográfica EOTech XPS3 (ID: prod-03) - Bs. 4,170.00: Retícula 68 MOA con 1 MOA dot, modo NVG visión nocturna, sumergible 10m.
4. Mochila Asalto 72h Assault Pack 45L (ID: prod-04) - Bs. 903.00: Cordura 1000D, compartimento de hidratación 3L, correas de compresión.
5. Guantes Oakley SI Assault (ID: prod-05) - Bs. 452.00: Nudillos de fibra de carbono, palma de cuero y refuerzo de Kevlar.
6. Cuchillo KA-BAR USMC Full Size (ID: prod-06) - Bs. 625.00: Hoja acero carbono 1095 Cro-Van 7 pulgadas, funda Kydex.

WHATSAPP DE ATENCIÓN HUMANA INMEDIATA: +591 71234567.
`;

export async function POST(req: Request) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
    const { messages, userQuery } = body;
    const query = (userQuery || (messages && messages[messages.length - 1]?.content) || '').toLowerCase();
    const geminiKey = getEnv('GEMINI_API_KEY');

    let reply = '';
    let quickActions: string[] = [];
    let suggestedProductIds: string[] = [];
    let isTracking = false;

    // Detect tracking queries
    const orderMatch = query.match(/ord-[a-z0-9]+/i);
    if (orderMatch || query.includes('rastrear') || query.includes('mi orden') || query.includes('donde esta mi pedido')) {
      isTracking = true;
      const orderCode = orderMatch ? orderMatch[0].toUpperCase() : 'ORD-LOCAL';
      reply = `📡 **TELEMETRÍA DE SEGUIMIENTO EN VIVO — ${orderCode}**\n\n- **Estado Actual:** 🟢 **PREPARADO Y PRECINTADO**\n- **Ubicación:** Centro Logístico Cochabamba (Base Heroínas #560).\n- **Asignación:** Unidad motorizada lista para despacho.\n- **Precinto de Seguridad:** STANAG-BOL-9921.\n\nPara coordinar entrega inmediata a tu domicilio o número de guía de flota, contacta a la central de despacho.`;
      quickActions = ['Ver en Mis Órdenes', 'Hablar por WhatsApp', 'Ver Catálogo'];
    }

    // If Google Gemini API key is configured and not a simple tracking query
    if (!isTracking && geminiKey && geminiKey.trim().length > 10) {
      try {
        // Build clean conversation history (avoid consecutive same-role messages)
        const rawHistory = (messages || []).slice(-6);
        const conversationHistory: { role: string; parts: { text: string }[] }[] = [];
        for (const m of rawHistory) {
          const role = m.sender === 'user' || m.role === 'user' ? 'user' : 'model';
          const text = m.text || m.content || '';
          if (!text.trim()) continue;
          // Skip if same role as last entry to prevent Gemini API errors
          if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role === role) continue;
          conversationHistory.push({ role, parts: [{ text }] });
        }

        // Use Gemini 3.6 Flash (fast conversational chat)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `${SYSTEM_TACTICAL_KNOWLEDGE}\n\nInstrucción para KILO-9: Responde a la siguiente consulta del operador de forma breve, estructurada y militar, recomendando productos si aplica:\n\n${query}`,
                    },
                  ],
                },
                ...conversationHistory,
              ],
              generationConfig: {
                maxOutputTokens: 600,
                temperature: 0.3,
              },
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            reply = replyText;
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`Gemini API returned ${response.status}:`, errData?.error?.message || 'Unknown error');
        }
      } catch (geminiError) {
        console.warn('Gemini API query error, using built-in reasoning engine:', geminiError);
      }
    }

    // Determine suggested products based on intent and AI response
    const fullText = `${query} ${reply}`.toLowerCase();
    if (fullText.includes('chaleco') || fullText.includes('plate') || fullText.includes('balist') || fullText.includes('placa')) {
      if (!suggestedProductIds.includes('prod-01')) suggestedProductIds.push('prod-01');
      if (!reply) {
        reply = `🛡️ **REPORTE BALÍSTICO — PLATE CARRIER NIVEL IV**\n\n- **Certificación:** Cumple norma NIJ 0101.06 Nivel IV (resiste munición perforante de fusil 7.62x51mm y .30-06 AP).\n- **Material:** Cordura 1000D balística de grado militar con corte láser y sistema MOLLE completo.\n- **Inversión Oficial:** **Bs. 2,015.00**.\n- **Disponibilidad Inmediata:** 15 unidades en almacén central de Cochabamba.`;
        quickActions = ['Añadir al Carrito', '¿Cómo es el envío?', 'Coordinar Talla por WhatsApp'];
      }
    }
    if (fullText.includes('bota') || fullText.includes('calzado') || fullText.includes('vibram') || fullText.includes('gore') || fullText.includes('desert storm')) {
      if (!suggestedProductIds.includes('prod-02')) suggestedProductIds.push('prod-02');
      if (!reply) {
        reply = `🥾 **FICHA TÁCTICA — BOTAS COMBATE DESERT STORM VIBRAM**\n\n- **Suela:** Vibram militar con dibujo autolimpiante de máxima tracción en roca, barro y asfalto.\n- **Impermeabilidad:** Membrana Gore-Tex 100% impermeable con evacuación de sudor.\n- **Puntera:** Refuerzo balístico de goma vulcanizada.\n- **Inversión Oficial:** **Bs. 1,250.00**.\n- **Tallas Disponibles:** 39, 40, 41, 42, 43, 44.`;
        quickActions = ['Añadir al Carrito', 'Consultar mi Talla', 'Pedir Delivery'];
      }
    }
    if (fullText.includes('mira') || fullText.includes('eotech') || fullText.includes('optica') || fullText.includes('punto rojo') || fullText.includes('xps3')) {
      if (!suggestedProductIds.includes('prod-03')) suggestedProductIds.push('prod-03');
      if (!reply) {
        reply = `🎯 **SISTEMA ÓPTICO — MIRA HOLOGRÁFICA EOTECH XPS3**\n\n- **Retícula:** Anillo de 68 MOA con punto central de 1 MOA para adquisición instantánea de blancos.\n- **Visión Nocturna:** 10 configuraciones compatibles con gafas NVG fósforo verde/blanco.\n- **Sellado:** Sumergible hasta 10 metros en agua.\n- **Inversión Oficial:** **Bs. 4,170.00**.\n- **Stock:** 8 unidades precintadas en maletín rígido MIL-SPEC.`;
        quickActions = ['Añadir al Carrito', 'Ficha Técnica Completa'];
      }
    }
    if (fullText.includes('mochila') || fullText.includes('assault') || fullText.includes('cordura') || fullText.includes('72h')) {
      if (!suggestedProductIds.includes('prod-04')) suggestedProductIds.push('prod-04');
      if (!reply) {
        reply = `🎒 **MOCHILA TÁCTICA 72H ASSAULT PACK (45L)**\n\n- **Construcción:** Cordura 1000D impenetrable con costuras triples de nylon reforzado.\n- **Modularidad:** Sistema MOLLE en frontal y laterales con correas de compresión YKK.\n- **Hidratación:** Compartimento térmico dedicado para bolsa de agua de 3 Litros.\n- **Inversión Oficial:** **Bs. 903.00**.`;
        quickActions = ['Añadir al Carrito', 'Ver Mochila en Catálogo'];
      }
    }
    if (fullText.includes('guante') || fullText.includes('oakley') || fullText.includes('nudillo')) {
      if (!suggestedProductIds.includes('prod-05')) suggestedProductIds.push('prod-05');
      if (!reply) {
        reply = `🧤 **GUANTES TÁCTICOS OAKLEY SI ASSAULT**\n\n- **Protección:** Placas articuladas de fibra de carbono moldeada en nudillos.\n- **Palma:** Cuero microventilado con refuerzos de Kevlar antideslizante.\n- **Inversión Oficial:** **Bs. 452.00**.\n- **Tallas:** M, L, XL disponibles en Negro y Coyote.`;
        quickActions = ['Añadir al Carrito', 'Consultar Tallas'];
      }
    }
    if (fullText.includes('cuchillo') || fullText.includes('kabar') || fullText.includes('hoja') || fullText.includes('arma blanca')) {
      if (!suggestedProductIds.includes('prod-06')) suggestedProductIds.push('prod-06');
      if (!reply) {
        reply = `⚔️ **CUCHILLO DE COMBATE KA-BAR USMC FULL SIZE**\n\n- **Acero:** 1095 Cro-Van tratado criogénicamente (56-58 HRC).\n- **Hoja:** 7 pulgadas con recubrimiento epóxico negro antirreflejo.\n- **Funda:** Incluye funda rígida Kydex de extracción rápida táctica.\n- **Inversión Oficial:** **Bs. 625.00**.`;
        quickActions = ['Añadir al Carrito', 'Ver Cuchillo'];
      }
    } else if (query.includes('envio') || query.includes('entrega') || query.includes('delivery') || query.includes('donde') || query.includes('cochabamba')) {
      if (!reply) {
        reply = `📍 **LOGÍSTICA DE DESPACHO Y COBERTURA TÁCTICA**\n\n1. **Base Almacén Heroínas (Cochabamba):** Av. Heroínas #560 (09:00 - 19:00) ➔ **Gratis (Bs. 0)**.\n2. **Delivery Cercado:** Envío exprés motorizado con precinto en 45 a 90 min ➔ **Bs. 15**.\n3. **Zona Conurbada (Sacaba, Quillacollo, Tiquipaya):** Despacho con chofer ➔ **Bs. 25**.\n4. **Envíos Nacionales (Toda Bolivia):** La Paz, Santa Cruz, Oruro, Potosí, Sucre, Tarija, Beni, Pando ➔ **Bs. 35** (encomienda de flota con guía de rastreo y precinto numerado).`;
        quickActions = ['Ver Zonas en Simulador', 'Pagar 50/50 con QR', 'Hablar con Despacho'];
      }
    } else if (query.includes('pago') || query.includes('qr') || query.includes('transferencia') || query.includes('regalo') || query.includes('50')) {
      if (!reply) {
        reply = `💳 **MODALIDADES DE PAGO EN BOLIVIA (BS.)**\n\n- **Abono 100% por QR Simple:** Te otorga de forma automática un **Pack de Stickers Tácticos Exclusivos de Regalo** dentro de tu paquete.\n- **Pago Dividido 50/50:** Pagas el 50% de anticipo por QR para precintar tu paquete y el 50% restante lo cancelas al recibir el producto.\n- **Contra Entrega en Efectivo:** Válido para retiro en persona en Base Heroínas #560.`;
        quickActions = ['Ver Regalo Táctico', 'Ir a la Tienda', 'Hablar por WhatsApp'];
      }
    } else if (!reply) {
      reply = `Afirmativo, operador. En **Tienda Táctica Cochabamba** equipamos a fuerzas especiales, cuerpos de seguridad y operadores civiles con equipamiento certificado MIL-SPEC.\n\n¿En qué misión logística o técnica te puedo asistir?\n- **Balística:** Chalecos Nivel IV y cascos tácticos.\n- **Calzado:** Botas Desert Storm con suela Vibram y Gore-Tex.\n- **Óptica:** Miras holográficas EOTech y accesorios NVG.\n- **Logística:** Retiro en Heroínas #560, delivery en Cercado o envíos a toda Bolivia.`;
      quickActions = ['Ver Chalecos Nivel IV', 'Ver Botas Vibram', 'Envíos en Cochabamba', 'Pago 50% QR'];
    }

    return NextResponse.json({
      reply,
      quickActions: quickActions.length > 0 ? quickActions : ['Ver Catálogo', 'Envíos Cochabamba', 'Hablar por WhatsApp'],
      suggestedProductIds,
      source: geminiKey ? 'gemini_ai' : 'tactical_engine',
    });
  } catch (error: any) {
    console.error('Error in tactical chat API:', error);
    return NextResponse.json({
      reply: 'Afirmativo operador, en Tienda Táctica Cochabamba estamos listos para asistirte. ¿Deseas consultar chalecos Nivel IV, botas Vibram, envíos locales o coordinar por WhatsApp (+591 71234567)?',
      quickActions: ['Ver Chalecos Nivel IV', 'Ver Botas Vibram', 'Envíos Cochabamba', 'Hablar por WhatsApp'],
      source: 'safe_fallback',
    });
  }
}
