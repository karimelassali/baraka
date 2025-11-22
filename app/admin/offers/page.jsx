// app/admin/offers/page.jsx
"use client";

import EnhancedOfferManagement from '../../../components/admin/EnhancedOfferManagement';
import { motion } from 'framer-motion';
import AISuggestionsFooter from '../../../components/admin/ai/AISuggestionsFooter';

export default function EnhancedAdminOffersPage() {
  const handleSuggestion = (action) => {
    const event = new CustomEvent('baraka-ai-command', { detail: { command: action } });
    window.dispatchEvent(event);
  };

  const suggestions = [
    {
      title: "Offerta Flash",
      description: "Crea un'offerta lampo per stimolare le vendite oggi.",
      action: "Crea una bozza per un'offerta lampo valida solo per oggi."
    },
    {
      title: "Analisi Performance",
      description: "Quali offerte hanno funzionato meglio in passato?",
      action: "Analizza le performance delle offerte passate e dimmi cosa funziona."
    },
    {
      title: "Offerta Stagionale",
      description: "Suggerisci un'offerta basata sulla stagione o festività corrente.",
      action: "Suggerisci un'offerta tematica per il periodo attuale."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Offer Management</h1>
        <p className="text-muted-foreground mt-1">Create and manage weekly and permanent offers</p>
      </div>

      <EnhancedOfferManagement />

      <AISuggestionsFooter suggestions={suggestions} onSuggestionClick={handleSuggestion} />
    </motion.div>
  );
}