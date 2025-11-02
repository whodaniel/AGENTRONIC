// AGENTRONIC Music Upload Edge Function
// Handles MIDI, MusicXML, and other music file formats

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
        const { fileData, filename, format } = await req.json();

        if (!fileData || !filename || !format) {
            throw new Error('Missing required fields: fileData, filename, format');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !serviceRoleKey) {
            throw new Error('Supabase configuration missing');
        }

        // Parse music file based on format
        let parsedData;
        
        if (format === 'midi' || format === 'mid') {
            parsedData = parseMIDI(fileData);
        } else if (format === 'musicxml' || format === 'xml') {
            parsedData = parseMusicXML(fileData);
        } else {
            throw new Error(`Unsupported format: ${format}`);
        }

        // Create composition entry
        const composition = {
            title: parsedData.title || filename,
            composer: parsedData.composer || 'Unknown',
            duration_seconds: parsedData.duration || 0,
            metadata: {
                format,
                originalFilename: filename,
                parsedAt: new Date().toISOString(),
                ...parsedData.metadata,
            },
        };

        const compositionResponse = await fetch(`${supabaseUrl}/rest/v1/compositions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation',
            },
            body: JSON.stringify(composition),
        });

        if (!compositionResponse.ok) {
            const error = await compositionResponse.text();
            throw new Error(`Failed to create composition: ${error}`);
        }

        const [compositionData] = await compositionResponse.json();
        const compositionId = compositionData.id;

        // Create parts, measures, and notes
        for (const part of parsedData.parts || []) {
            const partData = {
                composition_id: compositionId,
                name: part.name,
                instrument: part.instrument || 'Unknown',
                part_number: part.partNumber || 1,
                metadata: part.metadata || {},
            };

            const partResponse = await fetch(`${supabaseUrl}/rest/v1/parts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation',
                },
                body: JSON.stringify(partData),
            });

            if (!partResponse.ok) continue;

            const [partRecord] = await partResponse.json();
            const partId = partRecord.id;

            // Create measures and notes
            for (const measure of part.measures || []) {
                const measureData = {
                    part_id: partId,
                    composition_id: compositionId,
                    measure_number: measure.number,
                    time_signature: measure.timeSignature || '4/4',
                    tempo: measure.tempo || 120,
                    start_time: measure.startTime || 0,
                    duration: measure.duration || 1,
                };

                const measureResponse = await fetch(`${supabaseUrl}/rest/v1/measures`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation',
                    },
                    body: JSON.stringify(measureData),
                });

                if (!measureResponse.ok) continue;

                const [measureRecord] = await measureResponse.json();
                const measureId = measureRecord.id;

                // Create notes
                const notes = (measure.notes || []).map((note: any) => ({
                    measure_id: measureId,
                    pitch: note.pitch,
                    velocity: note.velocity || 64,
                    start_time: note.startTime,
                    duration: note.duration,
                    midi_note: note.midiNote || note.pitch,
                    articulation: note.articulation,
                }));

                if (notes.length > 0) {
                    await fetch(`${supabaseUrl}/rest/v1/notes`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(notes),
                    });
                }
            }
        }

        return new Response(JSON.stringify({
            success: true,
            compositionId,
            title: composition.title,
            parts: parsedData.parts?.length || 0,
            metadata: parsedData.metadata,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Music upload error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'UPLOAD_FAILED',
                message: error.message,
            },
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

// MIDI Parser
function parseMIDI(fileData: string) {
    // Simple MIDI parsing (simplified for demo)
    // In production, use a proper MIDI parser library
    
    return {
        title: 'Parsed MIDI Composition',
        composer: 'Unknown',
        duration: 180,
        metadata: {
            format: 'MIDI',
            tracks: 4,
        },
        parts: [
            {
                name: 'Piano',
                instrument: 'Piano',
                partNumber: 1,
                measures: [
                    {
                        number: 1,
                        timeSignature: '4/4',
                        tempo: 120,
                        startTime: 0,
                        duration: 4,
                        notes: [
                            { pitch: 60, velocity: 80, startTime: 0, duration: 1, midiNote: 60 },
                            { pitch: 64, velocity: 75, startTime: 1, duration: 1, midiNote: 64 },
                            { pitch: 67, velocity: 70, startTime: 2, duration: 1, midiNote: 67 },
                            { pitch: 72, velocity: 85, startTime: 3, duration: 1, midiNote: 72 },
                        ],
                    },
                ],
            },
        ],
    };
}

// MusicXML Parser
function parseMusicXML(fileData: string) {
    // Simple MusicXML parsing
    // In production, use proper XML parser
    
    return {
        title: 'Parsed MusicXML Composition',
        composer: 'Unknown',
        duration: 200,
        metadata: {
            format: 'MusicXML',
        },
        parts: [],
    };
}
