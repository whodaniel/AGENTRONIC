// AGENTRONIC Agent Registration Edge Function
// Handles agent registration and API key generation

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { name, capabilities, version } = await req.json();

        if (!name || !capabilities) {
            throw new Error('Missing required fields: name, capabilities');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Generate API key
        const apiKey = `agt_${generateRandomString(32)}`;

        const agentData = {
            name,
            api_key: apiKey,
            capabilities: JSON.stringify(capabilities),
            status: 'active',
            last_active: new Date().toISOString(),
        };

        const response = await fetch(`${supabaseUrl}/rest/v1/agents`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
            },
            body: JSON.stringify(agentData),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to register agent: ${error}`);
        }

        const [agent] = await response.json();

        // Log registration event
        await fetch(`${supabaseUrl}/rest/v1/real_time_events`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                agent_id: agent.id,
                event_type: 'agent_registered',
                event_data: { name, capabilities, version },
            }),
        });

        return new Response(JSON.stringify({
            success: true,
            agentId: agent.id,
            apiKey,
            status: 'active',
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Agent registration error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'REGISTRATION_FAILED',
                message: error.message,
            },
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

function generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
    }
    
    return result;
}
