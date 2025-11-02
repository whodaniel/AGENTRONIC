# VST/Max for Live Integration Guide

## Overview
This guide explains how to integrate AGENTRONIC with Ableton Live using VST plugins and Max for Live devices.

## Architecture

### Components
1. **VST Plugin** (C++) - Runs inside Ableton Live
2. **Max for Live Device** (JavaScript) - Alternative Live integration
3. **WebSocket Bridge** - Connects DAW to AGENTRONIC backend
4. **AGENTRONIC Backend** - Processes musical data

### Data Flow
```
Ableton Live MIDI → VST/M4L → WebSocket → AGENTRONIC Backend
                                              ↓
                                    Analysis & Generation
                                              ↓
AGENTRONIC Backend → WebSocket → VST/M4L → Ableton Live
```

## VST Plugin Implementation

### AgtPlugin.h
```cpp
#ifndef AGT_PLUGIN_H
#define AGT_PLUGIN_H

#include "public.sdk/source/vst/vsteditcontroller.h"
#include "public.sdk/source/vst/vstaudioeffect.h"
#include <websocketpp/config/asio_no_tls.hpp>
#include <websocketpp/client.hpp>

namespace Steinberg {
namespace Vst {

class AgtProcessor : public AudioEffect {
public:
    AgtProcessor();
    ~AgtProcessor();

    tresult PLUGIN_API initialize(FUnknown* context) SMTG_OVERRIDE;
    tresult PLUGIN_API terminate() SMTG_OVERRIDE;
    tresult PLUGIN_API process(ProcessData& data) SMTG_OVERRIDE;

    static FUnknown* createInstance(void*) {
        return (IAudioProcessor*)new AgtProcessor();
    }

private:
    void connectWebSocket();
    void sendMIDIEvent(int32 noteNumber, int32 velocity, double timestamp);
    
    websocketpp::client<websocketpp::config::asio> wsClient;
    websocketpp::connection_hdl wsConnection;
    bool connected;
};

class AgtController : public EditController {
public:
    tresult PLUGIN_API initialize(FUnknown* context) SMTG_OVERRIDE;
    
    static FUnknown* createInstance(void*) {
        return (IEditController*)new AgtController();
    }
};

}} // namespaces
#endif
```

### AgtPlugin.cpp
```cpp
#include "AgtPlugin.h"

namespace Steinberg {
namespace Vst {

AgtProcessor::AgtProcessor() : connected(false) {
    setControllerClass(AgtController::cid);
}

AgtProcessor::~AgtProcessor() {
    if (connected) {
        wsClient.close(wsConnection, websocketpp::close::status::normal, "Plugin closed");
    }
}

tresult PLUGIN_API AgtProcessor::initialize(FUnknown* context) {
    tresult result = AudioEffect::initialize(context);
    if (result == kResultTrue) {
        addEventInput(STR16("MIDI In"));
        addAudioOutput(STR16("Audio Out"), SpeakerArr::kStereo);
        
        connectWebSocket();
    }
    return result;
}

void AgtProcessor::connectWebSocket() {
    try {
        wsClient.init_asio();
        
        wsClient.set_open_handler([this](websocketpp::connection_hdl hdl) {
            connected = true;
            wsConnection = hdl;
        });
        
        // Connect to AGENTRONIC backend
        websocketpp::lib::error_code ec;
        auto con = wsClient.get_connection("ws://localhost:8080/vst-sync", ec);
        
        if (!ec) {
            wsClient.connect(con);
            wsClient.run();
        }
    } catch (const std::exception& e) {
        // Log error
    }
}

void AgtProcessor::sendMIDIEvent(int32 noteNumber, int32 velocity, double timestamp) {
    if (!connected) return;
    
    // Create JSON message
    std::string message = "{\"type\":\"midi\",\"note\":" + std::to_string(noteNumber) +
                         ",\"velocity\":" + std::to_string(velocity) +
                         ",\"time\":" + std::to_string(timestamp) + "}";
    
    websocketpp::lib::error_code ec;
    wsClient.send(wsConnection, message, websocketpp::frame::opcode::text, ec);
}

tresult PLUGIN_API AgtProcessor::process(ProcessData& data) {
    IEventList* events = data.inputEvents;
    if (events) {
        int32 numEvents = events->getEventCount();
        for (int32 i = 0; i < numEvents; i++) {
            Event e;
            if (events->getEvent(i, e) == kResultTrue) {
                if (e.type == Event::kNoteOnEvent) {
                    sendMIDIEvent(e.noteOn.pitch, e.noteOn.velocity, e.sampleOffset);
                }
            }
        }
    }
    
    return kResultTrue;
}

tresult PLUGIN_API AgtProcessor::terminate() {
    if (connected) {
        wsClient.close(wsConnection, websocketpp::close::status::normal, "Terminating");
    }
    return AudioEffect::terminate();
}

}} // namespaces
```

## Max for Live Device

### maxforlive-device.js
```javascript
// Max for Live JavaScript device for AGENTRONIC integration

inlets = 1;
outlets = 2;

var ws = null;
var connected = false;
var backendURL = "ws://localhost:8080/vst-sync";

// Initialize WebSocket connection
function connect() {
    try {
        ws = new WebSocket(backendURL);
        
        ws.onopen = function() {
            connected = true;
            post("Connected to AGENTRONIC backend\\n");
            outlet(1, "connected");
        };
        
        ws.onmessage = function(event) {
            var data = JSON.parse(event.data);
            handleBackendMessage(data);
        };
        
        ws.onerror = function(error) {
            post("WebSocket error: " + error + "\\n");
            connected = false;
        };
        
        ws.onclose = function() {
            connected = false;
            post("Disconnected from AGENTRONIC\\n");
            outlet(1, "disconnected");
        };
    } catch (e) {
        post("Connection error: " + e + "\\n");
    }
}

// Handle MIDI input from Live
function list() {
    if (!connected) return;
    
    var args = arrayfromargs(arguments);
    var pitch = args[0];
    var velocity = args[1];
    
    var message = {
        type: "midi",
        note: pitch,
        velocity: velocity,
        time: new Date().getTime()
    };
    
    ws.send(JSON.stringify(message));
}

// Handle messages from AGENTRONIC backend
function handleBackendMessage(data) {
    if (data.type === "generatedNote") {
        // Output MIDI note to Live
        outlet(0, [data.note, data.velocity]);
    } else if (data.type === "analysis") {
        // Output analysis results
        outlet(1, ["analysis", JSON.stringify(data.results)]);
    }
}

// Sync session parameters
function syncSession() {
    if (!connected) return;
    
    var liveAPI = new LiveAPI("live_set");
    var tempo = liveAPI.get("tempo");
    var timeSignature = liveAPI.get("signature_numerator") + "/" + 
                       liveAPI.get("signature_denominator");
    
    var sessionData = {
        type: "sessionSync",
        tempo: tempo,
        timeSignature: timeSignature,
        isPlaying: liveAPI.get("is_playing")
    };
    
    ws.send(JSON.stringify(sessionData));
}

// Initialize
function loadbang() {
    connect();
}

// Cleanup
function notifydeleted() {
    if (ws && connected) {
        ws.close();
    }
}
```

## Backend WebSocket Endpoint

### Edge Function: vst-sync

Create `supabase/functions/vst-sync/index.ts`:

```typescript
Deno.serve(async (req) => {
    // Handle WebSocket upgrade
    if (req.headers.get("upgrade") === "websocket") {
        const { socket, response } = Deno.upgradeWebSocket(req);
        
        socket.onopen = () => {
            console.log("VST client connected");
        };
        
        socket.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            
            if (data.type === "midi") {
                // Store MIDI event in database
                // Process with analysis engine
                // Broadcast to other agents
                
                socket.send(JSON.stringify({
                    type: "ack",
                    timestamp: Date.now()
                }));
            } else if (data.type === "sessionSync") {
                // Update session parameters
                socket.send(JSON.stringify({
                    type: "syncConfirm",
                    tempo: data.tempo
                }));
            }
        };
        
        socket.onclose = () => {
            console.log("VST client disconnected");
        };
        
        return response;
    }
    
    return new Response("WebSocket endpoint", { status: 400 });
});
```

## Building the VST Plugin

### Requirements
- Steinberg VST3 SDK
- CMake 3.15+
- C++17 compiler
- WebSocket++ library

### Build Steps
```bash
# Clone VST3 SDK
git clone https://github.com/steinbergmedia/vst3sdk.git

# Install WebSocket++
git clone https://github.com/zaphoyd/websocketpp.git

# Create build directory
mkdir build && cd build

# Configure with CMake
cmake .. -DSMTG_ADD_VST3_PLUGINS_SAMPLES=OFF

# Build
cmake --build . --config Release

# Install plugin to system location
# macOS: ~/Library/Audio/Plug-Ins/VST3/
# Windows: C:\\Program Files\\Common Files\\VST3\\
```

## Usage Instructions

### 1. Start AGENTRONIC Backend
```bash
# Start WebSocket server
npm run start:backend
```

### 2. Load VST in Ableton Live
- Open Ableton Live
- Add AGENTRONIC VST to a MIDI track
- VST will auto-connect to backend

### 3. Enable Real-time Processing
- Play MIDI notes in Live
- AGENTRONIC analyzes in real-time
- Generated content sent back to Live

### 4. Jam Mode
- Multiple agents can collaborate
- Live session synced across all agents
- Real-time harmonic suggestions

## API Reference

### WebSocket Message Types

**From DAW to Backend:**
```json
{
  "type": "midi",
  "note": 60,
  "velocity": 100,
  "time": 1234567890
}
```

**From Backend to DAW:**
```json
{
  "type": "generatedNote",
  "note": 64,
  "velocity": 80,
  "duration": 0.5
}
```

## Troubleshooting

### Connection Issues
- Verify backend is running on correct port
- Check firewall settings
- Ensure WebSocket URL is correct

### MIDI Not Sending
- Check MIDI routing in Live
- Verify VST is on active track
- Check console for errors

### Performance Issues
- Reduce buffer size in preferences
- Enable hardware acceleration
- Limit concurrent agents
