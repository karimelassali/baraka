// app/admin/reviews/page.jsx
"use client";

import EnhancedReviewManagement from '../../../../components/admin/EnhancedReviewManagement';
import { motion } from 'framer-motion';
import AISuggestionsFooter from '../../../../components/admin/ai/AISuggestionsFooter';

export default function EnhancedAdminReviewsPage() {
  const handleSuggestion = (action) => {
    // Dispatch event for AICopilot
    const event = new CustomEvent('baraka-ai-command', { detail: { command: action } });
    window.dispatchEvent(event);
  };

  const suggestions = [
    {
      title: "Analisi Sentiment",
      description: "Analizza il tono emotivo delle recensioni recenti per capire la soddisfazione.",
      action: "Analizza il sentiment delle ultime 5 recensioni e dammi un riassunto."
    },
    {
      title: "Risposte Automatiche",
      description: "Genera bozze di risposta per le recensioni non ancora gestite.",
      action: "Trova recensioni senza risposta e suggerisci risposte gentili."
    },
    {
      title: "Report Qualità",
      description: "Crea un report sui punti di forza e debolezza segnalati dai clienti.",
      action: "Analizza le recensioni e crea un report su punti di forza e debolezza."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
        <p className="text-muted-foreground mt-1">Moderate and manage customer reviews</p>
      </div>

      <EnhancedReviewManagement />

      <AISuggestionsFooter suggestions={suggestions} onSuggestionClick={handleSuggestion} />
    </motion.div>
  );
}