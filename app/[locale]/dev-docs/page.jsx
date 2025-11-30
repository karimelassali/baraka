'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code2,
    FolderTree,
    Route,
    Database,
    Settings,
    Layers,
    FileCode,
    Palette,
    Shield,
    Zap,
    Globe,
    Search,
    ChevronRight,
    ExternalLink,
    BookOpen,
    GitBranch,
    Package,
    Terminal,
    Sparkles,
    FileJson,
    Menu,
    X,
} from 'lucide-react';

export default function DeveloperDocumentation() {
    const [activeSection, setActiveSection] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const sections = [
        { id: 'overview', title: 'Project Overview', icon: BookOpen },
        { id: 'structure', title: 'File Structure', icon: FolderTree },
        { id: 'routes', title: 'Routes & Pages', icon: Route },
        { id: 'api', title: 'API Endpoints', icon: Database },
        { id: 'components', title: 'Components', icon: Layers },
        { id: 'features', title: 'Features', icon: Sparkles },
        { id: 'tech-stack', title: 'Tech Stack', icon: Package },
        { id: 'development', title: 'Development Guide', icon: Terminal },
    ];

    const techStack = [
        { category: 'Framework', items: ['Next.js 15.3.5', 'React 19', 'App Router'] },
        { category: 'Styling', items: ['Tailwind CSS 4', 'Framer Motion', 'Glassmorphism Design'] },
        { category: 'Backend', items: ['Supabase (Auth, DB, Storage)', 'PostgreSQL', 'Next.js API Routes'] },
        { category: 'State & Data', items: ['React Hooks', 'Server Components', 'Client Components'] },
        { category: 'Internationalization', items: ['next-intl', 'Multi-language support (EN, IT, AR)'] },
        { category: 'Communication', items: ['Twilio (WhatsApp)', 'Nodemailer', 'Resend'] },
        { category: 'UI Libraries', items: ['Lucide Icons', 'Radix UI', 'Recharts', 'QRCode'] },
    ];

    const publicRoutes = [
        { path: '/[locale]', desc: 'Landing page with hero, gallery, offers, reviews' },
        { path: '/[locale]/login', desc: 'Customer & admin login' },
        { path: '/[locale]/register', desc: 'Customer registration' },
        { path: '/[locale]/offers', desc: 'Public offers listing' },
        { path: '/[locale]/reviews', desc: 'Customer reviews showcase' },
        { path: '/[locale]/privacy', desc: 'Privacy policy' },
        { path: '/[locale]/terms', desc: 'Terms & conditions' },
    ];

    const adminRoutes = [
        { path: '/[locale]/admin', desc: 'Dashboard with analytics & stats' },
        { path: '/[locale]/admin/customers', desc: 'Customer management (CRUD)' },
        { path: '/[locale]/admin/inventory', desc: 'Product & category management' },
        { path: '/[locale]/admin/offers', desc: 'Promotional offers management' },
        { path: '/[locale]/admin/vouchers', desc: 'Voucher issuance & tracking' },
        { path: '/[locale]/admin/campaigns', desc: 'WhatsApp marketing campaigns' },
        { path: '/[locale]/admin/reviews', desc: 'Review moderation & approval' },
        { path: '/[locale]/admin/gallery', desc: 'Image gallery management' },
        { path: '/[locale]/admin/admins', desc: 'Admin user management' },
        { path: '/[locale]/admin/analytics', desc: 'Advanced analytics dashboard' },
        { path: '/[locale]/admin/logs', desc: 'System activity logs' },
    ];

    const customerRoutes = [
        { path: '/[locale]/dashboard', desc: 'Customer dashboard with points & vouchers' },
    ];

    const apiEndpoints = [
        {
            category: 'Authentication',
            endpoints: [
                { method: 'POST', path: '/api/login', desc: 'User authentication' },
                { method: 'POST', path: '/api/register', desc: 'Customer registration' },
                { method: 'POST', path: '/api/logout', desc: 'User logout' },
                { method: 'POST', path: '/api/setup-admin', desc: 'Initial admin setup' },
            ],
        },
        {
            category: 'Admin - Customers',
            endpoints: [
                { method: 'GET', path: '/api/admin/customers', desc: 'List all customers' },
                { method: 'POST', path: '/api/admin/customers', desc: 'Create customer' },
                { method: 'PUT', path: '/api/admin/customers/[id]', desc: 'Update customer' },
                { method: 'DELETE', path: '/api/admin/customers/[id]', desc: 'Delete customer' },
                { method: 'GET/PUT', path: '/api/admin/customers/[id]/points', desc: 'Manage points' },
                { method: 'GET', path: '/api/admin/customers/[id]/vouchers', desc: 'Customer vouchers' },
            ],
        },
        {
            category: 'Admin - Inventory',
            endpoints: [
                { method: 'GET/POST', path: '/api/admin/inventory/products', desc: 'Product CRUD' },
                { method: 'PUT/DELETE', path: '/api/admin/inventory/products/[id]', desc: 'Product operations' },
                { method: 'GET/POST', path: '/api/admin/inventory/categories', desc: 'Category management' },
                { method: 'GET', path: '/api/admin/inventory/expiring', desc: 'Expiring products alert' },
            ],
        },
        {
            category: 'Admin - Marketing',
            endpoints: [
                { method: 'GET/POST', path: '/api/admin/offers', desc: 'Offer management' },
                { method: 'GET/POST', path: '/api/admin/vouchers', desc: 'Voucher operations' },
                { method: 'POST', path: '/api/admin/vouchers/verify', desc: 'Verify voucher code' },
                { method: 'POST', path: '/api/admin/campaigns/send', desc: 'Send WhatsApp campaign' },
                { method: 'GET', path: '/api/admin/campaigns/history', desc: 'Campaign history' },
            ],
        },
        {
            category: 'Admin - Content',
            endpoints: [
                { method: 'GET/POST', path: '/api/admin/reviews', desc: 'Review moderation' },
                { method: 'PUT', path: '/api/admin/reviews/[id]', desc: 'Approve/reject review' },
                { method: 'GET/POST/DELETE', path: '/api/admin/gallery', desc: 'Gallery management' },
            ],
        },
        {
            category: 'Customer Portal',
            endpoints: [
                { method: 'GET', path: '/api/customer/profile', desc: 'Get customer profile' },
                { method: 'GET', path: '/api/customer/points', desc: 'Points balance' },
                { method: 'GET', path: '/api/customer/vouchers', desc: 'My vouchers' },
            ],
        },
        {
            category: 'Public',
            endpoints: [
                { method: 'GET', path: '/api/offers', desc: 'Public offers list' },
                { method: 'GET', path: '/api/reviews', desc: 'Approved reviews' },
                { method: 'GET', path: '/api/gallery', desc: 'Gallery images' },
            ],
        },
    ];

    const keyComponents = [
        {
            path: 'components/admin/*',
            desc: 'All admin panel components (sidebar, modals, forms, management pages)',
        },
        {
            path: 'components/home/*',
            desc: 'Landing page components (Hero, About, Gallery, Offers, Reviews)',
        },
        {
            path: 'components/dashboard/*',
            desc: 'Customer dashboard components',
        },
        {
            path: 'components/ui/*',
            desc: 'Reusable UI components (buttons, cards, inputs, modals)',
        },
        {
            path: 'components/forms/*',
            desc: 'Form components (login, register, etc.)',
        },
        {
            path: 'lib/supabase/*',
            desc: 'Supabase client, server, and auth helpers',
        },
        {
            path: 'lib/whatsapp/*',
            desc: 'WhatsApp integration via Twilio',
        },
        {
            path: 'lib/email/*',
            desc: 'Email service utilities',
        },
    ];

    const developmentSteps = [
        {
            title: '1. Environment Setup',
            code: `# Install dependencies
npm install

# Create .env file with:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+123456789`,
        },
        {
            title: '2. Database Setup',
            code: `# Run migrations in database/ folder
# Tables: users, customers, products, categories, offers, 
# vouchers, reviews, gallery, campaigns_history, admin_logs

# Check database/schema.sql for full schema`,
        },
        {
            title: '3. Run Development Server',
            code: `npm run dev
# Open http://localhost:3000`,
        },
        {
            title: '4. Creating New Features',
            code: `# New Page: app/[locale]/your-page/page.jsx
# New API: app/api/your-endpoint/route.js
# New Component: components/your-component/YourComponent.jsx
# Add translations: messages/en.json, it.json, ar.json`,
        },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Sparkles className="w-8 h-8 text-purple-400" />
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Baraka Platform
                                </h2>
                            </div>
                            <p className="text-gray-300 text-lg mb-6">
                                A comprehensive customer loyalty & business management platform built with Next.js, Supabase, and modern web technologies.
                            </p>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4">
                                    <Globe className="w-6 h-6 text-blue-400 mb-2" />
                                    <h3 className="font-semibold text-white mb-1">Multi-language</h3>
                                    <p className="text-sm text-gray-400">English, Italian, Arabic support</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-4">
                                    <Shield className="w-6 h-6 text-green-400 mb-2" />
                                    <h3 className="font-semibold text-white mb-1">Secure Auth</h3>
                                    <p className="text-sm text-gray-400">Supabase authentication & RLS</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                                    <Zap className="w-6 h-6 text-purple-400 mb-2" />
                                    <h3 className="font-semibold text-white mb-1">Modern Stack</h3>
                                    <p className="text-sm text-gray-400">Next.js 15, React 19, Tailwind 4</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-8"
                        >
                            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                                Core Modules
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[
                                    { title: 'Admin Portal', desc: 'Complete business management dashboard', icon: Settings },
                                    { title: 'Customer Portal', desc: 'Loyalty points & vouchers', icon: Sparkles },
                                    { title: 'Marketing Suite', desc: 'Offers, campaigns, WhatsApp integration', icon: Zap },
                                    { title: 'Inventory System', desc: 'Products, categories, expiration tracking', icon: Package },
                                ].map((module, idx) => (
                                    <div key={idx} className="flex gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                        <module.icon className="w-5 h-5 text-purple-400 mt-1" />
                                        <div>
                                            <h4 className="font-semibold text-white">{module.title}</h4>
                                            <p className="text-sm text-gray-400">{module.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                );

            case 'structure':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <FolderTree className="w-6 h-6 text-blue-400" />
                                Project Structure
                            </h2>
                            <div className="bg-gray-900/50 rounded-lg p-6 font-mono text-sm overflow-x-auto">
                                <pre className="text-gray-300">
                                    {`baraka/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── page.js              # Landing page
│   │   ├── login/               # Authentication
│   │   ├── register/            
│   │   ├── dashboard/           # Customer portal
│   │   ├── admin/               # Admin panel
│   │   │   ├── page.jsx         # Admin dashboard
│   │   │   ├── customers/       # Customer management
│   │   │   ├── inventory/       # Product management
│   │   │   ├── offers/          # Offers management
│   │   │   ├── vouchers/        # Voucher system
│   │   │   ├── campaigns/       # WhatsApp campaigns
│   │   │   ├── reviews/         # Review moderation
│   │   │   ├── gallery/         # Gallery management
│   │   │   └── analytics/       # Analytics dashboard
│   │   └── ...
│   └── api/                     # API routes
│       ├── admin/               # Admin endpoints
│       ├── customer/            # Customer endpoints
│       ├── login/               # Auth endpoints
│       └── ...
├── components/                  # React components
│   ├── admin/                   # Admin components
│   ├── home/                    # Landing page components
│   ├── dashboard/               # Customer dashboard components
│   ├── ui/                      # Reusable UI components
│   └── forms/                   # Form components
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase clients & helpers
│   ├── whatsapp/               # Twilio WhatsApp integration
│   ├── email/                  # Email services
│   └── auth/                   # Auth utilities
├── messages/                    # i18n translations
│   ├── en.json                 # English
│   ├── it.json                 # Italian
│   └── ar.json                 # Arabic
├── database/                    # Database migrations & schemas
├── public/                      # Static assets
└── package.json                # Dependencies`}
                                </pre>
                            </div>
                        </motion.div>
                    </div>
                );

            case 'routes':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Route className="w-6 h-6 text-blue-400" />
                                Application Routes
                            </h2>

                            <div className="space-y-6">
                                {/* Public Routes */}
                                <div>
                                    <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        Public Routes
                                    </h3>
                                    <div className="space-y-2">
                                        {publicRoutes.map((route, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                                <code className="text-blue-300 font-mono text-sm">{route.path}</code>
                                                <p className="text-gray-400 text-sm mt-1">{route.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Admin Routes */}
                                <div>
                                    <h3 className="text-lg font-semibold text-orange-400 mb-3 flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        Admin Routes (Protected)
                                    </h3>
                                    <div className="space-y-2">
                                        {adminRoutes.map((route, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                                <code className="text-orange-300 font-mono text-sm">{route.path}</code>
                                                <p className="text-gray-400 text-sm mt-1">{route.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Customer Routes */}
                                <div>
                                    <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5" />
                                        Customer Routes (Protected)
                                    </h3>
                                    <div className="space-y-2">
                                        {customerRoutes.map((route, idx) => (
                                            <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                                <code className="text-green-300 font-mono text-sm">{route.path}</code>
                                                <p className="text-gray-400 text-sm mt-1">{route.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                );

            case 'api':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Database className="w-6 h-6 text-blue-400" />
                                API Endpoints
                            </h2>

                            <div className="space-y-6">
                                {apiEndpoints.map((category, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-lg font-semibold text-purple-400 mb-3">{category.category}</h3>
                                        <div className="space-y-2">
                                            {category.endpoints.map((endpoint, eidx) => (
                                                <div key={eidx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${endpoint.method.includes('GET') ? 'bg-green-500/20 text-green-300' :
                                                                endpoint.method.includes('POST') ? 'bg-blue-500/20 text-blue-300' :
                                                                    endpoint.method.includes('PUT') ? 'bg-yellow-500/20 text-yellow-300' :
                                                                        'bg-red-500/20 text-red-300'
                                                            }`}>
                                                            {endpoint.method}
                                                        </span>
                                                        <code className="text-blue-300 font-mono text-sm">{endpoint.path}</code>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">{endpoint.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                );

            case 'components':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Layers className="w-6 h-6 text-blue-400" />
                                Component Structure
                            </h2>

                            <div className="space-y-4">
                                {keyComponents.map((comp, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                                        <code className="text-purple-300 font-mono text-sm">{comp.path}</code>
                                        <p className="text-gray-400 text-sm mt-2">{comp.desc}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <h3 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                    <FileCode className="w-5 h-5" />
                                    Naming Conventions
                                </h3>
                                <ul className="text-sm text-gray-300 space-y-2">
                                    <li>• Components: PascalCase (e.g., EnhancedOfferManagement.jsx)</li>
                                    <li>• Files: camelCase for utilities (e.g., supabaseClient.js)</li>
                                    <li>• API Routes: route.js in folder structure</li>
                                    <li>• Pages: page.jsx in folder structure</li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>
                );

            case 'features':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-blue-400" />
                                Platform Features
                            </h2>

                            <div className="space-y-4">
                                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl">
                                    <h3 className="text-lg font-semibold text-purple-300 mb-3">🎯 Customer Loyalty System</h3>
                                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                        <li>• Points accumulation & redemption</li>
                                        <li>• Digital voucher wallet with QR codes</li>
                                        <li>• Promotional offers & campaigns</li>
                                        <li>• Transaction history tracking</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl">
                                    <h3 className="text-lg font-semibold text-blue-300 mb-3">🛠️ Admin Management</h3>
                                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                        <li>• Customer database with CRUD operations</li>
                                        <li>• Inventory & product management</li>
                                        <li>• Expiration tracking & alerts</li>
                                        <li>• Review moderation workflow</li>
                                        <li>• Gallery & content management</li>
                                        <li>• Real-time analytics dashboard</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl">
                                    <h3 className="text-lg font-semibold text-green-300 mb-3">📱 Marketing & Communication</h3>
                                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                        <li>• WhatsApp bulk campaigns (Twilio integration)</li>
                                        <li>• Email notifications (Nodemailer & Resend)</li>
                                        <li>• Offer badges & promotions</li>
                                        <li>• Campaign tracking & history</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl">
                                    <h3 className="text-lg font-semibold text-orange-300 mb-3">🌍 Internationalization</h3>
                                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                        <li>• Multi-language support (EN, IT, AR)</li>
                                        <li>• RTL layout for Arabic</li>
                                        <li>• Translation management in messages/ folder</li>
                                        <li>• Language switcher component</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl">
                                    <h3 className="text-lg font-semibold text-pink-300 mb-3">🎨 Design System</h3>
                                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                                        <li>• Glassmorphism UI with blur effects</li>
                                        <li>• Framer Motion animations</li>
                                        <li>• Responsive design (mobile-first)</li>
                                        <li>• Dark theme with vibrant gradients</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                );

            case 'tech-stack':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="w-6 h-6 text-blue-400" />
                                Technology Stack
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4">
                                {techStack.map((stack, idx) => (
                                    <div key={idx} className="bg-white/5 rounded-lg p-5 hover:bg-white/10 transition-colors">
                                        <h3 className="font-semibold text-purple-300 mb-3">{stack.category}</h3>
                                        <ul className="space-y-2">
                                            {stack.items.map((item, iidx) => (
                                                <li key={iidx} className="flex items-center gap-2 text-sm text-gray-300">
                                                    <ChevronRight className="w-4 h-4 text-blue-400" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
                                <h3 className="font-semibold text-purple-300 mb-3 flex items-center gap-2">
                                    <FileJson className="w-5 h-5" />
                                    Dependencies
                                </h3>
                                <p className="text-sm text-gray-400 mb-2">Check package.json for full list. Key dependencies:</p>
                                <div className="grid md:grid-cols-3 gap-2 text-sm">
                                    <code className="text-blue-300">next@15.3.5</code>
                                    <code className="text-blue-300">react@19.0.0</code>
                                    <code className="text-blue-300">@supabase/supabase-js</code>
                                    <code className="text-blue-300">framer-motion</code>
                                    <code className="text-blue-300">next-intl</code>
                                    <code className="text-blue-300">tailwindcss@4</code>
                                    <code className="text-blue-300">twilio</code>
                                    <code className="text-blue-300">recharts</code>
                                    <code className="text-blue-300">lucide-react</code>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                );

            case 'development':
                return (
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Terminal className="w-6 h-6 text-blue-400" />
                                Development Guide
                            </h2>

                            <div className="space-y-6">
                                {developmentSteps.map((step, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-lg font-semibold text-purple-400 mb-3">{step.title}</h3>
                                        <div className="bg-gray-900/50 rounded-lg p-4 overflow-x-auto">
                                            <pre className="text-sm text-gray-300 font-mono">{step.code}</pre>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                    <h3 className="font-semibold text-yellow-300 mb-3 flex items-center gap-2">
                                        <Zap className="w-5 h-5" />
                                        Quick Tips
                                    </h3>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• <strong>Hot Reload:</strong> Changes auto-refresh in dev mode</li>
                                        <li>• <strong>API Testing:</strong> Use tools like Postman or Thunder Client</li>
                                        <li>• <strong>Database:</strong> Check Supabase dashboard for live data</li>
                                        <li>• <strong>Logs:</strong> Admin activity logged in admin_logs table</li>
                                        <li>• <strong>Translations:</strong> Add keys to all 3 language files (en, it, ar)</li>
                                        <li>• <strong>Components:</strong> Use 'use client' directive for interactive components</li>
                                    </ul>
                                </div>

                                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <h3 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                                        <GitBranch className="w-5 h-5" />
                                        Workflow Best Practices
                                    </h3>
                                    <ul className="text-sm text-gray-300 space-y-2">
                                        <li>• Test in all 3 languages before deployment</li>
                                        <li>• Check mobile responsiveness for all new UI</li>
                                        <li>• Verify Supabase RLS policies for new tables</li>
                                        <li>• Add error handling for all API routes</li>
                                        <li>• Document complex functions with comments</li>
                                        <li>• Use TypeScript types where applicable (.ts/.tsx files)</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-card border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                {isSidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
                            </button>
                            <Code2 className="w-8 h-8 text-purple-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-white">Developer Documentation</h1>
                                <p className="text-sm text-gray-400">Baraka Platform Technical Guide</p>
                            </div>
                        </div>
                        <a
                            href="/"
                            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors text-sm flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Back to App
                        </a>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-6">
                    {/* Sidebar */}
                    <motion.aside
                        initial={false}
                        animate={{
                            x: isSidebarOpen ? 0 : -300,
                        }}
                        className="fixed lg:sticky top-20 left-0 lg:left-auto w-64 glass-card p-4 rounded-xl h-fit z-40 lg:z-0"
                    >
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setActiveSection(section.id);
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                                            ? 'bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/20'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <section.icon className="w-5 h-5" />
                                    <span className="font-medium text-sm">{section.title}</span>
                                </button>
                            ))}
                        </nav>
                    </motion.aside>

                    {/* Content */}
                    <main className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <style jsx global>{`
        .glass-card {
          background: rgba(17, 25, 40, 0.75);
          backdrop-filter: blur(16px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.125);
        }
      `}</style>
        </div>
    );
}
