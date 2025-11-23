// app/admin/customers/page.jsx
"use client";

import EnhancedCustomerManagement from '../../../../components/admin/EnhancedCustomerManagement';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import AISuggestionsFooter from '../../../../components/admin/ai/AISuggestionsFooter';

export default function EnhancedAdminCustomersPage() {
  const handleSuggestion = (action) => {
    const event = new CustomEvent('baraka-ai-command', { detail: { command: action } });
    window.dispatchEvent(event);
  };

  const suggestions = [
    {
      title: "Clienti Inattivi",
      description: "Individua i clienti che non acquistano da tempo per una campagna di win-back.",
      action: "Trova i clienti inattivi da più di 30 giorni e suggerisci un'offerta per loro."
    },
    {
      title: "Top Spenders",
      description: "Identifica i clienti VIP per premiarli.",
      action: "Chi sono i miei migliori clienti? Suggerisci un premio VIP."
    },
    {
      title: "Analisi Demografica",
      description: "Ottieni insight sulla distribuzione dei tuoi clienti.",
      action: "Analizza la demografia dei clienti (età, zona) se disponibile."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
            <p className="text-muted-foreground mt-1">Manage your customer information and details</p>
          </div>
        </div>
      </div>

      <EnhancedCustomerManagement />

      <AISuggestionsFooter suggestions={suggestions} onSuggestionClick={handleSuggestion} />
    </motion.div>
  );
}