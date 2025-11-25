"use client";

import { useEffect, useState, useRef } from 'react';
import { Ticket, Copy, Check, Clock, AlertCircle, Download, QrCode, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

function Skeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

export default function Vouchers({ limit }) {
  const t = useTranslations('Dashboard.Vouchers');
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const voucherRefs = useRef({});

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('/api/customer/vouchers');
        const data = await response.json();

        if (response.ok) {
          setVouchers(data || []);
        } else {
          console.error('Failed to fetch vouchers:', data.error);
          setVouchers([]);
        }
      } catch (error) {
        console.error('An error occurred while fetching vouchers:', error);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = async (voucher) => {
    const element = voucherRefs.current[voucher.id];
    if (!element) {
      alert('Could not find voucher element.');
      return;
    }

    try {
      const { domToBlob } = await import('modern-screenshot');
      const QRCode = await import('qrcode');

      const baseUrl = window.location.origin;
      const redemptionUrl = `${baseUrl}/admin/vouchers?code=${voucher.code}`;

      const ignoreElements = element.querySelectorAll('[data-html2canvas-ignore="true"]');
      ignoreElements.forEach(el => el.style.display = 'none');

      const codeElement = element.querySelector('p.font-mono');
      let qrSection = null;

      if (codeElement) {
        qrSection = document.createElement('div');
        qrSection.className = 'mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200';
        qrSection.innerHTML = `
          <div class="flex justify-center mb-3">
            <div id="download-qr-${voucher.id}" class="bg-white p-3 rounded-lg"></div>
          </div>
          <p class="text-xs text-center text-gray-600 font-medium mb-2">Scan to verify & redeem</p>
          <p class="text-xs text-center text-gray-500">Valid until: ${new Date(voucher.expires_at).toLocaleDateString()}</p>
          <div class="mt-3 pt-3 border-t border-gray-300">
            <p class="text-xs text-gray-500 text-center">Baraka - Loyalty Program</p>
          </div>
        `;

        codeElement.parentNode.insertBefore(qrSection, codeElement.nextSibling);

        const qrContainer = element.querySelector(`#download-qr-${voucher.id}`);
        const qrDataURL = await QRCode.toDataURL(redemptionUrl, { width: 140, margin: 1 });

        const img = document.createElement('img');
        img.src = qrDataURL;
        img.style.width = '140px';
        img.style.height = '140px';
        qrContainer.appendChild(img);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      const blob = await domToBlob(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      ignoreElements.forEach(el => el.style.display = '');
      if (qrSection) qrSection.remove();

      if (!blob) throw new Error('Failed to create image');

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `voucher-${voucher.code}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Could not generate voucher image.');

      const ignoreElements = element.querySelectorAll('[data-html2canvas-ignore="true"]');
      ignoreElements.forEach(el => el.style.display = '');
      const qrSection = element.querySelector('[id^="download-qr-"]')?.closest('.mt-6');
      if (qrSection) qrSection.remove();
    }
  };

  if (loading) return <Skeleton />;

  const displayVouchers = limit ? vouchers.slice(0, limit) : vouchers;

  return (
    <div className="w-full">
      {!limit && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('title')}</h2>
          <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-medium">
            {vouchers.filter(v => v.is_active && !v.is_used).length} {t('available')}
          </span>
        </div>
      )}

      {displayVouchers.length > 0 ? (
        <div className={`grid grid-cols-1 ${limit ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
          {displayVouchers.map((voucher) => (
            <div
              key={voucher.id}
              ref={el => voucherRefs.current[voucher.id] = el}
              data-voucher-id={voucher.id}
              className={`relative bg-white border rounded-xl p-6 transition-all duration-200 ${voucher.is_used || !voucher.is_active
                ? 'border-gray-200 opacity-75'
                : 'border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-200'
                }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${voucher.is_used
                  ? 'bg-gray-100 text-gray-500'
                  : 'bg-indigo-50 text-indigo-600'
                  }`}>
                  <Ticket className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${voucher.is_used
                  ? 'bg-gray-100 text-gray-600'
                  : !voucher.is_active
                    ? 'bg-red-100 text-red-600'
                    : 'bg-green-100 text-green-600'
                  }`}>
                  {voucher.is_used ? t('used') : !voucher.is_active ? t('expired') : t('active')}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {voucher.value} {voucher.currency}
              </h3>
              <p className="text-sm text-gray-500 mb-6 font-mono tracking-wider">
                {voucher.code}
              </p>

              {!voucher.is_used && voucher.is_active ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2" data-html2canvas-ignore="true">
                    <button
                      onClick={() => setSelectedVoucher(voucher)}
                      className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      {t('use')}
                    </button>
                    <button
                      onClick={() => handleDownload(voucher)}
                      className="flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('download')}
                    </button>
                  </div>

                  <button
                    onClick={() => copyToClipboard(voucher.code, voucher.id)}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    data-html2canvas-ignore="true"
                  >
                    {copiedId === voucher.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        {t('copy_code')}
                      </>
                    )}
                  </button>

                  {voucher.expires_at && (
                    <p className="text-xs text-center text-gray-500 flex items-center justify-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {t('expires')} {new Date(voucher.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="w-full py-2 bg-gray-50 rounded-lg text-center">
                  <span className="text-sm text-gray-500 font-medium flex items-center justify-center">
                    {voucher.is_used ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t('redeemed')}
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        {t('expired')}
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Ticket className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">{t('no_vouchers')}</h3>
          <p className="text-gray-500 text-sm mb-6">{t('start_earning')}</p>
        </div>
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => setSelectedVoucher(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedVoucher.value} {selectedVoucher.currency}
                </h3>
                <p className="text-gray-500 mb-8">Show this code to the cashier</p>

                <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6">
                  <QRCodeSVG
                    value={selectedVoucher.code}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl mb-6">
                  <p className="text-sm text-gray-500 mb-1">Voucher Code</p>
                  <p className="text-xl font-mono font-bold tracking-wider text-indigo-600">
                    {selectedVoucher.code}
                  </p>
                </div>

                <p className="text-xs text-gray-400">
                  Expires on {new Date(selectedVoucher.expires_at).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}