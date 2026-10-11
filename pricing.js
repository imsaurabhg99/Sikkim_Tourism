// Rates and the estimate calculation, shared by the estimator (index.html) and
// the starting prices on trip cards and trip pages. All rates are SAMPLE figures.

// ---------- Seasons ----------
// Applied per travel day to stays, cars and trek crews. Spring peak costs more
// when the trip starts within CLOSE_BOOKING_DAYS of the booking date.
var BANDS = {
  holiday: { f: 1.40, tag: 'Holiday peak', cls: 'festive' },
  spring:  { f: 1.30, fClose: 1.40, tag: 'Spring peak', cls: 'peak' },
  autumn:  { f: 1.15, tag: 'Autumn & winter', cls: 'peak' },
  monsoon: { f: 0.80, tag: 'Monsoon', cls: 'low' },
  quiet:   { f: 0.90, tag: 'Quiet winter', cls: 'low' }
};
var LOWEST_SEASON_FACTOR = 0.80;
var CLOSE_BOOKING_DAYS = 15;
var WEEKEND_FACTOR = 1.15;

function bandFor(date) {
  var m = date.getMonth(), d = date.getDate();
  if ((m === 11 && d >= 15) || (m === 0 && d <= 10)) return BANDS.holiday;
  if (m >= 2 && m <= 5) return BANDS.spring;
  if (m >= 6 && m <= 8) return BANDS.monsoon;
  if (m >= 9 || (m === 0 && d <= 15)) return BANDS.autumn;
  return BANDS.quiet;
}
function isCloseBooking(tripStart) {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  return (tripStart - today) / 86400000 < CLOSE_BOOKING_DAYS;
}
function bandFactor(band, close) {
  return close && band.fClose ? band.fClose : band.f;
}
function seasonInfo(start, days) {
  var sum = 0, weekends = 0, tags = [], closeHit = false;
  var close = isCloseBooking(start);
  for (var i = 0; i < days; i++) {
    var d = new Date(start); d.setDate(d.getDate() + i);
    var we = d.getDay() === 0 || d.getDay() === 6;
    if (we) weekends++;
    var band = bandFor(d);
    if (tags.indexOf(band.tag) === -1) tags.push(band.tag);
    if (close && band.fClose) closeHit = true;
    sum += bandFactor(band, close) * (we ? WEEKEND_FACTOR : 1);
  }
  var tag = tags.join(' → ') + (closeHit ? ', booked within ' + CLOSE_BOOKING_DAYS + ' days' : '');
  return { factor: sum / days, weekends: weekends, tag: tag };
}

// ---------- Shared resources ----------
var ROOM_SHARE = 2;            // a standard room sleeps two
var EXTRA_BED_SHARE = 0.3;     // a third person in a room pays 30% of the room rate
var CAB_SEATS = 4;             // one car with driver seats four
var CAB_PER_DAY = 3200;        // per car, with driver and fuel
var MEALS_PER_DAY = 700;       // per person
var BIKE_PER_DAY = 1800;       // per rider: motorbike rental and fuel
var TREK_CREW_PER_DAY = 4500;  // per team: guide, cook and helpers
var TREK_TEAM_MAX = 8;         // trekkers one crew can look after

var STAYS = {
  // Tourism stays are priced per room per night.
  tourism: [
    { id: 'homestay', label: 'Homestay', perNight: 2200 },
    { id: 'standard', label: 'Standard hotel', perNight: 3800 },
    { id: 'boutique', label: 'Boutique', perNight: 7000 },
    { id: 'luxury', label: 'Luxury', perNight: 13000 }
  ],
  // Trek stays are priced per person per night: shared tents or huts, meals on trail.
  trekking: [
    { id: 'camp-std', label: 'Standard camp', perNight: 2200 },
    { id: 'camp-comfort', label: 'Comfort camp', perNight: 3200 },
    { id: 'teahouse', label: 'Teahouse mix', perNight: 1800 }
  ]
};

// perVehicle: extra cost per car (restricted-area vehicles, long drives).
// perPerson: entry tickets, permits, rides. perGroup: once for the whole group.
var ACTS = {
  tourism: [
    { id: 'tsomgo', label: 'Tsomgo Lake (1 day)', perVehicle: 2500, perPerson: 300, days: 1 },
    { id: 'nathula', label: 'Nathula Pass (with Tsomgo)', perVehicle: 2000, perPerson: 400, days: 0, indiaOnly: true, requires: 'tsomgo' },
    { id: 'north', label: 'Lachung–Yumthang (2 days)', perVehicle: 6000, perPerson: 1000, days: 2 },
    { id: 'gurudongmar', label: 'Lachen & Gurudongmar Lake (2 days)', perVehicle: 6000, perPerson: 1000, days: 2 },
    { id: 'zeropoint', label: 'Zero Point (from Lachung)', perVehicle: 2500, days: 0, requires: 'north' },
    { id: 'silkroute', label: 'Silk Route: Zuluk & Nathang (2 days)', perVehicle: 6000, perPerson: 800, days: 2 },
    { id: 'south', label: 'South Sikkim: Namchi & Ravangla (1 day)', perVehicle: 1500, perPerson: 500, days: 1 },
    { id: 'pelling', label: 'Pelling & West Sikkim (2 days)', perVehicle: 3000, perPerson: 600, days: 2 },
    { id: 'darjeeling', label: 'Darjeeling: Tiger Hill & toy train (2 days)', perVehicle: 3500, perPerson: 1500, days: 2 },
    { id: 'monasteries', label: 'Monastery circuit (half day)', perPerson: 300, days: 0.5 },
    { id: 'cablecar', label: 'Cable car & city (half day)', perPerson: 500, days: 0.5 },
    { id: 'rafting', label: 'Teesta rafting (half day)', perPerson: 1800, days: 0.5 }
  ],
  trekking: [
    { id: 'gear', label: 'Gear rental', perPerson: 2500 },
    { id: 'porter', label: 'Personal porter', perPerson: 4500 },
    { id: 'acclim', label: 'Extra acclimatisation day', perPerson: 2200, perGroup: TREK_CREW_PER_DAY },
    { id: 'darjeeling', label: 'Darjeeling extension', perVehicle: 7000, perPerson: 4000 }
  ],
  alacarte: [
    { id: 'cab', label: 'Cab — pickup & drop', perVehicle: 2800 },
    { id: 'nathula', label: 'Day tour: Nathula Pass', perVehicle: 6500, perPerson: 400, group: 'tour', indiaOnly: true },
    { id: 'south', label: 'Day tour: South Sikkim', perVehicle: 4500, perPerson: 500, group: 'tour' }
  ]
};

var COMPANION = [  // Sathi services, once per group
  { id: 'plan', label: 'Plan & book', cost: 3500, perDay: false },
  { id: 'assist', label: 'On-trip assistance', cost: 1200, perDay: true },
  { id: 'pickup', label: 'Pickup & drop', cost: 2800, perDay: false }
];

var TREKS = [
  { id: 'goechala', label: 'Goechala', days: 10 },
  { id: 'dzongri', label: 'Dzongri', days: 7 },
  { id: 'singalila', label: 'Singalila ridge', days: 9 },
  { id: 'greenlake', label: 'Green Lake', days: 16 },
  { id: 'kbc', label: 'Kanchenjunga Base Camp', days: 11 },
  { id: 'yambong', label: 'Yambong Singalila', days: 10 },
  { id: 'tholung', label: 'Tholung Monastery', days: 4 },
  { id: 'varsey', label: 'Varsey rhododendron', days: 4 },
  { id: 'tosar', label: 'Tosar Lake', days: 7 },
  { id: 'singba', label: 'Rhododendron trail (Singba)', days: 5 },
  { id: 'tinjure', label: 'Tinjure', days: 3 }
];

var PERMITS = { tourism: { india: 500, abroad: 2500 }, trekking: { india: 1500, abroad: 4500 } };

// ---------- Sharing ----------
function roomPlan(pax) {
  if (pax <= 1) return { rooms: 1, extraBeds: 0 };
  return { rooms: Math.floor(pax / ROOM_SHARE), extraBeds: pax % ROOM_SHARE };
}
function carsFor(pax) { return Math.max(1, Math.ceil(pax / CAB_SEATS)); }
function crewsFor(pax) { return Math.max(1, Math.ceil(pax / TREK_TEAM_MAX)); }
function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }

function actCost(a, pax) {
  return (a.perVehicle || 0) * carsFor(pax) + (a.perPerson || 0) * pax + (a.perGroup || 0);
}
function actDetail(a, pax) {
  var parts = [];
  if (a.perVehicle) parts.push(plural(carsFor(pax), 'car'));
  if (a.perPerson) parts.push(pax > 1 ? 'tickets & permits × ' + pax : 'tickets & permits');
  return parts.join(', ');
}
function shortLabel(label) { return label.replace(/ \(.*\)$/, ''); }

// ---------- The estimate ----------
// cfg: { mode, days, pax, stay, acts, comp, trek, origin, start, lowestSeason, transport }
// Returns line items { label, inr, signed? }; the total is their sum.
function estimate(cfg) {
  var pax = cfg.pax, out = [], seasonal = 0;
  var season = cfg.lowestSeason
    ? { factor: LOWEST_SEASON_FACTOR, weekends: 0, tag: 'lowest season' }
    : seasonInfo(cfg.start, cfg.days);

  if (cfg.mode === 'alacarte') {
    (cfg.acts || []).forEach(function (id) {
      var a = ACTS.alacarte.find(function (x) { return x.id === id; });
      if (!a) return;
      seasonal += (a.perVehicle || 0) * carsFor(pax);
      out.push({ label: a.label + ' — ' + actDetail(a, pax), inr: actCost(a, pax) });
    });
  } else if (cfg.mode === 'tourism') {
    var stay = STAYS.tourism.find(function (s) { return s.id === cfg.stay; }) || STAYS.tourism[0];
    var nights = Math.max(cfg.days - 1, 0);
    if (nights) {
      var rp = roomPlan(pax);
      var roomCost = (rp.rooms * stay.perNight + rp.extraBeds * stay.perNight * EXTRA_BED_SHARE) * nights;
      var how = pax === 1 ? 'single' : (rp.extraBeds ? '3 sharing one room' : '2 per room');
      out.push({
        label: stay.label + ': ' + plural(rp.rooms, 'room') + (rp.extraBeds ? ' + extra bed' : '') + ' × ' + plural(nights, 'night') + ' (' + how + ')',
        inr: roomCost
      });
      seasonal += roomCost;
    }
    if (cfg.transport === 'bike') {
      var bikes = BIKE_PER_DAY * cfg.days * pax;
      out.push({ label: 'Motorbike rental & fuel × ' + plural(cfg.days, 'day') + (pax > 1 ? ' × ' + pax + ' riders' : ''), inr: bikes });
      seasonal += bikes;
    } else {
      var cars = carsFor(pax), cab = CAB_PER_DAY * cfg.days * cars;
      out.push({ label: 'Car with driver: ' + plural(cars, 'car') + ' × ' + plural(cfg.days, 'day') + ' (up to ' + CAB_SEATS + ' per car)', inr: cab });
      seasonal += cab;
    }
    out.push({ label: 'Meals × ' + plural(cfg.days, 'day') + (pax > 1 ? ' × ' + pax + ' people' : ''), inr: MEALS_PER_DAY * cfg.days * pax });
  } else {
    var camp = STAYS.trekking.find(function (s) { return s.id === cfg.stay; }) || STAYS.trekking[0];
    var tn = Math.max(cfg.days - 1, 1);
    var campCost = camp.perNight * tn * pax;
    out.push({ label: camp.label + ', tents & trail meals × ' + plural(tn, 'night') + (pax > 1 ? ' × ' + pax + ' people' : ''), inr: campCost });
    var crews = crewsFor(pax), crewCost = TREK_CREW_PER_DAY * cfg.days * crews;
    var trek = TREKS.find(function (t) { return t.id === cfg.trek; });
    out.push({
      label: (trek ? trek.label + ' — ' : '') + 'guide & crew: ' + plural(crews, 'team') + ' × ' + plural(cfg.days, 'day') + ' (up to ' + TREK_TEAM_MAX + ' trekkers each)',
      inr: crewCost
    });
    seasonal += campCost + crewCost;
  }

  var adj = Math.round((season.factor - 1) * seasonal);
  if (adj !== 0 && seasonal > 0) {
    out.push({
      label: 'Season & weekends (' + season.tag + (season.weekends ? ', ' + plural(season.weekends, 'weekend day') : '') + ')',
      inr: adj, signed: true
    });
  }

  if (cfg.mode !== 'alacarte') {
    (cfg.acts || []).forEach(function (id) {
      var a = ACTS[cfg.mode].find(function (x) { return x.id === id; });
      if (!a) return;
      var detail = actDetail(a, pax);
      out.push({ label: shortLabel(a.label) + (detail ? ' — ' + detail : ''), inr: actCost(a, pax) });
    });
  }
  if (cfg.mode === 'tourism') {
    (cfg.comp || []).forEach(function (id) {
      var c = COMPANION.find(function (x) { return x.id === id; });
      if (c) out.push({
        label: 'Sathi: ' + c.label + (c.perDay ? ' × ' + plural(cfg.days, 'day') : '') + (pax > 1 ? ' (whole group)' : ''),
        inr: c.perDay ? c.cost * cfg.days : c.cost
      });
    });
  }
  if (cfg.mode !== 'alacarte') {
    out.push({
      label: 'Permits & fees (' + (cfg.origin === 'abroad' ? 'foreign national' : 'Indian national') + ')' + (pax > 1 ? ' × ' + pax : ''),
      inr: PERMITS[cfg.mode][cfg.origin === 'abroad' ? 'abroad' : 'india'] * pax
    });
  }
  return out;
}
function total(lines) { return lines.reduce(function (t, l) { return t + l.inr; }, 0); }

// Starting price per person for a trip card: two travellers sharing, cheapest
// stay, lowest season, Indian nationals.
var STARTING_PRICE_PAX = 2;
function startingPrice(trip) {
  var p = trip.pricing;
  var cfg = {
    mode: p.mode, days: p.days, pax: STARTING_PRICE_PAX, acts: p.acts || [], comp: [],
    stay: p.mode === 'trekking' ? 'teahouse' : 'homestay', trek: p.trek, origin: 'india',
    lowestSeason: true, transport: p.transport
  };
  return total(estimate(cfg)) / STARTING_PRICE_PAX;
}
