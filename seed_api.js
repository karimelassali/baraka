async function seedData() {
    const items = [
        { title: 'Dashboard Route', content: '**Dashboard** (/admin): Overview of stats, revenue, and quick actions.', type: 'route' },
        { title: 'Customers Route', content: '**Customers** (/admin/customers): List of all registered clients. You can search, view details, and manage points.', type: 'route' },
        { title: 'Offers Route', content: '**Offers** (/admin/offers): Manage loyalty offers. You can create, edit, or delete offers (Percentage or Fixed amount).', type: 'route' },
        { title: 'Campaigns Route', content: '**Campaigns** (/admin/campaigns): Create and manage WhatsApp/Email campaigns. Filter clients by criteria.', type: 'route' },
        { title: 'Reviews Route', content: '**Reviews** (/admin/reviews): Moderate user reviews. Approve or delete reviews.', type: 'route' },
        { title: 'Analytics Route', content: '**Analytics** (/admin/analytics): Detailed charts and reports on revenue and user growth.', type: 'route' },
        { title: 'Settings Route', content: '**Settings** (/admin/settings): System configuration, profile settings, and business details.', type: 'route' },
        { title: 'Board Route', content: '**Board** (/admin/board): A kanban-style board for managing tasks and notes.', type: 'route' },
        { title: 'Agent Training Route', content: '**Agent Training** (/admin/agent-training): Manage the AI agent\'s knowledge base. Add, edit, or delete lessons.', type: 'route' }
    ];

    for (const item of items) {
        try {
            const response = await fetch('http://localhost:3000/api/admin/agent-knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            const data = await response.json();
            console.log(`Added ${item.title}:`, response.status);
        } catch (error) {
            console.error(`Error adding ${item.title}:`, error);
        }
    }
}

seedData();
