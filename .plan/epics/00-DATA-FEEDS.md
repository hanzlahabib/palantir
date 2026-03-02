# PALANTIR — Open Source Data Feed Registry

## Complete API & Feed Documentation

---

### FEED 01: Satellite TLEs (CelesTrak)
- **URL**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle`
- **Alt URL**: `https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json-pretty`
- **Auth**: None required
- **Format**: TLE (Two-Line Element) or JSON
- **Update Rate**: Every 4-8 hours
- **Rate Limit**: Reasonable use (no hard limit documented)
- **Data Fields**: Satellite name, TLE line 1 (epoch, inclination, RAAN), TLE line 2 (eccentricity, argument of perigee, mean anomaly, mean motion)
- **Groups Available**: active, stations, visual, weather, noaa, goes, resource, sarsat, dmc, tdrss, argos, planet, spire, geo, intelsat, ses, iridium, iridium-NEXT, starlink, oneweb, globalstar, amateur, gps-ops, glonass, galileo, beidou, sbas, nnss, musson, science, geodetic, engineering, education, military, radar, cubesat, tle-new, supplemental, last-30-days
- **Processing**: Use `satellite.js` npm package for SGP4/SDP4 propagation to get real-time lat/lon/alt
- **Notes**: Free, reliable, no registration needed. CelesTrak is maintained by Dr. T.S. Kelso and is the de facto standard for TLE data.

### FEED 02: Satellite TLEs Backup (Space-Track.org)
- **URL**: `https://www.space-track.org/basicspacedata/query/class/gp/EPOCH/%3Enow-30/orderby/NORAD_CAT_ID/format/tle`
- **Auth**: Free registration required (username + password, basic auth)
- **Format**: TLE, 3LE, JSON, CSV, XML
- **Update Rate**: Continuous (query anytime)
- **Rate Limit**: 300 requests/hour, 20 requests/minute
- **Data Fields**: Full GP (General Perturbations) data including creation date, decay date, object type
- **Notes**: Official US Space Force data. OAuth2 client credentials flow required for accounts created after March 2025. More comprehensive than CelesTrak but requires auth.

### FEED 03: Commercial Flights (OpenSky Network)
- **URL**: `https://opensky-network.org/api/states/all`
- **Auth**: Free registration recommended (anonymous limited to 400 credits/day)
- **Format**: JSON
- **Update Rate**: Every 5-10 seconds (polling)
- **Rate Limit**: Anonymous: 400 credits/day. Registered: 4000 credits/day. 1 request = 1 credit.
- **Data Fields per aircraft**: icao24 (hex), callsign, origin_country, time_position, last_contact, longitude, latitude, baro_altitude (meters), on_ground (bool), velocity (m/s), true_track (degrees), vertical_rate (m/s), sensors, geo_altitude, squawk, spi, position_source
- **Bounding Box Filter**: `?lamin=45.8389&lomin=5.9962&lamax=47.8229&lomax=10.5226` (reduces payload)
- **Notes**: Community-driven ADS-B network. ~30,000 receivers worldwide. Best free option for global flight data. Squawk codes 7500/7600/7700 indicate emergencies.

### FEED 04: Military Flights (ADS-B Exchange)
- **URL**: `https://globe.adsbexchange.com/data/aircraft.json` (or V2 API endpoints)
- **Alt URL**: `https://adsbexchange.com/api/aircraft/v2/all` (paid tier)
- **Auth**: API key for V2 (paid plans start at ~$10/month for hobbyists)
- **Format**: JSON
- **Update Rate**: Every 5-15 seconds
- **Key Feature**: Does NOT filter military aircraft. Shows everything including military, government, and blocked aircraft that FlightRadar24/FlightAware hide.
- **Data Fields**: hex (ICAO), type (aircraft ICAO type code), flight (callsign), alt_baro, alt_geom, gs (ground speed), track, lat, lon, category, squawk, emergency, mil (military flag)
- **Notes**: The gold standard for military OSINT aviation. Crowdsourced ADS-B data from volunteer feeders.

### FEED 05: Military Flights Alternative (airplanes.live)
- **URL**: `https://api.airplanes.live/v2/mil` (military only)
- **Alt URL**: `https://api.airplanes.live/v2/point/{lat}/{lon}/{radius}` (area search)
- **Auth**: None required
- **Format**: JSON
- **Update Rate**: ~5 seconds
- **Rate Limit**: Reasonable use
- **Data Fields**: Same as ADS-B Exchange format (hex, flight, lat, lon, alt, gs, track, category, mil flag)
- **Notes**: Free, community-driven alternative to ADS-B Exchange. Specifically has a military-only endpoint. Excellent for OSINT.

### FEED 06: Ship Tracking (aisstream.io)
- **URL**: `wss://stream.aisstream.io/v0/stream` (WebSocket)
- **Auth**: Free API key required (register at aisstream.io)
- **Format**: JSON over WebSocket
- **Update Rate**: Real-time streaming
- **Subscribe Message**: `{"APIKey":"YOUR_KEY","BoundingBoxes":[[[-90,-180],[90,180]]],"FilterMessageTypes":["PositionReport"]}`
- **Data Fields**: MMSI, shipName, shipType, latitude, longitude, cog (course over ground), sog (speed over ground), heading, destination, draught, eta, imo, callSign, flag
- **Ship Type Codes**: 30=Fishing, 60-69=Passenger, 70-79=Cargo, 80-89=Tanker, 35=Military
- **Notes**: Best free real-time AIS streaming API. WebSocket-based, very efficient.

### FEED 07: Ship Tracking Alternative (AISHub)
- **URL**: `http://data.aishub.net/ws.php?username=YOUR_KEY&format=1&output=json`
- **Auth**: Free (requires sharing your own AIS data feed)
- **Format**: JSON, XML, CSV
- **Update Rate**: Every 1-5 minutes
- **Notes**: Cooperative model — you share AIS data, you get access. Good supplementary source.

### FEED 08: Earthquakes (USGS)
- **URL**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
- **Alt URLs**: `all_hour.geojson`, `all_week.geojson`, `all_month.geojson`, `significant_day.geojson`, `2.5_day.geojson`, `4.5_day.geojson`
- **Custom Query**: `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minmagnitude=2.5&starttime=2026-03-01`
- **Auth**: None required
- **Format**: GeoJSON (FeatureCollection)
- **Update Rate**: Every 1-5 minutes
- **Data Fields per quake**: mag (magnitude), place (description), time (unix ms), updated, url, detail, felt, cdi, mmi, alert, status, tsunami, sig, net, code, ids, types, nst, dmin, rms, gap, magType, type, coordinates [lon, lat, depth_km]
- **Notes**: US Geological Survey. The most authoritative earthquake data source. Completely free, no registration.

### FEED 09: Wildfires (NASA FIRMS)
- **URL**: `https://firms.modaps.eosdis.nasa.gov/api/area/csv/{MAP_KEY}/VIIRS_SNPP_NRT/world/1`
- **Alt Sensors**: `VIIRS_NOAA20_NRT`, `MODIS_NRT`, `VIIRS_NOAA21_NRT`
- **Auth**: Free MAP_KEY required (register at firms.modaps.eosdis.nasa.gov/api/map_key)
- **Format**: CSV or JSON
- **Update Rate**: Near real-time (< 60 seconds after satellite flyover for US/Canada, 3 hours globally)
- **Rate Limit**: 5000 transactions per 10-minute interval
- **Data Fields**: latitude, longitude, brightness, scan, track, acq_date, acq_time, satellite, instrument, confidence, version, bright_t31, frp (Fire Radiative Power), daynight
- **Notes**: Fire data from MODIS and VIIRS sensors on NASA satellites. Essential for wildfire monitoring.

### FEED 10: Natural Events (NASA EONET)
- **URL**: `https://eonet.gsfc.nasa.gov/api/v3/events`
- **Filters**: `?status=open&limit=50&category=wildfires,severeStorms,volcanoes,floods`
- **Auth**: None required
- **Format**: JSON
- **Update Rate**: Every 15 minutes
- **Data Fields**: id, title, description, categories, sources, geometry (points/polygons), closed (null=ongoing)
- **Event Categories**: Drought, Dust/Haze, Earthquakes, Floods, Landslides, Manmade, Sea/Lake Ice, Severe Storms, Snow, Temperature Extremes, Volcanoes, Water Color, Wildfires
- **Notes**: Curated natural event metadata from NASA. Links events to imagery sources.

### FEED 11: CCTV Austin TX (TxDOT)
- **URL**: `https://its.txdot.gov/ITS_WEB/FrontEnd/default.html?r=AUS&p=CCTV` (web scrape for camera list)
- **Image URL Pattern**: Camera-specific JPEG URLs
- **Auth**: None required
- **Format**: JPEG snapshots
- **Update Rate**: 1 frame per minute
- **Notes**: Texas DOT traffic cameras. Publicly accessible. Need to scrape camera list or use known camera IDs.

### FEED 12: CCTV New York (NYCTMC)
- **URL**: `https://webcams.nyctmc.org/api/cameras/`
- **Image URL Pattern**: `https://webcams.nyctmc.org/api/cameras/{id}/image`
- **Auth**: None required
- **Format**: JSON (camera list) + JPEG (snapshots)
- **Update Rate**: Every 30 seconds
- **Data Fields**: id, name, latitude, longitude, direction, status, imageUrl
- **Notes**: NYC Traffic Management Center. ~700+ cameras across NYC.

### FEED 13: CCTV London (TfL JamCam)
- **URL**: `https://api.tfl.gov.uk/Place/Type/JamCam`
- **Image URL Pattern**: In camera data `additionalProperties` -> `imageUrl`
- **Auth**: None required (optional API key for higher rate limits)
- **Format**: JSON
- **Update Rate**: Every 5 minutes
- **Notes**: Transport for London traffic cameras. ~900+ cameras across London.

### FEED 14: Road Network (OpenStreetMap Overpass)
- **URL**: `https://overpass-api.de/api/interpreter`
- **Query Method**: POST with Overpass QL query body
- **Auth**: None required
- **Format**: JSON
- **Update Rate**: Static (query as needed, cache aggressively)
- **Rate Limit**: Fair use policy — cache results, avoid repeated queries
- **Example Query**: `[out:json][timeout:30];way["highway"~"^(motorway|trunk|primary|secondary)$"](bbox);(._;>;);out body;`
- **Notes**: Query road geometries for traffic simulation. Cache results per city/bounding box.

### FEED 15: News Intelligence (GDELT)
- **DOC API**: `https://api.gdeltproject.org/api/v2/doc/doc?query={QUERY}&mode=artlist&format=json&maxrecords=75&sort=datedesc`
- **GEO API**: `https://api.gdeltproject.org/api/v2/geo/geo?query={QUERY}&mode=pointdata&format=geojson`
- **Auth**: None required
- **Format**: JSON, GeoJSON
- **Update Rate**: Every 15 minutes
- **Rate Limit**: Reasonable use (avoid hammering)
- **Query Syntax**: `(keyword1 OR keyword2) sourcelang:eng domain:.gov`
- **Data Fields (DOC)**: url, title, seendate, socialimage, domain, language, sourcecountry
- **Data Fields (GEO)**: lat, lon, name, count, url, tone, themes
- **Notes**: Monitors world's news in 100+ languages. Free, backed by Google Jigsaw. Excellent for OSINT intelligence feeds.

### FEED 16: Armed Conflicts (ACLED)
- **URL**: `https://api.acleddata.com/acled/read?key={KEY}&email={EMAIL}`
- **Auth**: Free registration required (API key + email)
- **Format**: JSON
- **Update Rate**: Weekly (near real-time for premium)
- **Data Fields**: event_id_cnty, event_date, year, time_precision, event_type, sub_event_type, actor1, actor2, country, admin1, admin2, admin3, location, latitude, longitude, geo_precision, source, fatalities, notes
- **Event Types**: Battles, Explosions/Remote violence, Violence against civilians, Protests, Riots, Strategic developments
- **Notes**: Gold standard for conflict data. Free tier has some limitations. Used by UN, World Bank, media.

### FEED 17: Conflict Events (UCDP)
- **URL**: `https://ucdpapi.pcr.uu.se/api/gedevents/24.1?pagesize=100&page=0`
- **Auth**: None required
- **Format**: JSON
- **Update Rate**: Monthly releases, some near-real-time
- **Data Fields**: id, relid, year, active_year, type_of_violence, conflict_name, side_a, side_b, number_of_sources, source_article, where_prec, latitude, longitude, date_start, date_end, deaths_a, deaths_b, deaths_civilians, deaths_unknown, best, high, low
- **Notes**: Uppsala Conflict Data Program. Academic-grade conflict data. Free and open.

### FEED 18: Disaster Alerts (GDACS)
- **URL**: `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ,TC,FL,VO,DR,WF&alertlevel=Green,Orange,Red&fromdate=2026-02-01`
- **Auth**: None required
- **Format**: GeoJSON, GeoRSS, XML
- **Data Fields**: eventid, eventtype, alertlevel, severity, population, country, fromdate, todate, coordinates
- **Notes**: UN's Global Disaster Alert and Coordination System. Real-time multi-hazard alerts.

### FEED 19: Submarine Cables (TeleGeography)
- **URL**: `https://raw.githubusercontent.com/telegeography/www.submarinecablemap.com/master/web/public/api/v3/cable/cable-geo.json`
- **Auth**: None required
- **Format**: GeoJSON
- **Update Rate**: Static (update quarterly)
- **Data Fields**: name, color, landing_points, length, rfs (ready for service), owners, url, coordinates
- **Notes**: Complete global submarine cable map data. Free, open source on GitHub.

### FEED 20: Weather (Open-Meteo)
- **URL**: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m`
- **Auth**: None required
- **Format**: JSON
- **Update Rate**: Every 15 minutes
- **Rate Limit**: 10,000 requests/day (non-commercial)
- **Notes**: Free weather API, no registration needed. Good for adding weather context to locations.

### FEED 21: GPS Interference (GPSJam)
- **URL**: `https://gpsjam.org/` (data extraction via their API or tile data)
- **Auth**: None required
- **Format**: Tile-based visualization data
- **Update Rate**: Hourly (based on ADS-B navigation accuracy data)
- **Notes**: Shows GPS/GNSS interference and jamming worldwide. Derived from aircraft navigation accuracy reports.

### FEED 22: Prediction Markets (Polymarket)
- **URL**: `https://gamma-api.polymarket.com/markets?active=true&closed=false`
- **Auth**: None required
- **Format**: JSON
- **Update Rate**: Real-time
- **Data Fields**: question, outcomes, outcomePrices, volume, liquidity, startDate, endDate
- **Notes**: Real-money prediction markets. Useful for geopolitical event probability estimation.

### FEED 23: Webcams Global (Windy)
- **URL**: `https://api.windy.com/webcams/v2/list/limit=50/nearby={lat},{lon},{radius}`
- **Auth**: API key required (free tier available)
- **Format**: JSON
- **Data Fields**: id, title, location (lat, lon, city, country), image (current, daylight), player (day, month, lifetime)
- **Notes**: 70,000+ webcams worldwide. Good supplement to DOT-specific cameras.

### FEED 24: Volcanic Activity (Smithsonian GVP)
- **URL**: `https://volcano.si.edu/news/WeeklyVolcanoRSS.xml`
- **Auth**: None required
- **Format**: RSS/XML
- **Update Rate**: Weekly
- **Notes**: Smithsonian Institution's Global Volcanism Program. Authoritative volcanic activity reports.

### FEED 25: Nuclear Facilities (IAEA PRIS)
- **URL**: Static dataset extracted from `https://pris.iaea.org/PRIS/`
- **Auth**: None required for public data
- **Format**: Curated JSON (static)
- **Data Fields**: name, country, type (PWR, BWR, PHWR, etc.), status (operational, under construction, shutdown), net_capacity_mw, lat, lon, operator
- **Notes**: International Atomic Energy Agency's Power Reactor Information System. Public data on all nuclear power plants worldwide.

### FEED 26: Cyber Threats (CISA KEV)
- **URL**: `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
- **Auth**: None required
- **Format**: JSON
- **Update Rate**: Updated as new vulnerabilities are added (typically daily)
- **Data Fields**: cveID, vendorProject, product, vulnerabilityName, dateAdded, shortDescription, requiredAction, dueDate, knownRansomwareCampaignUse
- **Notes**: CISA's Known Exploited Vulnerabilities catalog. Essential for cyber threat layer.

### FEED 27: Telegram OSINT
- **URL**: Telegram Bot API `https://api.telegram.org/bot{TOKEN}/getUpdates`
- **Auth**: Bot token required (create bot via @BotFather)
- **Format**: JSON
- **Update Rate**: Real-time (polling or webhook)
- **Key OSINT Channels**: Various public conflict monitoring, military spotting, and geopolitical analysis channels
- **Notes**: Monitor public Telegram channels for OSINT. Requires creating a bot and adding it to channels.

### FEED 28: RSS News Feeds (Multiple)
- **Sources**: Reuters, AP, BBC, Al Jazeera, CNN, Defense One, The War Zone, Bellingcat, Krebs Security, Pentagon, White House, State Dept, UN News, CISA, and 50+ more
- **Auth**: None required
- **Format**: RSS/XML
- **Update Rate**: Every 5-15 minutes
- **Processing**: Use RSS proxy to avoid CORS. Parse with DOMParser or fast-xml-parser.
- **Source Tiers**: Tier 1 (wire services/gov), Tier 2 (major outlets), Tier 3 (specialty), Tier 4 (aggregators)
- **Notes**: Adapted from worldmonitor's extensive feed list at `src/config/feeds.ts`
