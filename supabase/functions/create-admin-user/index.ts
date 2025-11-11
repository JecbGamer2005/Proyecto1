import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, password, name, role } = await req.json();

    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({ error: "Email, password, and name are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Missing environment variables" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const createUserResponse = await fetch(
      `${supabaseUrl}/auth/v1/admin/users`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          email_confirm: true,
          user_metadata: {},
        }),
      }
    );

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json();
      return new Response(JSON.stringify({ error: errorData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userData = await createUserResponse.json();
    const userId = userData.user.id;

    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_roles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          auth_id: userId,
          role: role || "employee",
          name,
          email,
        }),
      }
    );

    if (!insertResponse.ok) {
      const errorData = await insertResponse.json();
      return new Response(JSON.stringify({ error: errorData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userProfile = await insertResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        user: userProfile[0],
        message: `User ${name} created successfully`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});