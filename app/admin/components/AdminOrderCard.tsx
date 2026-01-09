'use client';

import { useState } from 'react';
import { EditOrderModal } from './EditOrderModal';

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

const statusTextMap: Record<string, string> = {
  design: 'Design',
  casting: 'Casting',
  polishing: 'Polishing',
  setting: 'Setting',
  quality_check: 'Quality check',
  completed: 'Completed',
  created: 'Created',
  in_progress: 'In progress',
  pending: 'Pending',
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
    .format(new Date(dateString))
    .toLowerCase();
};

export function AdminOrderCard({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="flex h-full flex-col gap-6 border border-[#1c1c1d] bg-[#0d0d0e] px-8 py-7 text-white transition-transform duration-300 hover:-translate-y-1">
        <div className="flex items-start justify-between text-xs uppercase tracking-[0.35em] text-[#a0a0a0]">
          <span>{statusTextMap[order.status] || order.status}</span>
          <span className="text-[#d4b196]">#{order.id.slice(0, 6)}</span>
        </div>

        <div>
          <h3 className="text-lg font-light uppercase tracking-[0.5em] text-white">{order.title}</h3>
          <p className="mt-4 text-sm text-[#9b9b9b]">{order.description}</p>
          {order.jewelry_type && (
            <p className="mt-2 text-xs uppercase tracking-[0.35em] text-[#6f6f6f]">
              {order.jewelry_type}
            </p>
          )}
        </div>

        <div className="space-y-2 text-xs uppercase tracking-[0.35em] text-[#6f6f6f]">
          <p className="flex items-center gap-3">
            <span>Client:</span>
            <span className="tracking-[0.2em] text-white">{order.user_id.slice(0, 8)}...</span>
          </p>
          {order.material && (
            <p className="flex items-center gap-3">
              <span>Material:</span>
              <span className="flex items-center gap-2 tracking-[0.2em] text-white">
                <span className="h-2 w-2 rounded-full bg-[#f1d6a0]" />
                {order.material}
              </span>
            </p>
          )}
          {order.carat && (
            <p className="flex items-center gap-3">
              <span>Carat:</span>
              <span className="tracking-[0.2em] text-white">{order.carat}</span>
            </p>
          )}
        </div>

        <div className="h-px w-full bg-[#1e1e1f]" />

        <div className="flex items-center justify-between">
          <div className="text-xs uppercase tracking-[0.35em] text-[#8c8c8c]">
            {formatDate(order.created_at)}
          </div>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="border border-[#1c1c1d] px-4 py-2 text-[10px] uppercase tracking-[0.35em] text-[#adadad] transition-colors hover:border-[#d4b196] hover:text-white"
          >
            Edit
          </button>
        </div>
      </div>

      <EditOrderModal
        order={order}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={onUpdate}
      />
    </>
  );
}

