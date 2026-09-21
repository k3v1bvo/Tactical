'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, X, Shield, Sparkles, Phone, ChevronDown, Trash2, Volume2, VolumeX } from 'lucide-react';
import { tacticalAudio } from '@/lib/tactical-audio';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  quickActions?: string[];
}

export function TacticalAIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-01',
      sender: 'assistant',
      text: 'Operador en línea. Soy **KILO-9**, la IA táctica del centro de comando en Cochabamba.\n\n¿En qué misión logística o equipamiento balístico requieres asesoramiento inmediato?',
      timestamp: '09:00',
      quickActions: ['Chaleco Nivel IV', 'Envíos en Cochabamba', 'Pago 50/50 y Regalo QR', '¿Dónde queda la tienda?'],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    if (soundEnabled) tacticalAudio.playBlip();

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: query,
          messages: [...messages, userMessage],
        }),
      });

      const data = await res.json();

      if (soundEnabled) tacticalAudio.playSuccess();

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Operador, informe recibido. Consulta registrada.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: data.quickActions || [],
      };

      setMessages(prev => [...prev, botMessage]);
      if (!isOpen) setHasUnread(true);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Enlace táctico interrumpido. Puedes contactar directamente con el comando central por WhatsApp al **+591 71234567**.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: ['Hablar por WhatsApp'],
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    if (action.includes('WhatsApp')) {
      window.open('https://wa.me/59171234567?text=Hola%20Tienda%20T%C3%A1ctica,%20necesito%20asesoramiento%20con%20un%20pedido', '_blank');
      return;
    }
    if (action.includes('Catálogo')) {
      window.location.href = '/#catalogo';
      setIsOpen(false);
      return;
    }
    handleSendMessage(action);
  };

  const resetChat = () => {
    if (soundEnabled) tacticalAudio.playBlip();
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Terminal reiniciado. Frecuencia segura establecida. ¿Qué equipamiento o despacho deseas consultar?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: ['Chalecos Balísticos', 'Botas Vibram', 'Envíos Nacionales', 'Pago 50% QR'],
      },
    ]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* TRIGGER BUTTON (WHEN CLOSED) */}
      {!isOpen && (
        <button
          onClick={() => {
            if (soundEnabled) tacticalAudio.playLockOn();
            setIsOpen(true);
          }}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-[#0B0B0F]/95 border border-[#C8A961]/40 text-[#DEC07A] shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_20px_rgba(200,169,97,0.25)] hover:border-[#C8A961] hover:scale-105 transition-all duration-300 backdrop-blur-xl"
        >
          {/* Radar pulsing ring */}
          <span className="absolute -inset-1 rounded-full bg-[#C8A961]/20 animate-ping opacity-40 pointer-events-none" />

          {/* Hologram icon */}
          <div className="w-8 h-8 rounded-full bg-[#C8A961]/15 border border-[#C8A961]/40 flex items-center justify-center text-[#C8A961] shadow-inner">
            <Bot size={18} className="animate-pulse" />
          </div>

          <div className="text-left">
            <div className="text-[9px] font-mono tracking-widest text-[#C8A961] font-bold uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#30A46C] animate-pulse" />
              IA TÁCTICA ONLINE
            </div>
            <div className="text-xs font-extrabold text-white tracking-wide">
              OPERADOR KILO-9
            </div>
          </div>

          {hasUnread && (
            <span className="w-3 h-3 rounded-full bg-[#E5484D] border-2 border-[#0B0B0F]" />
          )}
        </button>
      )}

      {/* CHAT WINDOW (WHEN OPEN) */}
      {isOpen && (
        <div
          className="w-[370px] sm:w-[410px] h-[550px] max-h-[85vh] rounded-3xl border border-[#C8A961]/35 bg-[#08080C]/95 backdrop-blur-2xl shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_40px_rgba(200,169,97,0.15)] flex flex-col overflow-hidden animate-fade-in-up"
        >
          {/* TOP HEADER */}
          <div className="px-5 py-4 border-b border-[#22222A] bg-gradient-to-r from-[#121218] to-[#0A0A0E] flex items-center justify-between relative">
            {/* Top gold accent line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#C8A961] to-transparent" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C8A961]/15 border border-[#C8A961]/40 flex items-center justify-center text-[#C8A961]">
                <Shield size={18} />
              </div>
              <div>
                <div className="text-[9px] font-mono tracking-widest text-[#C8A961] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#30A46C] animate-pulse" />
                  KILO-9 · BASE HEROÍNAS #560
                </div>
                <h4 className="text-sm font-extrabold text-white tracking-tight">
                  CENTRO DE ASISTENCIA TÁCTICA
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Silenciar sonidos tácticos' : 'Activar sonidos'}
                className="p-1.5 rounded-lg text-[#7A7A85] hover:text-[#DEC07A] hover:bg-[#1A1A22] transition-colors"
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
              <button
                onClick={resetChat}
                title="Reiniciar conversación"
                className="p-1.5 rounded-lg text-[#7A7A85] hover:text-[#E5484D] hover:bg-[#1A1A22] transition-colors"
              >
                <Trash2 size={15} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[#7A7A85] hover:text-white hover:bg-[#1A1A22] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* TELEMETRY SUB-BANNER */}
          <div className="px-5 py-1.5 bg-[#0D0D12] border-b border-[#1A1A22] flex items-center justify-between text-[9px] font-mono text-[#7A7A85]">
            <span>CANAL: 142.85 MHz ENCRIPTADO</span>
            <span className="text-[#30A46C]">TIEMPO REAL · CBBA</span>
          </div>

          {/* MESSAGES LIST */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm font-sans custom-scrollbar">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#5E5E68] mb-1 px-1">
                  <span>{msg.sender === 'user' ? 'TÚ (OPERADOR)' : 'KILO-9 (IA)'}</span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-[#DEC07A] text-black font-semibold rounded-tr-sm shadow-[0_4px_15px_rgba(222,192,122,0.2)]'
                      : 'bg-[#121218] border border-[#22222A] text-[#F5F5F7] rounded-tl-sm shadow-md'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Quick Action Chips from Bot */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5 max-w-[90%]">
                    {msg.quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(action)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#1A1A22] border border-[#C8A961]/30 text-[#DEC07A] hover:bg-[#C8A961] hover:text-black transition-all duration-200 flex items-center gap-1"
                      >
                        <Sparkles size={10} />
                        {action}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#C8A961] p-3 rounded-xl bg-[#121218] border border-[#22222A] w-fit">
                <span className="w-2 h-2 rounded-full bg-[#C8A961] animate-ping" />
                <span>Analizando telemetría y especificaciones...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ESCALATION TO HUMAN WHATSAPP BAR */}
          <div className="px-4 py-2 bg-[#0B0B0F] border-t border-[#1A1A22] flex items-center justify-between text-[11px]">
            <span className="text-[#7A7A85] text-[10px]">¿Deseas hablar con un asesor humano?</span>
            <a
              href="https://wa.me/59171234567?text=Hola%20Tienda%20T%C3%A1ctica,%20deseo%20asesoramiento%20personalizado"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#30A46C] hover:text-white font-mono font-bold transition-colors"
            >
              <Phone size={11} />
              WhatsApp Directo
            </a>
          </div>

          {/* INPUT BAR */}
          <div className="p-3 bg-[#08080C] border-t border-[#22222A]">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre botas, chalecos, envíos, pagos..."
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#121218] border border-[#22222A] focus:border-[#C8A961] text-xs text-white placeholder-[#5E5E68] outline-none transition-colors"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 rounded-lg bg-[#C8A961] text-black hover:bg-[#DEC07A] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
