"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { createClient } from '../../lib/supabaseClient';
import { createPortal } from 'react-dom';

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
  Trash2,
  Maximize2,
  Star,
  Link as LinkIcon,
  MessageSquare,
  Copy
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import GlassCard from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/input';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import CategoryManagement from './CategoryManagement';
import { useTranslations } from 'next-intl';

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

function OfferModal({ isOpen, onClose, onSave, offer, initialData, categories }) {
  const t = useTranslations('Admin.Offers');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'WEEKLY',
    image_url: '',
    badge_text: '',
    category_id: '',
    is_popup: false
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (offer) {
        setFormData({
          title: offer.title || '',
          description: offer.description || '',
          type: offer.type || 'WEEKLY',
          image_url: offer.image_url || '',
          badge_text: offer.badge_text || '',
          category_id: offer.category_id || '',
          is_popup: offer.is_popup || false
        });
        setPreview(offer.image_url || '');
      } else if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          type: initialData.type || 'WEEKLY',
          image_url: '',
          badge_text: initialData.value ? `${initialData.value}${initialData.type === 'percentage' ? '%' : '€'} OFF` : '',
          category_id: '',
          is_popup: false
        });
        setPreview('');
      } else {
        setFormData({
          title: '',
          description: '',
          type: 'WEEKLY',
          image_url: '',
          badge_text: '',
          category_id: '',
          is_popup: false
        });
        setPreview('');
      }
      setErrors({});
      setStatus({ type: '', message: '' });
      setFile(null);
    }
  }, [isOpen, offer, initialData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.description) newErrors.description = 'Description is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const uploadImage = async () => {
    if (!file) return null;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'offers');

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      setStatus({ type: 'error', message: 'Failed to upload image: ' + error.message });
      return null;
    } finally {
      setUploading(false);
    }
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
      let imageUrl = formData.image_url;

      if (file) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setLoading(false);
          return; // Stop if upload failed
        }
      }

      // Ensure category_id is null if empty string to avoid UUID syntax error
      const payload = {
        ...formData,
        category_id: formData.category_id === '' ? null : formData.category_id,
        image_url: imageUrl
      };

      if (offer) {
        payload.id = offer.id;
      }

      const method = offer ? 'PUT' : 'POST';

      const response = await fetch('/api/admin/offers', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: offer ? t('messages.success_update') : t('messages.success_create') });
        onSave && onSave();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatus({ type: 'error', message: result.error || t('messages.error') });
      }
    } catch (error) {
      setStatus({ type: 'error', message: t('messages.error') });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
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
              {offer ? t('form.edit') : t('form.create')}
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
                  <label className="block text-sm font-medium mb-1">{t('form.title')}</label>
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
                  <label className="block text-sm font-medium mb-1">{t('form.type')}</label>
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
                      <option value="SPECIAL">Special</option>
                      <option value="FLASH_SALE">Flash Sale</option>
                      <option value="SEASONAL">Seasonal</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="is_popup"
                      checked={formData.is_popup}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_popup: checked }))}
                    />
                    <Label htmlFor="is_popup">{t('form.popup')}</Label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">{t('form.description')}</label>
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
                  <label className="block text-sm font-medium mb-1">{t('form.image')}</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
                        {preview ? (
                          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 opacity-50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Upload an image for the offer. Max 5MB.
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        name="image_url"
                        placeholder="Or enter image URL..."
                        value={formData.image_url}
                        onChange={(e) => {
                          handleChange(e);
                          setPreview(e.target.value);
                        }}
                        className="pl-10 text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('form.badge')}</label>
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
                  disabled={loading || uploading}
                >
                  {t('form.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-primary hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {uploading ? t('form.uploading') : (loading ? t('form.saving') : (offer ? t('form.update') : t('form.create_btn')))}
                </Button>
              </div>
            </form>
          </CardContent>
        </GlassCard>
      </motion.div >
    </div>,
    document.body
  );
}

export default function EnhancedOfferManagement() {
  const t = useTranslations('Admin.Offers');
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetchOffers();
    fetchCategories();


  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

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
            badge_text: offer.badge_text,
            category_id: offer.category_id,
            is_popup: offer.is_popup,
            is_active: offer.is_active // Ensure is_active is included
          };
        });

        // Sort: Popup offers first, then by date
        transformedData.sort((a, b) => {
          if (a.is_popup === b.is_popup) {
            return new Date(b.created_at) - new Date(a.created_at);
          }
          return a.is_popup ? -1 : 1;
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
    if (!confirm(t('messages.delete_confirm'))) return;


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

  const toggleActive = async (offer) => {
    try {
      const response = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: offer.id,
          is_active: !offer.is_active
        }),
      });

      if (response.ok) {
        setOffers(offers.map(o =>
          o.id === offer.id ? { ...o, is_active: !o.is_active } : o
        ));
      } else {
        console.error('Failed to toggle active status:', await response.json());
      }
    } catch (error) {
      console.error('Error toggling active status:', error);
    }
  };

  const handleCopyLink = (offer) => {
    const link = `${window.location.origin}/offers/${offer.id}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const handleSendSms = (offer) => {
    // Navigate to campaigns page
    window.location.href = '/admin/campaigns';
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* <CategoryManagement /> */}

      <GlassCard>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                {t('title')}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {t('subtitle')}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder={t('search')}
                  className="pl-10 pr-4 py-2 min-w-[240px]"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="bg-primary hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('create')}
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
            {t('existing')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.offer')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.type')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.category')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.active')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('table.actions')}</th>
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
                      className={`hover:bg-accent/50 transition-colors ${offer.is_popup ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : ''}`}
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
                            <div className="font-medium text-foreground flex items-center gap-2">
                              {offer.title}
                              {offer.is_popup && (
                                <Badge variant="outline" className="text-xs border-amber-500 text-amber-600 bg-amber-50 flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-amber-600" />
                                  Popup Offer
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs mt-1">{offer.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="secondary" className="capitalize">
                          {offer.type.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {offer.category_id ? (
                          <span className="text-sm text-muted-foreground">
                            {categories.find(cat => cat.id === offer.category_id)?.name?.en || 'N/A'}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={offer.is_active}
                            onCheckedChange={() => toggleActive(offer)}
                          />
                          <span className="text-xs text-muted-foreground">
                            {offer.is_active ? 'On' : 'Off'}
                          </span>
                        </div>
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
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyLink(offer)}
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Copy Public Link"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSendSms(offer)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Send as SMS Campaign"
                          >
                            <MessageSquare className="h-4 w-4" />
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
                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Gift className="h-8 w-8 text-muted-foreground/50" />
                        <p>{t('no_offers')}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </GlassCard>

      {isModalOpen && (
        <OfferModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchOffers}
          offer={editingOffer}
          initialData={initialData}
          categories={categories}
        />
      )}
    </motion.div>
  );
}