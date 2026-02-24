/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { Send, CheckCheck, Phone, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STEPS, StepId, interpretAnswer } from './logic/conversation';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepId>('START');
  const [isFinished, setIsFinished] = useState(false);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showWhatsAppButton]);

  // Initial message
  useEffect(() => {
    const startChat = async () => {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      const initialMsg: Message = {
        role: 'model',
        text: STEPS['START'].message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMsg]);
      setIsTyping(false);
    };
    startChat();
  }, []);

  const handleSendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = inputValue.trim();
    if (!text || isFinished || isTyping) return;

    const userMsg: Message = {
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Lógica de interpretação
    setTimeout(async () => {
      const answer = interpretAnswer(currentStep, text);
      let nextStepId: StepId | undefined;
      let responseText = "";

      if (answer) {
        nextStepId = STEPS[currentStep].next?.[answer];
      } else {
        // Se não identificou, pede para escolher uma das opções
        responseText = "Desculpe, não entendi muito bem. 😊 Por favor, escolha uma das opções acima (A, B ou C) ou responda de forma mais clara.";
        nextStepId = currentStep; // Mantém no mesmo step
      }

      if (nextStepId) {
        setCurrentStep(nextStepId);
        const nextStep = STEPS[nextStepId];
        
        if (!responseText) {
          responseText = nextStep.message;
        }

        const botMsg: Message = {
          role: 'model',
          text: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, botMsg]);

        if (nextStepId === 'SUCCESS') {
          setShowWhatsAppButton(true);
          setIsFinished(true);
        } else if (nextStepId === 'END') {
          setIsFinished(true);
        }
      }

      setIsTyping(false);
    }, 1000);
  };

  const WHATSAPP_URL = "https://wa.me/5511994760149?text=Oi%20William,%20acabei%20de%20passar%20pela%20triagem%20e%20quero%20saber%20como%20come%C3%A7ar";

  return (
    <div className="flex flex-col h-screen bg-[#E5DDD5] font-sans text-[#111b21]">
      {/* Header */}
      <header className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden border border-white/20">
            <img 
              src="https://picsum.photos/seed/william/100/100" 
              alt="William" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="font-semibold text-base leading-tight">William</h1>
            <p className="text-xs text-white/80">online</p>
          </div>
        </div>
        <div className="flex items-center gap-5 opacity-90">
          <Video size={20} className="cursor-pointer" />
          <Phone size={18} className="cursor-pointer" />
          <MoreVertical size={20} className="cursor-pointer" />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-lg shadow-sm relative group ${
                    msg.role === 'user' 
                      ? 'bg-[#DCF8C6] rounded-tr-none' 
                      : 'bg-white rounded-tl-none'
                  }`}
                >
                  <p className="text-[14.5px] whitespace-pre-wrap break-words pr-12">
                    {msg.text}
                  </p>
                  <div className="absolute bottom-1 right-2 flex items-center gap-1">
                    <span className="text-[10px] text-gray-500 uppercase">{msg.timestamp}</span>
                    {msg.role === 'user' && (
                      <CheckCheck size={14} className="text-blue-500" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {showWhatsAppButton && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center py-4"
            >
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:bg-[#128C7E] transition-all active:scale-95"
              >
                <Phone size={20} fill="white" />
                Falar com o William no WhatsApp
              </a>
            </motion.div>
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-[#f0f2f5] p-2 flex items-center gap-2 border-t border-gray-200">
        <div className="flex gap-3 px-2 text-gray-500">
          <Smile size={24} className="cursor-pointer" />
          <Paperclip size={24} className="cursor-pointer" />
        </div>
        <form 
          onSubmit={handleSendMessage}
          className="flex-1 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isFinished || isTyping}
            placeholder={isFinished ? "Conversa encerrada" : "Digite uma mensagem"}
            className="flex-1 bg-white border-none rounded-full px-4 py-2.5 text-sm focus:outline-none shadow-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isFinished || isTyping}
            className={`p-2.5 rounded-full flex items-center justify-center transition-colors ${
              !inputValue.trim() || isFinished || isTyping
                ? 'bg-gray-300 text-gray-500'
                : 'bg-[#128C7E] text-white active:bg-[#075E54]'
            }`}
          >
            <Send size={20} className={inputValue.trim() ? 'ml-0.5' : ''} />
          </button>
        </form>
      </footer>
    </div>
  );
}
