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

ARSENAL DISPONIBLE (PRECIOS OFICIALES EN BS.):
1. Plate Carrier Nivel IV Multicam (ID: prod-01) - Bs. 340.00: Cordura 1000D, sistema MOLLE láser, compatible con placas Stand-Alone NIJ IV.
2. Botas Tácticas Desert Storm Vibram (ID: prod-02) - Bs. 310.00: Suela Vibram antideslizante, membrana Gore-Tex impermeable 8". Tallas 39 a 44.
3. Mira Holográfica EOTech XPS3 (ID: prod-03) - Bs. 380.00: Retícula 68 MOA con 1 MOA dot, modo NVG visión nocturna, sumergible 10m.
4. Mochila Asalto 45L MOLLE Assault Pack (ID: prod-04) - Bs. 220.00: Cordura 1000D, compartimento de hidratación 3L, correas de compresión.
5. Guantes Tácticos con Nudillos de Carbono (ID: prod-05) - Bs. 120.00: Nudillos de fibra de carbono, palma antideslizante Kevlar, touch screen.
6. Cuchillo Táctico de Supervivencia KA-BAR (ID: prod-06) - Bs. 150.00: Hoja acero carbono 1095 Cro-Van 7", funda Kydex rígida.
7. Radio Táctico Baofeng UV-5R Militar (ID: prod-07) - Bs. 150.00: Dual band VHF/UHF, 128 canales, auricular acústico táctico.
8. Pantalón Cargo Táctico Ripstop (ID: prod-08) - Bs. 200.00: Tela ripstop antidesgarro, 10 bolsillos reforzados, compartimento rodilleras.
9. Polera Táctica Combat Shirt Ripstop (ID: prod-09) - Bs. 145.00: Torso transpirable para chaleco, mangas ripstop con bolsillos y velcro.
10. Reloj Militar Digital G-Shock Impermeable 200M (ID: prod-10) - Bs. 180.00: Resistencia extrema a golpes, 20 BAR, luz LED electroluminiscente.
11. Lentes Balísticos Tácticos UV400 (ID: prod-11) - Bs. 115.00: Marco envolvente balístico con 3 micas intercambiables y estuche rígido.
12. Morral Táctico Bandolera Cruzado MOLLE (ID: prod-12) - Bs. 130.00: Pechera urbana EDC, ambidiestro, compartimento secreto de extracción rápida.
13. Casco Táctico FAST Militar con Rieles NVG (ID: prod-13) - Bs. 250.00: Rieles laterales ARC, montura frontal NVG, dial de ajuste de nuca.
14. Kit de Rodilleras y Coderas de Impacto (ID: prod-14) - Bs. 105.00: Carcasa de polímero TPU curvado de alto impacto y espuma EVA.
15. Funda Táctica Portapistola Holster Universal (ID: prod-15) - Bs. 100.00: Retención activa por dedo índice, desenfunde rápido en 0.3s, rotación 360°.
16. Chaleco Táctico Ligero MOLLE Modular (ID: prod-16) - Bs. 190.00: Malla transpirable, triple pouch para cargadores y velcro.

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
    const { messages, userQuery, userContext, inventory } = body;
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

      // Try to find the order in user context
      let orderDetail = '';
      if (userContext?.orders && Array.isArray(userContext.orders)) {
        const found = userContext.orders.find((o: any) => o.id?.toUpperCase() === orderCode);
        if (found) {
          const statusMap: Record<string, string> = {
            pending: '⏳ Pendiente de pago',
            paid: '✅ Pagado — En espera de preparación',
            preparing: '📦 En preparación en almacén',
            ready: '🟢 Preparado y listo para despacho',
            assigned: '🛵 Repartidor asignado',
            picked_up: '📬 Recogido por motorizado',
            in_transit: '🚀 EN CAMINO a tu ubicación',
            delivered: '✅ ENTREGADO con éxito',
            cancelled: '❌ Cancelado',
          };
          orderDetail = `\nEstado: ${statusMap[found.status] || found.status}\nTotal: Bs. ${found.total}\nModalidad: ${found.payment_mode}`;
        }
      }

      reply = `📡 TELEMETRÍA DE SEGUIMIENTO EN VIVO — ${orderCode}
${orderDetail || '\nEstado Actual: 🟢 PREPARADO Y PRECINTADO\nUbicación: Centro Logístico Cochabamba (Base Heroínas #560).\nAsignación: Unidad motorizada lista para despacho.'}

Para coordinar entrega inmediata a tu domicilio o número de guía de flota, contacta a la central de despacho.`;
      quickActions = ['Ver en Mis Órdenes', 'Hablar por WhatsApp', 'Ver Catálogo'];
    }

    // Build dynamic context for Gemini
    let dynamicContext = '';
    if (userContext) {
      dynamicContext += `\n\nUSUARIO ACTUAL EN SESIÓN:\n- Nombre: ${userContext.name}\n- Correo: ${userContext.email}\n- Rol: ${userContext.role}\n- Total de pedidos: ${userContext.totalOrders}`;
      if (userContext.orders && userContext.orders.length > 0) {
        dynamicContext += '\n- Sus pedidos recientes:';
        for (const o of userContext.orders.slice(0, 5)) {
          dynamicContext += `\n  • ${o.id} — Estado: ${o.status} — Total: Bs. ${o.total} — Fecha: ${o.date}`;
        }
      }
    }
    if (inventory && Array.isArray(inventory) && inventory.length > 0) {
      dynamicContext += '\n\nINVENTARIO REAL EN VIVO (stock actual de la tienda):';
      for (const p of inventory) {
        dynamicContext += `\n- ${p.name} (ID: ${p.id}) — Bs. ${p.price} — Stock: ${p.stock} unidades`;
      }
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

        // Use Gemini 2.0 Flash (fast conversational chat)
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: SYSTEM_TACTICAL_KNOWLEDGE + dynamicContext + '\n\nFORMATO: Responde SIEMPRE en texto limpio. NO uses markdown, NO uses asteriscos (**), NO uses guiones como listas. Usa emojis para resaltar secciones. Sé breve, militar y directo. Si el usuario pregunta por sus pedidos o stock, usa los datos de INVENTARIO REAL y USUARIO ACTUAL para responder con información precisa.' }]
              },
              contents: [
                ...conversationHistory,
                {
                  role: 'user',
                  parts: [{ text: query }],
                },
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
      if (!suggestedProductIds.includes('prod-16')) suggestedProductIds.push('prod-16');
      if (!reply) {
        reply = `🛡️ REPORTE BALÍSTICO — PLATE CARRIER NIVEL IV

- Certificación: Cumple norma NIJ 0101.06 Nivel IV (resiste munición perforante de fusil 7.62x51mm).
- Material: Cordura 1000D balística con corte láser y sistema MOLLE completo.
- Inversión Oficial: Bs. 340.00.
- Disponibilidad: En almacén central Cochabamba.`;
        quickActions = ['Añadir al Carrito', '¿Cómo es el envío?', 'Coordinar por WhatsApp'];
      }
    }
    if (fullText.includes('bota') || fullText.includes('calzado') || fullText.includes('vibram') || fullText.includes('gore') || fullText.includes('desert storm')) {
      if (!suggestedProductIds.includes('prod-02')) suggestedProductIds.push('prod-02');
      if (!reply) {
        reply = `🥾 FICHA TÁCTICA — BOTAS COMBATE DESERT STORM VIBRAM

- Suela: Tipo Vibram militar con tracción de alta adherencia.
- Impermeabilidad: Membrana impermeable con evacuación de sudor.
- Puntera: Refuerzo balístico de goma vulcanizada.
- Inversión Oficial: Bs. 310.00.
- Tallas Disponibles: 39, 40, 41, 42, 43, 44.`;
        quickActions = ['Añadir al Carrito', 'Consultar mi Talla', 'Pedir Delivery'];
      }
    }
    if (fullText.includes('mira') || fullText.includes('eotech') || fullText.includes('optica') || fullText.includes('punto rojo') || fullText.includes('xps3')) {
      if (!suggestedProductIds.includes('prod-03')) suggestedProductIds.push('prod-03');
      if (!reply) {
        reply = `🎯 SISTEMA ÓPTICO — MIRA HOLOGRÁFICA EOTECH XPS3

- Retícula: Anillo de 68 MOA con punto de 1 MOA.
- Visión Nocturna: Compatible con gafas NVG.
- Sellado: Sumergible hasta 10 metros en agua.
- Inversión Oficial: Bs. 380.00.
- Stock: Disponible en almacén Cochabamba.`;
        quickActions = ['Añadir al Carrito', 'Ficha Técnica'];
      }
    }
    if (fullText.includes('mochila') || fullText.includes('assault') || fullText.includes('cordura') || fullText.includes('45l')) {
      if (!suggestedProductIds.includes('prod-04')) suggestedProductIds.push('prod-04');
      if (!reply) {
        reply = `🎒 MOCHILA TÁCTICA MILITAR 45L MOLLE ASSAULT PACK

- Construcción: Cordura 1000D con costuras reforzadas.
- Modularidad: Sistema MOLLE frontal y lateral.
- Hidratación: Compartimento para bolsa de agua de 3L.
- Inversión Oficial: Bs. 220.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Mochila en Catálogo'];
      }
    }
    if (fullText.includes('guante') || fullText.includes('nudillo') || fullText.includes('carbono')) {
      if (!suggestedProductIds.includes('prod-05')) suggestedProductIds.push('prod-05');
      if (!reply) {
        reply = `🧤 GUANTES TÁCTICOS CON NUDILLOS DE CARBONO

- Protección: Placas articuladas de fibra de carbono en nudillos.
- Palma: Refuerzos de Kevlar antideslizante con puntas táctiles touch screen.
- Inversión Oficial: Bs. 120.00.
- Tallas: M, L, XL disponibles.`;
        quickActions = ['Añadir al Carrito', 'Consultar Tallas'];
      }
    }
    if (fullText.includes('cuchillo') || fullText.includes('kabar') || fullText.includes('hoja') || fullText.includes('supervivencia')) {
      if (!suggestedProductIds.includes('prod-06')) suggestedProductIds.push('prod-06');
      if (!reply) {
        reply = `⚔️ CUCHILLO DE COMBATE KA-BAR MILITAR

- Acero: 1095 Cro-Van de 7 pulgadas enterizo.
- Recubrimiento: Epoxi negro mate antirreflejo.
- Funda: Rígida táctica Kydex de extracción rápida.
- Inversión Oficial: Bs. 150.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Cuchillo'];
      }
    }
    if (fullText.includes('pantalon') || fullText.includes('pantalones') || fullText.includes('cargo') || fullText.includes('ripstop')) {
      if (!suggestedProductIds.includes('prod-08')) suggestedProductIds.push('prod-08');
      if (!reply) {
        reply = `👖 PANTALÓN CARGO TÁCTICO RIPSTOP ANTIDESGARRO

- Tejido: Ripstop militar repelente al agua y manchas.
- Capacidad: 10 bolsillos tácticos reforzados y compartimentos para rodilleras.
- Inversión Oficial: Bs. 200.00.
- Tallas: 30, 32, 34, 36, 38 en Verde Ranger, Negro y Coyote.`;
        quickActions = ['Añadir al Carrito', 'Consultar Talla'];
      }
    }
    if (fullText.includes('polera') || fullText.includes('poleras') || fullText.includes('combat shirt') || fullText.includes('camisa')) {
      if (!suggestedProductIds.includes('prod-09')) suggestedProductIds.push('prod-09');
      if (!reply) {
        reply = `👕 POLERA TÁCTICA COMBAT SHIRT RIPSTOP

- Torso: Algodón transpirable de secado rápido ideal para uso bajo chaleco.
- Mangas: Tejido Ripstop antidesgarro con bolsillos de hombro y velcro.
- Inversión Oficial: Bs. 145.00.
- Tallas: S, M, L, XL.`;
        quickActions = ['Añadir al Carrito', 'Ver Polera'];
      }
    }
    if (fullText.includes('reloj') || fullText.includes('relojes') || fullText.includes('g-shock') || fullText.includes('casio')) {
      if (!suggestedProductIds.includes('prod-10')) suggestedProductIds.push('prod-10');
      if (!reply) {
        reply = `⌚ RELOJ MILITAR TÁCTICO DIGITAL G-SHOCK IMPERMEABLE

- Resistencia: Sumergible 200M (20 BAR) y blindado contra impactos severos.
- Funciones: Luz electroluminiscente, cronómetro 1/100s, alarma y cristal mineral.
- Inversión Oficial: Bs. 180.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Reloj'];
      }
    }
    if (fullText.includes('lente') || fullText.includes('lentes') || fullText.includes('gafas') || fullText.includes('balistico')) {
      if (!suggestedProductIds.includes('prod-11')) suggestedProductIds.push('prod-11');
      if (!reply) {
        reply = `🕶️ LENTES BALÍSTICOS TÁCTICOS UV400 (3 CRISTALES)

- Protección: Norma balística contra fragmentos e impactos de alta velocidad.
- Accesorios: 3 micas intercambiables (polarizada, amarilla nocturna, clara) y funda rígida.
- Inversión Oficial: Bs. 115.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Lentes'];
      }
    }
    if (fullText.includes('morral') || fullText.includes('morrales') || fullText.includes('pechera') || fullText.includes('bandolera')) {
      if (!suggestedProductIds.includes('prod-12')) suggestedProductIds.push('prod-12');
      if (!reply) {
        reply = `🎒 MORRAL TÁCTICO BANDOLERA CRUZADO MOLLE (PECHERA)

- Porte: Correa acolchada ambidiestra con enganche de liberación rápida.
- Seguridad: Bolsillo posterior oculto para extracción rápida de arma o celular.
- Inversión Oficial: Bs. 130.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Morral'];
      }
    }
    if (fullText.includes('casco') || fullText.includes('cascos') || fullText.includes('fast')) {
      if (!suggestedProductIds.includes('prod-13')) suggestedProductIds.push('prod-13');
      if (!reply) {
        reply = `🪖 CASCO TÁCTICO FAST MILITAR CON RIELES Y MONTURA NVG

- Equipamiento: Rieles laterales ARC para accesorios y montura delantera NVG.
- Ajuste: Sistema de rueda dial occipital ergonómico.
- Inversión Oficial: Bs. 250.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Casco'];
      }
    }
    if (fullText.includes('rodillera') || fullText.includes('rodilleras') || fullText.includes('codera')) {
      if (!suggestedProductIds.includes('prod-14')) suggestedProductIds.push('prod-14');
      if (!reply) {
        reply = `🛡️ KIT DE RODILLERAS Y CODERAS TÁCTICAS DE IMPACTO

- Protección: Carcasa rígida en TPU articulado con interior de espuma EVA absorbente.
- Contenido: Set de 2 rodilleras + 2 coderas con ajuste elástico de velcro.
- Inversión Oficial: Bs. 105.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Kit'];
      }
    }
    if (fullText.includes('portapistola') || fullText.includes('portapistolas') || fullText.includes('funda') || fullText.includes('holster')) {
      if (!suggestedProductIds.includes('prod-15')) suggestedProductIds.push('prod-15');
      if (!reply) {
        reply = `🔫 FUNDA TÁCTICA PORTAPISTOLA UNIVERSAL (HOLSTER)

- Retención: Sistema activo de liberación con dedo índice para desenfunde en 0.3s.
- Compatibilidad: Glock, Taurus, Bersa, Beretta, CZ. Rotación 360° para cinto o chaleco.
- Inversión Oficial: Bs. 100.00.`;
        quickActions = ['Añadir al Carrito', 'Ver Holster'];
      }
    } else if (query.includes('envio') || query.includes('entrega') || query.includes('delivery') || query.includes('donde') || query.includes('cochabamba')) {
      if (!reply) {
        reply = `📍 LOGÍSTICA DE DESPACHO Y COBERTURA TÁCTICA

1. Base Almacén Heroínas (Cochabamba): Av. Heroínas #560 (09:00 - 19:00) ➔ Gratis (Bs. 0).
2. Delivery Cercado: Envío exprés motorizado con precinto en 45 a 90 min ➔ Bs. 15.
3. Zona Conurbada (Sacaba, Quillacollo, Tiquipaya): Despacho motorizado ➔ Bs. 25.
4. Envíos Nacionales (Toda Bolivia): La Paz, Santa Cruz, Oruro, Potosí, Sucre, Tarija, Beni, Pando ➔ Bs. 35 (flota con guía de rastreo y precinto numerado).`;
        quickActions = ['Ver Zonas en Simulador', 'Pagar 50/50 con QR', 'Hablar con Despacho'];
      }
    } else if (query.includes('pago') || query.includes('qr') || query.includes('transferencia') || query.includes('regalo') || query.includes('50')) {
      if (!reply) {
        reply = `💳 MODALIDADES DE PAGO EN BOLIVIA (BS.)

- Abono 100% por QR Simple: Te otorga de forma automática un Pack de Stickers Tácticos Exclusivos de Regalo dentro de tu paquete.
- Pago Dividido 50/50: Pagas el 50% de anticipo por QR para precintar tu paquete y el 50% restante lo cancelas al recibir el producto.
- Contra Entrega en Efectivo: Válido para retiro en persona en Base Heroínas #560.`;
        quickActions = ['Ver Regalo Táctico', 'Ir a la Tienda', 'Hablar por WhatsApp'];
      }
    } else if (!reply) {
      reply = `Afirmativo, operador. En Tienda Táctica Cochabamba equipamos a fuerzas especiales, cuerpos de seguridad y operadores civiles con equipamiento certificado.

Tenemos disponible en almacén:
- Chalecos porta-placas y cascos FAST
- Botas tácticas militares Desert Storm
- Guantes tácticos con nudillos de carbono
- Pantalones cargo ripstop y poleras de combate
- Relojes militares G-Shock impermeables
- Cuchillos tácticos KA-BAR y lentes balísticos UV400
- Mochilas 45L y morrales pechera bandolera MOLLE
- Rodilleras de impacto y fundas portapistolas

Retiro en Base Heroínas #560, delivery en Cercado o envíos a toda Bolivia.`;
      quickActions = ['Ver Chalecos', 'Ver Botas', 'Ver Mochilas', 'Pago 50% QR'];
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
