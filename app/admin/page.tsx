'use client';
import { useEffect, useState, useMemo } from 'react';
import { AdminOrderCard } from './components/AdminOrderCard';
import { CreateOrderModal } from './components/CreateOrderModal';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { isAdminEmail } from '@/utils/admin';
import { useRouter } from 'next/navigation';

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

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const data = await res.json();

      // If object received instead of array
      if (Array.isArray(data)) {
        setOrders(data);
      } else if (data.data && Array.isArray(data.data)) {
        setOrders(data.data);
      } else if (data.error) {
        setError(data.error);
        setOrders([]);
      } else {
        setOrders([]);
        console.error('Orders API returned unexpected data:', data);
      }
    } catch (err) {
      setError('Error loading jewelry');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAdminAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        router.replace('/login');
        return;
      }

      if (!isAdminEmail(currentUser.email)) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      setIsAuthorized(true);
      fetchOrders();
    }

    checkAdminAccess();
  }, [router, supabase]);

  if (isAuthorized === false) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <p className="mb-4 text-lg uppercase tracking-[0.4em] text-[#d54b4b]">
            Access Denied
          </p>
          <p className="text-sm uppercase tracking-[0.4em] text-[#9b9b9b]">
            Admin access required
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block border border-[#1c1c1d] px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-[#adadad] transition-colors hover:border-[#d4b196] hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#050505] text-white">
        <div className="text-center">
          <div className="mb-6 h-12 w-12 animate-spin rounded-full border border-[#d4b196] border-t-transparent" />
          <p className="text-sm uppercase tracking-[0.4em] text-[#9b9b9b]">Loading jewelry</p>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total items', value: orders.length },
    {
      label: 'In production',
      value: orders.filter((o) =>
        ['in_progress', 'casting', 'polishing', 'setting', 'quality_check'].includes(o.status)
      ).length,
    },
    { label: 'Completed', value: orders.filter((o) => o.status === 'completed').length },
  ];

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-xs uppercase tracking-[0.5em] text-[#8c8c8c]">
            <p>Barakat Admin Panel</p>
            <p className="text-[11px] text-[#c0c0c0]">Manage all jewelry items</p>
          </div>
          <Link
            href="/dashboard"
            className="border border-[#1c1c1d] px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-[#adadad] transition-colors hover:border-[#d4b196] hover:text-white"
          >
            ← to dashboard
          </Link>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border border-[#1c1c1d] bg-[#0d0d0e] px-8 py-7">
              <p className="text-[11px] uppercase tracking-[0.5em] text-[#8c8c8c]">{stat.label}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-5xl font-light text-[#e7c5a5]">{stat.value}</span>
                <span className="h-6 w-6 rounded-full border border-[#d4b196]" />
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.5em] text-[#bfbfbf]">
            <p>All orders</p>
            <div className="flex items-center gap-4">
              <span>
                {orders.length} {orders.length === 1 ? 'order' : 'orders'}
              </span>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex h-10 w-10 items-center justify-center border border-[#1c1c1d] text-[#adadad] transition-colors hover:border-[#d4b196] hover:text-white"
                aria-label="Create new order"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <div className="border border-[#d54b4b] bg-[#1a0b0b] px-6 py-4 text-xs uppercase tracking-[0.35em] text-[#ffb9b9]">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="border border-[#1c1c1d] bg-[#0d0d0e] px-12 py-16 text-center">
              <p className="text-sm uppercase tracking-[0.4em] text-[#9b9b9b]">
                Jewelry items will be displayed here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <AdminOrderCard key={order.id} order={order} onUpdate={fetchOrders} />
              ))}
            </div>
          )}
        </section>
      </div>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchOrders}
      />
    </div>
  );
}
