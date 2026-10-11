// Shared by index.html and trip.html.
var RATES = { INR: 1, USD: 1 / 88, EUR: 1 / 95 };
var SYMBOL = { INR: '₹', USD: '$', EUR: '€' };
var WHATSAPP_NUMBER = '918918082690';

function loadCurrency() {
  try {
    var c = localStorage.getItem('currency');
    if (RATES[c]) return c;
  } catch (e) {}
  return 'INR';
}
function saveCurrency(cur) {
  try { localStorage.setItem('currency', cur); } catch (e) {}
}

// Starting prices round up, so a "from" figure is never below what the rates produce.
function fmtFrom(inr, cur) {
  var step = cur === 'INR' ? 500 : 5;
  var v = Math.ceil(inr * RATES[cur] / step) * step;
  return SYMBOL[cur] + v.toLocaleString(cur === 'INR' ? 'en-IN' : 'en-US');
}
function fmtExact(inr, cur) {
  var v = Math.round(inr * RATES[cur]);
  return SYMBOL[cur] + v.toLocaleString(cur === 'INR' ? 'en-IN' : 'en-US');
}

function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove('show'); }, 3200);
}

function tripHref(trip) { return 'trip.html?id=' + encodeURIComponent(trip.id); }

// Card markup shared by the homepage sections and the "featured in" list on trip pages.
function buildTripCard(trip, cur) {
  var a = document.createElement('a');
  a.className = 'card card-link';
  a.href = tripHref(trip);

  var img = document.createElement('img');
  img.className = 'art'; img.loading = 'lazy'; img.alt = trip.alt; img.src = trip.img;
  a.appendChild(img);

  var body = document.createElement('div'); body.className = 'body';
  var h3 = document.createElement('h3'); h3.textContent = trip.title;
  var p = document.createElement('p'); p.textContent = trip.blurb;
  var meta = document.createElement('div'); meta.className = 'meta';
  trip.chips.forEach(function (c) {
    var s = document.createElement('span');
    if (c.hard) s.className = 'hard';
    s.textContent = c.t;
    meta.appendChild(s);
  });
  var foot = document.createElement('div'); foot.className = 'card-foot';
  var price = document.createElement('span'); price.className = 'from';
  price.appendChild(document.createTextNode('From '));
  var b = document.createElement('b'); b.textContent = fmtFrom(trip.from, cur);
  price.appendChild(b);
  price.appendChild(document.createTextNode(' per person'));
  var more = document.createElement('span'); more.className = 'more';
  more.textContent = trip.days.length ? 'Day-wise itinerary →' : 'View details →';
  foot.appendChild(price); foot.appendChild(more);

  body.appendChild(h3); body.appendChild(p); body.appendChild(meta); body.appendChild(foot);
  a.appendChild(body);
  return a;
}
