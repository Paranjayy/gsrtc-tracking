# GSRTC Reverse Engineering Findings

## 1. Live Tracking Infrastructure
**Endpoint:** `https://live.gsrtc.org/api/vehicle/live`
**Method:** `POST`
**Authentication:** Relies on a `gsrtc_auth_token` stored in `localStorage`.
**Traffic Pattern:**
- The client periodically polls the `live` endpoint for GPS coordinates.
- A secondary endpoint `https://live.gsrtc.org/api/vehicle/tooltip` is called to fetch trip-specific metadata (Depot, Speed, Direction).

## 2. Booking System Analysis
**Site:** `https://gsrtc.in/site/`
**Mechanism:** Uses a Java-based backend (Struts `.do` actions).
**Search Flow:**
- Source and Destination are submitted via a hidden form to `OPRSOnline/jqreq.do`.
- Results are rendered server-side but can be extracted via the DOM (as seen in the provided snapshots).

## 3. UX Anomalies & Fixes
Official tracking systems often have "absurdities" that increase friction for users:
- **Dash Requirement**: Official tracking (`live.gsrtc.org`) requires a dash (e.g., `GJ-18-Z-6068`) for valid lookups. Our implementation automatically formats the input to ensure successful API matching.
- **Family Sharing**: Official portals lack a deep-linking mechanism, making it impossible to share a live tracking link with family. We implemented a `?track=...` parameter system to enable one-click sharing.
- **Refresh Persistence**: The official site clears tracking state on refresh. Our Nexus app persists the tracked vehicle in the URL.

## 4. Implementation Status
The `GSRTCNexus` dashboard implements all requested features:
- [x] Live Tracking UI with Auto-formatting
- [x] Family Sharing Mechanism (Deep Links)
- [x] Bus Schedule Viewer
- [x] Advanced Filtering & Sorting
- [x] Service Type Grouping
- [x] Grid/List View Toggles
- [x] Mobile-responsive Floating Menu
