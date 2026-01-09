'use client';

import { useState, useEffect } from 'react';

type Order = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  user_id: string;
  jewelry_type?: string;
  material?: string;
  carat?: string;
};

const statusOptions = [
  { value: 'design', label: 'Design' },
  { value: 'casting', label: 'Casting' },
  { value: 'polishing', label: 'Polishing' },
  { value: 'setting', label: 'Setting' },
  { value: 'quality_check', label: 'Quality check' },
  { value: 'completed', label: 'Completed' },
  { value: 'created', label: 'Created' },
  { value: 'in_progress', label: 'In progress' },
];

const jewelryTypeOptions = [
  'Кольцо',
  'Серьги',
  'Браслет',
  'Ожерелье',
  'Подвеска',
  'Брошь',
  'Запонки',
  'Цепочка',
  'Кулон',
];

const materialOptions = [
  'Белое золото 585',
  'Белое золото 750',
  'Желтое золото 585',
  'Желтое золото 750',
  'Красное золото 585',
  'Красное золото 750',
  'Серебро 925',
  'Серебро 999',
  'Платина 950',
  'Палладий 950',
];

interface EditOrderModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditOrderModal({ order, isOpen, onClose, onSuccess }: EditOrderModalProps) {
  const [formData, setFormData] = useState({
    title: order.title,
    description: order.description || '',
    status: order.status,
    jewelry_type: order.jewelry_type || '',
    material: order.material || '',
    carat: order.carat || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: order.title,
        description: order.description || '',
        status: order.status,
        jewelry_type: order.jewelry_type || '',
        material: order.material || '',
        carat: order.carat || '',
      });
      setError(null);
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to update order: ${res.statusText}`);
      }

      // Убеждаемся, что данные обновлены перед закрытием модалки
      if (data) {
        onSuccess();
        onClose();
      } else {
        throw new Error('No data returned from server');
      }
    } catch (err: any) {
      console.error('Error updating order:', err);
      setError(err.message || 'An error occurred while updating the order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl border border-[#1c1c1d] bg-[#0d0d0e] p-8 text-white">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-lg font-light uppercase tracking-[0.5em] text-white">
            Edit Order
          </h2>
          <button
            onClick={onClose}
            className="text-[#9b9b9b] transition-colors hover:text-white"
            aria-label="Close"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-6 border border-[#d54b4b] bg-[#1a0b0b] px-6 py-4 text-xs uppercase tracking-[0.35em] text-[#ffb9b9]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#9b9b9b]">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full border border-[#1c1c1d] bg-[#050505] px-4 py-3 text-white placeholder-[#6f6f6f] focus:border-[#d4b196] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#9b9b9b]">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border border-[#1c1c1d] bg-[#050505] px-4 py-3 text-white placeholder-[#6f6f6f] focus:border-[#d4b196] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#9b9b9b]">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              className="w-full border border-[#1c1c1d] bg-[#050505] px-4 py-3 text-white focus:border-[#d4b196] focus:outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#9b9b9b]">
              Jewelry Type
            </label>
            <select
              value={formData.jewelry_type}
              onChange={(e) => setFormData({ ...formData, jewelry_type: e.target.value })}
              className="w-full border border-[#1c1c1d] bg-[#050505] px-4 py-3 text-white focus:border-[#d4b196] focus:outline-none"
            >
              <option value="">Select type</option>
              {jewelryTypeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#9b9b9b]">
              Material
            </label>
            <select
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
              className="w-full border border-[#1c1c1d] bg-[#050505] px-4 py-3 text-white focus:border-[#d4b196] focus:outline-none"
            >
              <option value="">Select material</option>
              {materialOptions.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.35em] text-[#9b9b9b]">
              Carat
            </label>
            <input
              type="text"
              value={formData.carat}
              onChange={(e) => setFormData({ ...formData, carat: e.target.value })}
              placeholder="e.g., 0.5, 1.2"
              className="w-full border border-[#1c1c1d] bg-[#050505] px-4 py-3 text-white placeholder-[#6f6f6f] focus:border-[#d4b196] focus:outline-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-[#1c1c1d] px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-[#adadad] transition-colors hover:border-[#d4b196] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 border border-[#d4b196] bg-[#d4b196] px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-[#050505] transition-colors hover:bg-[#c9a085] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

