"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, ChevronDown, Loader2, AlertTriangle, Check, Trash2, Edit } from 'lucide-react';
import { sendMessageToAI } from '@/lib/ai/pollinations';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';

export default function AICopilot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Ciao! Sono Baraka Core. Sistema online. 🤖' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null); // { type: 'delete'|'update', resource, id, data, description }
    const messagesEndRef = useRef(null);
    const router = useRouter();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    useEffect(() => {
        const handleAICommand = (event) => {
            const { command } = event.detail;
            if (command) {
                setIsOpen(true);
                handleSend(command);
            }
        };

        window.addEventListener('baraka-ai-command', handleAICommand);
        return () => window.removeEventListener('baraka-ai-command', handleAICommand);
    }, []);

    const handleSend = async (text = null) => {
        const messageText = typeof text === 'string' ? text : input;
        if (!messageText.trim() || isLoading) return;

        const userMessage = { role: 'user', content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepare context for the API call (excluding the initial greeting)
            const apiMessages = messages.slice(1).concat(userMessage);

            const responseText = await sendMessageToAI(apiMessages);

            // Check for tool commands immediately
            const executed = await handleToolCommand(responseText);

            // If a tool was executed, we might want to show a different message or just the response
            // For now, show the response (cleaned of the command if possible, or just as is)
            // Ideally, the AI should output a user-friendly message AND the command.

            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Errore di sistema. Riprova." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleToolCommand = async (content) => {
        // Regex to find [TOOL: name, args]
        const toolMatch = content.match(/\[TOOL: (.*?)\]/);
        if (toolMatch && toolMatch[1]) {
            const commandString = toolMatch[1];
            // Split by first comma to separate command name from args
            const firstCommaIndex = commandString.indexOf(',');
            let commandName = commandString;
            let argsString = '';

            if (firstCommaIndex !== -1) {
                commandName = commandString.substring(0, firstCommaIndex).trim();
                argsString = commandString.substring(firstCommaIndex + 1).trim();
            }

            const args = {};
            // Simple CSV parser that respects quotes might be needed, but for now simple split
            // This is a basic parser, might fail on complex JSON in args
            // Improved parser for args:
            const argParts = argsString.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split by comma only if not inside quotes

            argParts.forEach(part => {
                const [key, ...valueParts] = part.split('=');
                if (key) {
                    let value = valueParts.join('=').trim();
                    // Remove quotes if present
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    args[key.trim()] = value;
                }
            });

            switch (commandName) {
                case 'navigate':
                    if (args.path) {
                        router.push(args.path);
                        // setIsOpen(false); // Keep open
                    }
                    break;
                case 'search_client':
                    if (args.query) {
                        router.push(`/admin/customers?search=${encodeURIComponent(args.query)}`);
                        // setIsOpen(false);
                    }
                    break;
                case 'draft_offer':
                    const queryParams = new URLSearchParams();
                    if (args.title) queryParams.set('title', args.title);
                    if (args.type) queryParams.set('type', args.type);
                    if (args.value) queryParams.set('value', args.value);
                    queryParams.set('create', 'true');

                    router.push(`/admin/offers?${queryParams.toString()}`);
                    // setIsOpen(false);
                    break;
                case 'draft_campaign':
                    if (args.filter) {
                        router.push(`/admin/campaigns?create=true&ai_filter=${encodeURIComponent(args.filter)}`);
                        // setIsOpen(false);
                    }
                    break;
                case 'read_resource':
                    // Simulate fetching data (in a real app, call API)
                    // For now, we'll just say "I found it" to simulate the flow or try to fetch if possible
                    // Since we can't easily fetch from client without an endpoint that supports search by name for all resources...
                    // We will cheat slightly: The AI asks to read, we redirect the user to the search page?
                    // No, the prompt says "Use this BEFORE deleting".
                    // Let's implement a basic fetch for customers.
                    if (args.resource === 'customers' && args.query) {
                        try {
                            const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(args.query)}`);
                            const data = await res.json();
                            const found = data.customers?.[0];
                            if (found) {
                                // Send hidden system message back to AI
                                const systemMsg = { role: 'system', content: `Data Retrieved: Found Customer ${found.first_name} ${found.last_name} (ID: ${found.id}).` };
                                setMessages(prev => [...prev, systemMsg]);
                                // Trigger AI to continue
                                const responseText = await sendMessageToAI([...messages, systemMsg]);
                                setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
                                handleToolCommand(responseText); // Recursive call for the next action
                                return true;
                            } else {
                                setMessages(prev => [...prev, { role: 'system', content: "System: No customer found." }]);
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    } else if (args.resource === 'reviews') {
                        // For reviews, we might not have a search query, or it might be "last 2".
                        // The AI might just ask to read reviews to get IDs.
                        try {
                            // Fetch recent reviews
                            const res = await fetch(`/api/admin/reviews?limit=5`);
                            const data = await res.json();
                            // If query is present, maybe filter client side or just return the list
                            const reviews = data.reviews || [];
                            const reviewsList = reviews.map(r => `ID: ${r.id} - User: ${r.reviewer_name} - Rating: ${r.rating}`).join('\n');

                            const systemMsg = { role: 'system', content: `Data Retrieved (Recent Reviews):\n${reviewsList}` };
                            setMessages(prev => [...prev, systemMsg]);

                            const responseText = await sendMessageToAI([...messages, systemMsg]);
                            setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
                            handleToolCommand(responseText);
                            return true;
                        } catch (e) {
                            console.error(e);
                            setMessages(prev => [...prev, { role: 'system', content: "System: Error fetching reviews." }]);
                        }
                    }
                    break;
                case 'delete_resource':
                case 'update_resource':
                    setConfirmModal({
                        type: commandName === 'delete_resource' ? 'delete' : 'update',
                        resource: args.resource,
                        id: args.id,
                        data: args.data ? JSON.parse(args.data) : null,
                        description: args.description || 'Perform this action?'
                    });
                    break;
                default:
                    console.warn("Unknown tool command:", commandName);
            }
            return true; // Command executed
        }
        return false; // No command found
    };

    const executeAction = async () => {
        if (!confirmModal) return;

        setIsLoading(true);
        try {
            const { resource, id, type, data } = confirmModal;
            let url = `/api/admin/${resource}/${id}`;
            let method = type === 'delete' ? 'DELETE' : 'PUT';
            let body = data ? JSON.stringify(data) : null;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body
            });

            if (res.ok) {
                setMessages(prev => [...prev, { role: 'system', content: `✅ Action Executed: ${confirmModal.description}` }]);
                // Refresh page to show changes
                router.refresh();
            } else {
                const err = await res.json();
                setMessages(prev => [...prev, { role: 'system', content: `❌ Error: ${err.error || 'Action failed'}` }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: `❌ System Error: ${error.message}` }]);
        } finally {
            setIsLoading(false);
            setConfirmModal(null);
        }
    };

    const suggestions = [
        "Analizza i clienti",
        "Suggerisci un'offerta",
        "Crea campagna WhatsApp",
        "Idee marketing Natale"
    ];

    return (
        <>
            {/* Floating Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-red-600 to-orange-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-red-500/30 transition-shadow border border-red-500"
            >
                {isOpen ? <ChevronDown size={28} /> : <Bot size={28} className="text-white" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-sm" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-red-600 to-orange-600 text-white flex justify-between items-center border-b border-red-700">
                            <div className="flex items-center gap-3">
                                <div className="relative w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                                    <Bot size={24} className="text-white" />
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute inset-0 rounded-full bg-white/20"
                                    />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg font-mono tracking-tight text-white">Baraka Core</h3>
                                    <p className="text-[10px] text-red-100 flex items-center gap-1 font-mono uppercase tracking-wider">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                                        System Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className="flex flex-col gap-2 max-w-[85%]">
                                        <div
                                            className={`p-3 rounded-2xl ${msg.role === 'user'
                                                ? 'bg-red-600 text-white rounded-tr-none shadow-lg shadow-red-500/20'
                                                : 'bg-white border border-slate-200 shadow-sm text-slate-800 rounded-tl-none'
                                                }`}
                                        >
                                            {msg.role === 'assistant' || msg.role === 'system' ? (
                                                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 font-sans">
                                                    <ReactMarkdown>{msg.content.replace(/\[TOOL:.*?\]/g, '')}</ReactMarkdown>
                                                </div>
                                            ) : (
                                                <p className="text-sm">{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-red-600" />
                                        <span className="text-xs text-slate-500 font-mono">PROCESSING DATA...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            {/* Suggestions */}
                            {messages.length === 1 && (
                                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-2">
                                    {suggestions.map((sugg, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(sugg)}
                                            className="whitespace-nowrap px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded-full hover:bg-red-100 transition-colors border border-red-100"
                                        >
                                            {sugg}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Inserisci comando..."
                                    className="flex-1 p-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm font-medium"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors shadow-sm"
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                                    <Sparkles size={10} /> Powered by Baraka Intelligence
                                </p>
                            </div>
                        </div>

                        {/* Confirmation Modal Overlay */}
                        <AnimatePresence>
                            {confirmModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200"
                                    >
                                        <div className={`p-4 ${confirmModal.type === 'delete' ? 'bg-red-50' : 'bg-orange-50'} flex items-center gap-3 border-b border-slate-100`}>
                                            <div className={`p-2 rounded-full ${confirmModal.type === 'delete' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                                {confirmModal.type === 'delete' ? <AlertTriangle size={20} /> : <Edit size={20} />}
                                            </div>
                                            <h4 className={`font-bold ${confirmModal.type === 'delete' ? 'text-red-700' : 'text-orange-700'}`}>
                                                {confirmModal.type === 'delete' ? 'Confirm Deletion' : 'Confirm Update'}
                                            </h4>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-slate-600 text-sm mb-4">
                                                {confirmModal.description}
                                            </p>
                                            <div className="bg-slate-50 p-3 rounded-lg text-xs font-mono text-slate-500 mb-4 break-all">
                                                ID: {confirmModal.id}
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setConfirmModal(null)}
                                                    className="flex-1 py-2 px-4 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={executeAction}
                                                    className={`flex-1 py-2 px-4 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${confirmModal.type === 'delete'
                                                        ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20'
                                                        : 'bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20'
                                                        }`}
                                                >
                                                    {confirmModal.type === 'delete' ? <Trash2 size={16} /> : <Check size={16} />}
                                                    Confirm
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
