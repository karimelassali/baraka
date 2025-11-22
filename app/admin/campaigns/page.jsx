// app/admin/campaigns/page.jsx
"use client";

import WhatsAppCampaign from '../../../components/admin/WhatsAppCampaign';
import AISuggestionsFooter from '../../../components/admin/ai/AISuggestionsFooter';

export default function AdminCampaignsPage() {
  const handleSuggestion = (action) => {
    const event = new CustomEvent('baraka-ai-command', { detail: { command: action } });
    window.dispatchEvent(event);
  };

  const suggestions = [
    {
      title: "Campagna Festività",
      description: "Prepara una campagna per le prossime festività.",
      action: "Aiutami a creare una campagna WhatsApp per le prossime festività."
    },
    {
      title: "Targeting Avanzato",
      description: "Suggerisci filtri per raggiungere il pubblico giusto.",
      action: "Quali filtri dovrei usare per raggiungere i clienti più fedeli?"
    },
    {
      title: "Ottimizzazione Messaggio",
      description: "Migliora il testo dei tuoi messaggi per aumentare le conversioni.",
      action: "Dammi consigli su come scrivere un messaggio WhatsApp efficace."
    }
  ];

  return (
    <>
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">WhatsApp Campaigns</h1>
        <p className="text-gray-600">Create and manage WhatsApp messaging campaigns</p>
        <div className="w-24 h-1 bg-indigo-500 mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <WhatsAppCampaign />
        <AISuggestionsFooter suggestions={suggestions} onSuggestionClick={handleSuggestion} />
      </div>
    </>
  );
}