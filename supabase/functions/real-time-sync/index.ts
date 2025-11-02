// AGENTRONIC Real-time Sync Edge Function
// WebSocket server for agent communication

Deno.serve(async (req) => {
    if (req.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(req);
        
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        
        socket.onopen = () => {
            console.log("Agent connected to real-time sync");
            
            // Send welcome message
            socket.send(JSON.stringify({
                type: 'connected',
                message: 'Connected to AGENTRONIC real-time sync',
                timestamp: Date.now(),
            }));
        };
        
        socket.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                
                // Log event to database
                await fetch(`${supabaseUrl}/rest/v1/real_time_events`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        agent_id: data.agentId,
                        session_id: data.sessionId,
                        event_type: data.type,
                        event_data: data.data,
                    }),
                });
                
                // Handle different event types
                if (data.type === 'midi') {
                    // Process MIDI event
                    socket.send(JSON.stringify({
                        type: 'ack',
                        eventId: data.id,
                        timestamp: Date.now(),
                    }));
                } else if (data.type === 'sessionSync') {
                    // Update session parameters
                    socket.send(JSON.stringify({
                        type: 'syncConfirm',
                        tempo: data.data.tempo,
                        timeSignature: data.data.timeSignature,
                    }));
                } else if (data.type === 'analysis') {
                    // Trigger analysis
                    socket.send(JSON.stringify({
                        type: 'analysisStarted',
                        analysisId: crypto.randomUUID(),
                    }));
                }
                
            } catch (error) {
                console.error('WebSocket message error:', error);
                socket.send(JSON.stringify({
                    type: 'error',
                    message: error.message,
                }));
            }
        };
        
        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        
        socket.onclose = () => {
            console.log("Agent disconnected from real-time sync");
        };
        
        return response;
    }
    
    return new Response("WebSocket endpoint for real-time agent communication", { 
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
    });
});
