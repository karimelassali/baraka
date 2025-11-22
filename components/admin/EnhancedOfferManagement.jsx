"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Gift,
  Image as ImageIcon,
  Tag,
  Calendar,
  Search,
  Filter,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';

function SkeletonRow() {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-border"
    >
      <td className="py-4 px-6">
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-4 bg-muted rounded w-1/4"></div>
      </td>
      <td className="py-4 px-6">
        <div className="h-8 w-16 bg-muted rounded"></div>
      </td>
    </motion.tr>
  );
}

function OfferModal({ isOpen, onClose, onSave, offer, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEEKLY',
    image_url: '',
    badge_text: ''
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (offer) {
        setFormData({
          title: offer.title || '',
          description: offer.description || '',
          type: offer.type || 'WEEKLY',
          image_url: offer.image_url || '',
          badge_text: offer.badge_text || ''
        });
      } else if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          type: initialData.type || 'WEEKLY',
          image_url: '',
          badge_text: initialData.value ? `${initialData.value}${initialData.type === 'percentage' ? '%' : '€'} OFF` : ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          type: 'WEEKLY',
          image_url: '',
          badge_text: ''
        });
      }
      setErrors({});
      setStatus({ type: '', message: '' });
    }
  }, [isOpen, offer, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const method = offer ? 'PUT' : 'POST';
      const body = offer ? { ...formData, id: offer.id } : formData;

      const response = await fetch('/api/admin/offers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: `Offer ${offer ? 'updated' : 'created'} successfully` });
        onSave && onSave();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || `Failed to ${offer ? 'update' : 'create'} offer` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              {offer ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {offer ? 'Edit Offer' : 'Create New Offer'}
            </CardTitle>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            {status.message && (
              <div className={`mb-4 p-3 rounded-lg ${status.type === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      name="title"
                      placeholder="Offer title"
                      value={formData.title}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="WEEKLY">Weekly</option>
                      <option value="PERMANENT">Permanent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
                  <textarea
                    name="description"
                    placeholder="Offer description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
                {errors.description && <p className="mt-1 text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      name="image_url"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Badge Text</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      name="badge_text"
                      placeholder="e.g., 25% OFF"
                      value={formData.badge_text}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? 'Saving...' : (offer ? 'Update Offer' : 'Create Offer')}
                </Button>
              </div>
            </form>
          </CardContent>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default function EnhancedOfferManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchOffers();

    // Check for AI draft params
    const create = searchParams.get('create');
    if (create === 'true') {
      const title = searchParams.get('title');
      const type = searchParams.get('type');
      const value = searchParams.get('value');

      if (title || type || value) {
        setInitialData({ title, type, value });
        setEditingOffer(null);
        setIsModalOpen(true);
      }
    }
  }, [searchParams]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/offers');
      const data = await response.json();

      if (response.ok) {
        const transformedData = data.map(offer => {
          const title = typeof offer.title === 'object' ? offer.title.en || Object.values(offer.title)[0] : offer.title || 'N/A';
          const description = typeof offer.description === 'object' ? offer.description.en || Object.values(offer.description)[0] : offer.description || 'N/A';

          return {
            ...offer,
            title: title,
            description: description,
            type: offer.offer_type,
            image_url: offer.image_url,
            badge_text: offer.badge_text
          };
        });

        setOffers(transformedData);
      } else {
        console.error('Failed to fetch offers:', data.error);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOffer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const response = await fetch(`/api/admin/offers?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOffers(offers.filter(o => o.id !== id));
      } else {
        alert('Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <GlassCard>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Offer Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage weekly and permanent offers
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search offers..."
                  className="pl-10 pr-4 py-2 min-w-[240px]"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-primary hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Offer
              </Button>
            </div>
          </div>
        </CardHeader>
      </GlassCard>

      {/* Existing Offers */}
      <GlassCard className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Existing Offers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Offer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <AnimatePresence>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <SkeletonRow key={`skeleton-${index}`} />
                    ))}
                  </AnimatePresence>
                ) : offers.length > 0 ? (
                  offers.map((offer) => (
                    <motion.tr
                      key={offer.id}
                      className="hover:bg-accent/50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {offer.image_url ? (
                              <img src={offer.image_url} alt={offer.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-6 w-6" />
                              </div>
                            )}
                            {offer.badge_text && (
                              <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1 py-0.5 font-bold rounded-bl-md">
                                {offer.badge_text}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{offer.title}</div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs mt-1">{offer.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={offer.type === 'WEEKLY' ? 'default' : 'secondary'} className={offer.type === 'WEEKLY' ? 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200' : 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200'}>
                          {offer.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={offer.is_active ? 'default' : 'outline'} className={offer.is_active ? 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200'}>
                          {offer.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(offer)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(offer.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Gift className="h-8 w-8 text-muted-foreground/50" />
                        <p>No offers found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </GlassCard>

      <OfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchOffers}
        offer={editingOffer}
        initialData={initialData}
      />
    </motion.div>
  );
}