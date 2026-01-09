import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { isAdminEmail } from '@/utils/admin';

export async function POST(req: NextRequest) {
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
    const body = await req.json();

    const { customer_email, title, description, status, jewelry_type, material, carat } = body;

    if (!customer_email || !title || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_email, title, and status are required' },
        { status: 400 }
      );
    }

    // Find user by email using admin API with pagination
    let customerUser = null;
    let page = 1;
    const perPage = 1000; // Supabase default page size
    
    while (!customerUser) {
      const { data: usersData, error: userError } = await adminSupabase.auth.admin.listUsers({
        page,
        perPage,
      });
      
      if (userError) {
        console.error('Error fetching users:', userError);
        return NextResponse.json(
          { error: 'Failed to find user by email' },
          { status: 500 }
        );
      }

      if (!usersData || !usersData.users || usersData.users.length === 0) {
        // No more users to check
        break;
      }

      customerUser = usersData.users.find(
        (u) => u.email?.toLowerCase() === customer_email.toLowerCase()
      );

      // If we found the user or there are no more pages, break
      if (customerUser || usersData.users.length < perPage) {
        break;
      }

      page++;
    }

    // If user not found, create a new user automatically
    if (!customerUser) {
      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!';
      
      const { data: newUser, error: createUserError } = await adminSupabase.auth.admin.createUser({
        email: customer_email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm email so user can login immediately
      });

      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return NextResponse.json(
          { error: `Failed to create user account: ${createUserError.message}` },
          { status: 500 }
        );
      }

      if (!newUser || !newUser.user) {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      customerUser = newUser.user;
      
      // User account created successfully
      // The user can use "Forgot password" on the login page to set their own password
    }

    // Create order with found user_id
    const orderData: Record<string, any> = {
      user_id: customerUser.id,
      title,
      description: description || null,
      status,
      jewelry_type: jewelry_type || null,
      material: material || null,
      carat: carat || null,
    };

    const { data: newOrder, error: orderError } = await adminSupabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error('Supabase insert error:', orderError);
      return NextResponse.json(
        { error: orderError.message || 'Failed to create order' },
        { status: 500 }
      );
    }

    // Add customer_email to the response
    const orderWithEmail = {
      ...newOrder,
      customer_email: customerUser.email || null,
    };

    return NextResponse.json(orderWithEmail, { status: 201 });
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
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
    const { data, error } = await adminSupabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Fetch customer emails for each order
    const ordersWithEmails = await Promise.all(
      (data || []).map(async (order) => {
        try {
          const { data: userData } = await adminSupabase.auth.admin.getUserById(order.user_id);
          return {
            ...order,
            customer_email: userData?.user?.email || null,
          };
        } catch (err) {
          console.error(`Error fetching email for user ${order.user_id}:`, err);
          return {
            ...order,
            customer_email: null,
          };
        }
      })
    );

    return NextResponse.json(ordersWithEmails || []);
  } catch (error: any) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
