"""
Garuda A.S.T.R.A — Mock WebSocket Server (FastAPI)

A local mock WebSocket server that simulates the backend command center.
When the real backend is ready, just change WS_URL in App.tsx to point
to the production server. No other code changes needed.

Features:
- Receives telemetry from mobile app
- Sends simulated CCTV face-match alerts at configurable intervals
- Responds to heartbeat pings with pongs
- Logs all received messages with timestamps
- Serves a simple dashboard at GET /

Usage:
    pip install fastapi uvicorn websockets
    python mock_ws_server.py

    Or with uvicorn directly:
    uvicorn mock_ws_server:app --host 0.0.0.0 --port 8765 --reload

The mobile app connects to: ws://YOUR_PC_IP:8765/ws
"""

import asyncio
import json
import random
import time
from datetime import datetime
from typing import Set

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

app = FastAPI(title="Garuda A.S.T.R.A Mock Command Center")

# ---------- State ----------

connected_clients: Set[WebSocket] = set()
active_clients: dict = {}  # Maps WebSocket -> dict of client info
telemetry_log: list = []

# ---------- Mock Alert Data ----------

MOCK_ALERTS = [
    {
        "type": "alert",
        "payload": {
            "title": "Aarav Mehta",
            "subtitle": "Missing Person — Camera Match",
            "threatLevel": "HIGH",
            "matchPercentage": 94,
            "fileNo": "#MP-23854",
            "lastSeenLocation": "Marine Drive, Sector 1, CAM-224-B",
            "lastSeenTime": "Just Now",
            "latitude": 18.9431,
            "longitude": 72.8246,
            "telemetry": {
                "azimuth": "244.18°",
                "zoom": "4.5X",
                "lens": "85MM",
                "signal": "100%",
            },
        },
    },
    {
        "type": "alert",
        "payload": {
            "title": "Vikram Singh",
            "subtitle": "Wanted Person — Camera Match",
            "threatLevel": "HIGH",
            "matchPercentage": 91,
            "fileNo": "#WP-11202",
            "lastSeenLocation": "CST Station, Platform 4, CAM-CST-07",
            "lastSeenTime": "Just Now",
            "latitude": 18.9398,
            "longitude": 72.8355,
            "telemetry": {
                "azimuth": "122.50°",
                "zoom": "3.2X",
                "lens": "50MM",
                "signal": "98%",
            },
        },
    },
    {
        "type": "alert",
        "payload": {
            "title": "Priya Sharma",
            "subtitle": "Missing Person — Camera Match",
            "threatLevel": "MODERATE",
            "matchPercentage": 78,
            "fileNo": "#MP-09432",
            "lastSeenLocation": "Bandra Station West, CAM-BDR-15",
            "lastSeenTime": "Just Now",
            "latitude": 19.0544,
            "longitude": 72.8404,
            "telemetry": {
                "azimuth": "310.72°",
                "zoom": "2.0X",
                "lens": "35MM",
                "signal": "95%",
            },
        },
    },
    {
        "type": "alert",
        "payload": {
            "title": "Ravi Kumar",
            "subtitle": "Missing Child — Camera Match",
            "threatLevel": "HIGH",
            "matchPercentage": 97,
            "fileNo": "#MP-00884",
            "lastSeenLocation": "Dadar Station West, CAM-DDR-11",
            "lastSeenTime": "Just Now",
            "latitude": 19.0178,
            "longitude": 72.8434,
            "telemetry": {
                "azimuth": "180.00°",
                "zoom": "5.0X",
                "lens": "100MM",
                "signal": "99%",
            },
        },
    },
]

# Alert interval: send a random alert every N seconds (set to 0 to disable)
ALERT_INTERVAL_SECONDS = 0


# ---------- Background alert sender ----------

async def send_periodic_alerts():
    """Send a random mock alert to all connected clients at intervals."""
    while True:
        if ALERT_INTERVAL_SECONDS <= 0:
            await asyncio.sleep(5)
            continue
        await asyncio.sleep(ALERT_INTERVAL_SECONDS)
        if not connected_clients:
            continue

        alert = random.choice(MOCK_ALERTS)
        # Add unique ID and fresh timestamp
        alert_with_id = json.loads(json.dumps(alert))
        alert_with_id["payload"]["id"] = f"alert-mock-{int(time.time())}-{random.randint(100, 999)}"
        alert_with_id["payload"]["lastSeenTime"] = "Just Now"

        message = json.dumps(alert_with_id)
        timestamp = datetime.now().strftime("%H:%M:%S")

        print(f"\n🚨 [{timestamp}] BROADCASTING ALERT: {alert_with_id['payload']['title']} "
              f"({alert_with_id['payload']['threatLevel']}) to {len(connected_clients)} client(s)")

        disconnected = set()
        for client in connected_clients:
            try:
                await client.send_text(message)
            except Exception:
                disconnected.add(client)

        connected_clients.difference_update(disconnected)


@app.on_event("startup")
async def startup():
    asyncio.create_task(send_periodic_alerts())
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║           GARUDA A.S.T.R.A — MOCK COMMAND CENTER            ║
╠══════════════════════════════════════════════════════════════╣
║  WebSocket endpoint : ws://0.0.0.0:8765/ws                  ║
║  Dashboard          : http://0.0.0.0:8765/                   ║
║  Alert interval     : {ALERT_INTERVAL_SECONDS}s                                      ║
║                                                              ║
║  Waiting for mobile app connections...                       ║
╚══════════════════════════════════════════════════════════════╝
""")


# ---------- WebSocket Endpoint ----------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    connected_clients.add(ws)
    client_ip = ws.client.host if ws.client else "Unknown"
    active_clients[ws] = {
        "ip": client_ip,
        "connected_at": datetime.now().strftime("%H:%M:%S"),
        "officer_id": "—",
        "officer_name": "—",
        "officer_rank": "—",
        "battery": "—",
        "charging": False,
        "lat": "—",
        "lng": "—",
        "latency_ms": "—",
        "last_seen": datetime.now().strftime("%H:%M:%S"),
    }
    
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"\n✅ [{timestamp}] Client connected ({client_ip}). Total: {len(connected_clients)}")

    # Send welcome message
    await ws.send_json({
        "type": "system",
        "message": "Connected to Garuda A.S.T.R.A Command Center",
        "timestamp": datetime.now().isoformat(),
    })

    try:
        while True:
            data = await ws.receive_text()
            timestamp = datetime.now().strftime("%H:%M:%S")
            if ws in active_clients:
                active_clients[ws]["last_seen"] = timestamp

            try:
                parsed = json.loads(data)
                msg_type = parsed.get("type", "unknown")

                # Handle heartbeat pings
                if msg_type == "ping":
                    ping_time = parsed.get("timestamp")
                    latency = "—"
                    if ping_time:
                        try:
                            # calculate latency in ms
                            latency = f"{int((time.time() * 1000) - float(ping_time))}ms"
                        except Exception:
                            pass
                    
                    if ws in active_clients:
                        active_clients[ws]["latency_ms"] = latency
                        
                    await ws.send_json({"type": "pong", "timestamp": time.time()})
                    continue

                # Handle telemetry
                if msg_type == "telemetry":
                    payload = parsed.get("payload", {})
                    telemetry_log.append({
                        "received_at": datetime.now().isoformat(),
                        **payload,
                    })
                    # Keep only last 100 entries
                    if len(telemetry_log) > 100:
                        telemetry_log.pop(0)

                    gps = payload.get("gps", {})
                    lat = gps.get('lat', '—')
                    lng = gps.get('lng', '—')

                    # Update active client info
                    if ws in active_clients:
                        active_clients[ws].update({
                            "officer_id": payload.get("officer_id", "—"),
                            "officer_name": payload.get("officer_name", "—"),
                            "officer_rank": payload.get("officer_rank", "—"),
                            "battery": payload.get("battery", "—"),
                            "charging": payload.get("charging", False),
                            "lat": lat,
                            "lng": lng,
                        })

                    lat_print = f"{lat:.4f}" if isinstance(lat, (int, float)) else str(lat)
                    lng_print = f"{lng:.4f}" if isinstance(lng, (int, float)) else str(lng)
                    print(
                        f"📡 [{timestamp}] TELEMETRY from {payload.get('officer_id', '?')}: "
                        f"GPS({lat_print}, {lng_print}) "
                        f"Battery: {payload.get('battery', '?')}% "
                        f"Event: {payload.get('event_type', 'PERIODIC')}"
                    )
                    continue

                # Log other messages
                print(f"📨 [{timestamp}] Message ({msg_type}): {json.dumps(parsed, indent=2)[:200]}")

            except json.JSONDecodeError:
                print(f"⚠️ [{timestamp}] Non-JSON message: {data[:100]}")

    except WebSocketDisconnect:
        pass
    finally:
        connected_clients.discard(ws)
        if ws in active_clients:
            del active_clients[ws]
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"\n🔌 [{timestamp}] Client disconnected. Total: {len(connected_clients)}")


# ---------- Dashboard ----------

@app.get("/")
async def dashboard():
    client_count = len(connected_clients)
    recent_telemetry = telemetry_log[-10:] if telemetry_log else []

    # Build active clients rows
    active_rows = ""
    for ws, client in active_clients.items():
        lat = client.get('lat', '—')
        lng = client.get('lng', '—')
        lat_str = f"{lat:.4f}" if isinstance(lat, (int, float)) else str(lat)
        lng_str = f"{lng:.4f}" if isinstance(lng, (int, float)) else str(lng)
        
        battery = client.get('battery', '—')
        charging_icon = " ⚡" if client.get('charging') else ""
        
        latency = client.get('latency_ms', '—')
        latency_class = "latency-good"
        if latency != '—':
            try:
                ms = int(latency.replace("ms", ""))
                if ms > 300:
                    latency_class = "latency-bad"
                elif ms > 150:
                    latency_class = "latency-warning"
            except Exception:
                pass

        active_rows += f"""
        <tr>
            <td><code style="color: #00e5ff; font-weight: bold;">{client.get('ip', 'Unknown')}</code></td>
            <td>{client.get('connected_at', '—')}</td>
            <td>
                <span style="font-weight: 600; color: #fff;">{client.get('officer_name', '—')}</span><br>
                <small style="color: #64748b;">{client.get('officer_rank', '—')} ({client.get('officer_id', '—')})</small>
            </td>
            <td>
                <span class="badge badge-cyan">{battery}%{charging_icon}</span>
            </td>
            <td><code style="color: #00e676;">{lat_str}, {lng_str}</code></td>
            <td><span class="{latency_class}" style="font-weight: bold; font-family: 'JetBrains Mono', monospace;">{latency}</span></td>
            <td>{client.get('last_seen', '—')}</td>
        </tr>
        """

    # Build telemetry rows
    telemetry_rows = ""
    for t in reversed(recent_telemetry):
        gps = t.get("gps", {})
        lat = gps.get('lat', '—')
        lng = gps.get('lng', '—')
        lat_str = f"{lat:.4f}" if isinstance(lat, (int, float)) else str(lat)
        lng_str = f"{lng:.4f}" if isinstance(lng, (int, float)) else str(lng)
        
        telemetry_rows += f"""
        <tr>
            <td><code style="color: #64748b;">{t.get('received_at', '—')[11:19]}</code></td>
            <td><strong>{t.get('officer_id', '—')}</strong></td>
            <td>{lat_str}, {lng_str}</td>
            <td>{t.get('battery', '—')}%</td>
            <td><span class="badge badge-cyan">{t.get('event_type', '—')}</span></td>
            <td>{'🟢' if t.get('socket_connected') else '🔴'}</td>
        </tr>
        """

    return HTMLResponse(f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Garuda A.S.T.R.A — Tactical Command Center</title>
        <meta http-equiv="refresh" content="5">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
            :root {{
                --bg-color: #06080c;
                --card-bg: #0b0f17;
                --border-color: #1e2633;
                --text-color: #e2e8f0;
                --cyan: #00e5ff;
                --yellow: #ffd600;
                --orange: #ff3d00;
                --green: #00e676;
                --red: #ff1744;
            }}
            body {{
                background-color: var(--bg-color);
                color: var(--text-color);
                font-family: 'Inter', sans-serif;
                padding: 30px;
                margin: 0;
            }}
            h1, h2, h3 {{
                font-family: 'Orbitron', sans-serif;
                letter-spacing: 1px;
                margin-top: 0;
            }}
            h1 {{
                color: var(--cyan);
                font-size: 24px;
                border-bottom: 2px solid var(--border-color);
                padding-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                text-shadow: 0 0 10px rgba(0, 229, 255, 0.2);
            }}
            .live-indicator {{
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Orbitron', sans-serif;
                font-size: 12px;
                background: rgba(0, 230, 118, 0.08);
                border: 1px solid var(--green);
                color: var(--green);
                padding: 6px 12px;
                border-radius: 4px;
                animation: pulse 2s infinite;
            }}
            @keyframes pulse {{
                0% {{ opacity: 0.7; }}
                50% {{ opacity: 1; }}
                100% {{ opacity: 0.7; }}
            }}
            .grid {{
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
                margin-top: 20px;
            }}
            .kpi-card {{
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
            }}
            .kpi-card:hover {{
                border-color: var(--cyan);
                transform: translateY(-2px);
            }}
            .kpi-label {{
                color: #64748b;
                font-size: 11px;
                text-transform: uppercase;
                font-weight: 600;
                letter-spacing: 0.5px;
                margin-bottom: 6px;
            }}
            .kpi-value {{
                font-size: 28px;
                font-weight: 700;
                font-family: 'Orbitron', sans-serif;
            }}
            .control-panel {{
                background: var(--card-bg);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 24px;
                margin-bottom: 30px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            }}
            .btn-group {{
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 15px;
            }}
            .btn {{
                background: rgba(0, 229, 255, 0.05);
                color: var(--cyan);
                border: 1px solid var(--cyan);
                padding: 12px 24px;
                border-radius: 6px;
                font-family: 'Orbitron', sans-serif;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 8px;
            }}
            .btn:hover {{
                background: var(--cyan);
                color: #000;
                box-shadow: 0 0 15px rgba(0, 229, 255, 0.4);
                transform: translateY(-1px);
            }}
            .btn-high {{
                background: rgba(255, 61, 0, 0.05);
                color: var(--orange);
                border-color: var(--orange);
            }}
            .btn-high:hover {{
                background: var(--orange);
                color: #fff;
                box-shadow: 0 0 15px rgba(255, 61, 0, 0.4);
            }}
            .btn-moderate {{
                background: rgba(255, 214, 0, 0.05);
                color: var(--yellow);
                border-color: var(--yellow);
            }}
            .btn-moderate:hover {{
                background: var(--yellow);
                color: #000;
                box-shadow: 0 0 15px rgba(255, 214, 0, 0.4);
            }}
            .section-header {{
                color: var(--cyan);
                font-size: 18px;
                margin-top: 30px;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
            }}
            table {{
                width: 100%;
                border-collapse: collapse;
                background: var(--card-bg);
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                border: 1px solid var(--border-color);
                margin-bottom: 30px;
            }}
            th {{
                background: #111622;
                color: var(--cyan);
                padding: 12px 18px;
                text-align: left;
                font-size: 11px;
                letter-spacing: 1px;
                text-transform: uppercase;
                font-weight: 700;
                border-bottom: 1px solid var(--border-color);
            }}
            td {{
                padding: 14px 18px;
                border-bottom: 1px solid var(--border-color);
                font-size: 13px;
            }}
            tr:last-child td {{
                border-bottom: none;
            }}
            tr:hover td {{
                background: rgba(255, 255, 255, 0.02);
            }}
            .badge {{
                display: inline-block;
                padding: 3px 8px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 11px;
                text-transform: uppercase;
            }}
            .badge-cyan {{
                background: rgba(0, 229, 255, 0.1);
                color: var(--cyan);
                border: 1px solid rgba(0, 229, 255, 0.2);
            }}
            .latency-good {{
                color: var(--green);
            }}
            .latency-warning {{
                color: var(--yellow);
            }}
            .latency-bad {{
                color: var(--red);
            }}
            .toast {{
                position: fixed;
                bottom: 25px;
                right: -350px;
                background: #0f172a;
                border-left: 4px solid var(--cyan);
                border-top: 1px solid var(--border-color);
                border-right: 1px solid var(--border-color);
                border-bottom: 1px solid var(--border-color);
                border-radius: 6px;
                padding: 16px 20px;
                width: 280px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                gap: 6px;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                z-index: 1000;
            }}
            .toast.show {{
                right: 25px;
            }}
            .toast-header {{
                font-family: 'Orbitron', sans-serif;
                font-size: 12px;
                font-weight: 700;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }}
            .toast-body {{
                font-size: 13px;
                color: #94a3b8;
            }}
            code {{
                font-family: 'JetBrains Mono', monospace;
            }}
        </style>
    </head>
    <body>
        <h1>
            <span class="header-logo">🦅 GARUDA A.S.T.R.A — COMMAND STATION</span>
            <span class="live-indicator">● LIVE TELEMETRY</span>
        </h1>

        <div class="grid">
            <div class="kpi-card">
                <div class="kpi-label">Active Connections</div>
                <div class="kpi-value" style="color: var(--cyan);">{client_count}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Alert Dispatch Mode</div>
                <div class="kpi-value" style="color: var(--yellow);">{f"{ALERT_INTERVAL_SECONDS}s" if ALERT_INTERVAL_SECONDS > 0 else "MANUAL"}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Telemetry Packets</div>
                <div class="kpi-value" style="color: var(--green);">{len(telemetry_log)}</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Server Status</div>
                <div class="kpi-value" style="color: #fff;">ONLINE</div>
            </div>
        </div>

        <div class="control-panel">
            <h3 style="margin-bottom: 8px; color: #fff;">🎯 TACTICAL ALERT GENERATOR</h3>
            <p style="color: #64748b; font-size: 12px; margin-top: 0; margin-bottom: 20px;">
                Directly push face-match and operational alerts to the connected mobile devices via WebSocket.
            </p>
            <div class="btn-group">
                <button class="btn" onclick="triggerAlert('')">🚨 Send Random Alert</button>
                <button class="btn btn-high" onclick="triggerAlert('HIGH')">🔥 Dispatch High Threat Alert</button>
                <button class="btn btn-moderate" onclick="triggerAlert('MODERATE')">⚠️ Dispatch Moderate Threat Alert</button>
            </div>
        </div>

        <div class="section-header">📱 CONNECTED TACTICAL UNITS ({client_count})</div>
        <table>
            <tr>
                <th>Device IP</th>
                <th>Connect Time</th>
                <th>Active Officer</th>
                <th>Battery Level</th>
                <th>Current GPS Coordinates</th>
                <th>Latency</th>
                <th>Last Update</th>
            </tr>
            {active_rows if active_rows else '<tr><td colspan="7" style="text-align:center; color:#64748b; padding: 25px;">No units currently active. Log in to the mobile app.</td></tr>'}
        </table>

        <div class="section-header">📡 LIVE TELEMETRY STREAM (LAST 10)</div>
        <table>
            <tr>
                <th>Timestamp</th>
                <th>Officer ID</th>
                <th>GPS Location</th>
                <th>Battery</th>
                <th>Telemetry Trigger</th>
                <th>Socket</th>
            </tr>
            {telemetry_rows if telemetry_rows else '<tr><td colspan="6" style="text-align:center; color:#64748b; padding: 25px;">No telemetry logs received. Active duty starts telemetry stream.</td></tr>'}
        </table>

        <!-- Interactive Toast Notification -->
        <div id="toast" class="toast">
            <div class="toast-header">
                <span id="toast-title" style="color: var(--cyan);">ALERT DISPATCHED</span>
                <span style="font-size: 11px; color: #64748b;">NOW</span>
            </div>
            <div id="toast-body" class="toast-body">
                Alert details will display here...
            </div>
        </div>

        <script>
            async function triggerAlert(threat) {{
                try {{
                    const url = '/send-alert' + (threat ? '?threat=' + threat : '');
                    const response = await fetch(url, {{ method: 'POST' }});
                    const data = await response.json();
                    
                    const toast = document.getElementById('toast');
                    const toastTitle = document.getElementById('toast-title');
                    const toastBody = document.getElementById('toast-body');
                    
                    if (data.status === 'sent') {{
                        toast.style.borderLeftColor = data.threat === 'HIGH' ? 'var(--orange)' : 'var(--yellow)';
                        toastTitle.textContent = `🚨 ${{data.threat}} ALERT DISPATCHED`;
                        toastTitle.style.color = data.threat === 'HIGH' ? 'var(--orange)' : 'var(--yellow)';
                        toastBody.innerHTML = `Successfully dispatched target match to **${{data.sent_to}}** units.<br><br>Target: **${{data.alert}}**`;
                    }} else {{
                        toast.style.borderLeftColor = 'var(--red)';
                        toastTitle.textContent = '❌ DISPATCH FAILED';
                        toastTitle.style.color = 'var(--red)';
                        toastBody.textContent = data.message || 'Unknown error occurred.';
                    }}
                    
                    toast.classList.add('show');
                    setTimeout(() => {{
                        toast.classList.remove('show');
                    }}, 4500);
                }} catch (err) {{
                    console.error('Failed to trigger alert:', err);
                }}
            }}
        </script>
    </body>
    </html>
    """)


@app.post("/send-alert")
async def send_manual_alert(threat: str = None):
    """Manually trigger a random or threat-filtered alert to all connected clients."""
    if not connected_clients:
        return {"status": "no_clients", "message": "No mobile apps connected"}

    # Filter alerts by threat level if provided
    eligible_alerts = MOCK_ALERTS
    if threat:
        eligible_alerts = [a for a in MOCK_ALERTS if a["payload"]["threatLevel"].upper() == threat.upper()]
        if not eligible_alerts:
            eligible_alerts = MOCK_ALERTS

    alert = random.choice(eligible_alerts)
    alert_with_id = json.loads(json.dumps(alert))
    alert_with_id["payload"]["id"] = f"alert-manual-{int(time.time())}"
    alert_with_id["payload"]["lastSeenTime"] = "Just Now"

    message = json.dumps(alert_with_id)

    sent_count = 0
    for client in list(connected_clients):
        try:
            await client.send_text(message)
            sent_count += 1
        except Exception:
            connected_clients.discard(client)
            if client in active_clients:
                del active_clients[client]

    return {
        "status": "sent",
        "alert": alert_with_id["payload"]["title"],
        "threat": alert_with_id["payload"]["threatLevel"],
        "sent_to": sent_count,
    }


# ---------- Run ----------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8765)
