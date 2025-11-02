// AGENTRONIC Music Generation Edge Function
// Generates melodies, harmonies, and orchestrations

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
        const { type, parameters, baseCompositionId } = await req.json();

        if (!type || !parameters) {
            throw new Error('Missing required fields: type, parameters');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        let generatedData;

        switch (type) {
            case 'melody':
                generatedData = generateMelody(parameters);
                break;
            case 'harmony':
                generatedData = generateHarmony(parameters);
                break;
            case 'orchestration':
                generatedData = generateOrchestration(parameters);
                break;
            default:
                throw new Error(`Unknown generation type: ${type}`);
        }

        // Create new composition with generated content
        const composition = {
            title: `Generated ${type} - ${parameters.key || 'C'} ${parameters.style || 'Classical'}`,
            composer: 'AGENTRONIC AI',
            duration_seconds: generatedData.duration,
            metadata: {
                generated: true,
                type,
                parameters,
                generatedAt: new Date().toISOString(),
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
            throw new Error('Failed to create composition');
        }

        const [compositionData] = await compositionResponse.json();

        return new Response(JSON.stringify({
            success: true,
            compositionId: compositionData.id,
            type,
            generatedContent: generatedData,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Generation error:', error);
        return new Response(JSON.stringify({
            error: {
                code: 'GENERATION_FAILED',
                message: error.message,
            },
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});

function generateMelody(params: any) {
    const { key = 'C', length = 16, style = 'classical' } = params;
    const scale = getScale(key);
    const notes = [];

    for (let i = 0; i < length; i++) {
        const pitch = scale[Math.floor(Math.random() * scale.length)] + 60;
        notes.push({
            pitch,
            velocity: 64 + Math.floor(Math.random() * 32),
            startTime: i * 0.5,
            duration: 0.5,
            midiNote: pitch,
        });
    }

    return {
        notes,
        duration: length * 0.5,
        metadata: { key, style, noteCount: length },
    };
}

function generateHarmony(params: any) {
    const { key = 'C', progression = ['I', 'IV', 'V', 'I'] } = params;
    const chords = [];

    progression.forEach((chord, i) => {
        chords.push({
            rootNote: key,
            chordType: 'major',
            startTime: i * 2,
            duration: 2,
            notes: getChordNotes(key, 'major'),
        });
    });

    return {
        chords,
        duration: progression.length * 2,
        metadata: { key, progression },
    };
}

function generateOrchestration(params: any) {
    const { instruments = ['violin', 'viola', 'cello'], length = 16 } = params;
    const parts = [];

    instruments.forEach((instrument, idx) => {
        parts.push({
            name: instrument,
            instrument,
            partNumber: idx + 1,
            notes: generateMelody({ length }).notes,
        });
    });

    return {
        parts,
        duration: length * 0.5,
        metadata: { instruments },
    };
}

function getScale(key: string): number[] {
    const intervals = [0, 2, 4, 5, 7, 9, 11];
    const keyOffset = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(key);
    return intervals.map(interval => (keyOffset + interval) % 12);
}

function getChordNotes(root: string, type: string): number[] {
    const rootPitch = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(root);
    
    if (type === 'major') {
        return [rootPitch, rootPitch + 4, rootPitch + 7];
    } else if (type === 'minor') {
        return [rootPitch, rootPitch + 3, rootPitch + 7];
    }
    
    return [rootPitch];
}
