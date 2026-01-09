'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { OrderCard } from './components/OrderCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAdminEmail } from '@/utils/admin';

type Order = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  jewelry_type?: string;
  material?: string;
  carat?: string;
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);

      // Get user session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;

      if (!currentUser) {
        console.error('User not logged in!');
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Get current user's orders
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching orders:', error);

      // If no orders exist — create 3 test orders
      if (!data || data.length === 0) {
        const { data: newOrders, error: insertError } = await supabase
          .from('orders')
          .insert([
            { 
              user_id: currentUser.id, 
              title: 'Wedding ring with diamonds', 
              description: 'Classic wedding ring in white gold with diamond accents', 
              status: 'design',
              jewelry_type: 'Ring',
              material: 'White gold 585',
              carat: '0.5'
            },
            { 
              user_id: currentUser.id, 
              title: 'Sapphire stud earrings', 
              description: 'Elegant stud earrings in yellow gold with natural sapphires', 
              status: 'polishing',
              jewelry_type: 'Earrings',
              material: 'Yellow gold 750',
              carat: '1.2'
            },
            { 
              user_id: currentUser.id, 
              title: 'Platinum bracelet', 
              description: 'Exquisite platinum bracelet with engraving', 
              status: 'completed',
              jewelry_type: 'Bracelet',
              material: 'Platinum 950',
              carat: '0'
            },
          ])
          .select('*');

        if (insertError) console.error('Error creating test orders:', insertError);
        setOrders(newOrders || []);
      } else {
        setOrders(data);
      }

      setLoading(false);
    }

    fetchOrders();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
    router.refresh();
  };

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
    {
      label: 'Total items',
      value: orders.length,
    },
    {
      label: 'In production',
      value: orders.filter((o) =>
        ['in_progress', 'casting', 'polishing', 'setting', 'quality_check'].includes(o.status)
      ).length,
    },
    {
      label: 'Completed',
      value: orders.filter((o) => o.status === 'completed').length,
    },
  ];

  const isAdmin = user && isAdminEmail(user.email);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-16">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 text-xs uppercase tracking-[0.5em] text-[#8c8c8c]">
            <p>Barakat Jewelry</p>
            {user && <p className="text-[11px] text-[#c0c0c0]">{user.email}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.35em] text-[#adadad]">
            {isAdmin && (
              <Link
                href="/admin"
                className="border border-[#1c1c1d] px-5 py-3 transition-colors hover:border-[#d4b196] hover:text-white"
              >
                Admin panel
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="border border-[#d54b4b] px-5 py-3 text-[#ffb9b9] transition-colors hover:bg-[#d54b4b] hover:text-white"
            >
              Sign out
            </button>
          </div>
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
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.8em] text-[#bfbfbf]">Your orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="border border-[#1c1c1d] bg-[#0d0d0e] px-12 py-16 text-center">
              <p className="text-sm uppercase tracking-[0.4em] text-[#9b9b9b]">
                Your jewelry items will appear here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
