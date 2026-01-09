import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/utils/admin';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Check if user is authenticated and is an admin
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !isAdminEmail(user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { id } = await Promise.resolve(params);
    
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await req.json();

    // Разрешаем обновление только определенных полей
    const allowedFields = ['status', 'title', 'description', 'jewelry_type', 'material', 'carat'];
    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to update order' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Fetch customer email for the order
    try {
      const { data: userData } = await adminSupabase.auth.admin.getUserById(data.user_id);
      const orderWithEmail = {
        ...data,
        customer_email: userData?.user?.email || null,
      };
      return NextResponse.json(orderWithEmail);
    } catch (err) {
      console.error(`Error fetching email for user ${data.user_id}:`, err);
      return NextResponse.json({
        ...data,
        customer_email: null,
      });
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

