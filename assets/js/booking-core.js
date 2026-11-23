/* HW Talent — rental rules, the quote maths and the rental agreement.
   Each piece's replacement value, risk and installation charge are in rental-data.js.
   A piece's price = value x the share for the length of the rental x its risk (x outdoors) + its installation charge.

   curve        the share of a piece's replacement value charged for a rental of that many days.
                [1, 0.30] = one day costs 30% of what the piece costs to replace; [30, 0.95] = thirty
                days cost 95%. Lengths in between are read off the line between the two nearest points.
                The rental part never reaches the price of buying the piece.
   risk         multipliers for wear and damage: low (bare metal), medium (finished poles and stages), high (fabric)
   outdoors     multiplier when the event is outdoors (sun, dust, weather)
   cap          the rental part of a price never exceeds this share of the piece's replacement value
   maxDays      the longest rental. Nothing is rented for longer.
   pieceFloor   the least any one piece costs, in dollars
   minimum      the smallest booking we send a crew for, in dollars
   retainer     the share paid to hold the date (0.5 = half)
   balanceDays  the balance is due this many days before the first day; inside that window all is paid at once
   leadDays     dates closer than this are confirmed by the director, not booked on the page */
(function (root) {
  var RULES = {
    curve: [[1, 0.30], [3, 0.45], [7, 0.60], [14, 0.75], [30, 0.95]],
    risk: { low: 1, medium: 1.15, high: 1.3 }, outdoors: 1.1,
    cap: 0.98, maxDays: 30, pieceFloor: 95, minimum: 400, retainer: 0.5, balanceDays: 14, leadDays: 3, version: "HW-RA-2026-11"
  };
  var AREAS = { lv: "Las Vegas, Henderson or nearby", ca: "California", az: "Arizona", tx: "Texas", us: "Elsewhere in the United States" };
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  function day(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    if (!m) return null;
    var t = Date.UTC(+m[1], +m[2] - 1, +m[3]), d = new Date(t);
    return d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3] ? Math.round(t / 864e5) : null;
  }
  function iso(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function longDate(s) { var n = day(s); if (n === null) return ""; var d = new Date(n * 864e5); return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear(); }
  function money(n) { return "$" + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  /* the share of a piece's value charged for a rental of this many days */
  function share(days) {
    var c = RULES.curve, i;
    if (days <= c[0][0]) return c[0][1];
    for (i = 1; i < c.length; i++) if (days <= c[i][0]) return c[i - 1][1] + (c[i][1] - c[i - 1][1]) * (days - c[i - 1][0]) / (c[i][0] - c[i - 1][0]);
    return c[c.length - 1][1];
  }
  function price(it, days, outdoors) {
    var rent = Math.min(it.value * share(days) * (RULES.risk[it.risk] || 1) * (outdoors ? RULES.outdoors : 1), it.value * RULES.cap);
    var raw = rent + (it.install || 0);
    return Math.max(RULES.pieceFloor, Math.round(raw / 5) * 5);
  }
  function title(it) { var k = it.kind || ""; if (/^[A-Z][a-z]/.test(k)) k = k.charAt(0).toLowerCase() + k.slice(1); return it.name + (k ? ", " + k : ""); }

  /* input: { items: [ids], first: "YYYY-MM-DD", days: 1 to 30, area: "lv|ca|az|tx|us", today: "YYYY-MM-DD",
              indoors: true|false, ceiling: feet or 0 } */
  function quote(input, catalog) {
    var errors = [], reasons = [], items = [], seen = {};
    (input.items || []).forEach(function (id) {
      for (var i = 0; i < catalog.length; i++) if (catalog[i].id === id && !seen[id]) { seen[id] = 1; items.push(catalog[i]); }
    });
    if (!items.length) errors.push("Choose at least one piece.");
    var a = day(input.first), t = day(input.today), days = Math.round(+input.days || 0);
    if (a === null) errors.push("Choose your first day.");
    else if (t !== null && a < t) errors.push("That date has passed.");
    if (!(days >= 1 && days <= RULES.maxDays)) { errors.push("Rentals run from 1 to " + RULES.maxDays + " days."); days = 1; }
    if (!AREAS[input.area]) errors.push("Choose where the event is.");
    var outdoors = input.indoors === false, subtotal = 0;
    var lines = items.map(function (it) {
      var amount = price(it, days, outdoors);
      subtotal += amount;
      return { id: it.id, label: title(it), amount: amount };
    });
    var adjust = items.length ? Math.max(0, RULES.minimum - subtotal) : 0, total = subtotal + adjust;
    if (AREAS[input.area] && input.area !== "lv") reasons.push("Travel and freight beyond Las Vegas are arranged by your director.");
    if (items.some(function (it) { return it.type === "apparatus"; }) && !items.some(function (it) { return it.hang; }))
      reasons.push("Flying from your venue's own point calls for a site review first.");
    var ceiling = +input.ceiling || 0;
    if (input.indoors && ceiling && items.some(function (it) { return it.clear && ceiling < it.clear; }))
      reasons.push("The ceiling is lower than a chosen piece needs. Your director will find the fit.");
    var lead = a !== null && t !== null ? a - t : null;
    if (lead !== null && lead >= 0 && lead < RULES.leadDays) reasons.push("Dates this close are confirmed personally.");
    var fullOnly = lead !== null && lead <= RULES.balanceDays;
    var retainer = fullOnly ? total : Math.round(total * RULES.retainer);
    return {
      ok: !errors.length, errors: errors, reasons: reasons, instant: !errors.length && !reasons.length,
      lines: lines, days: days, subtotal: subtotal, minimum: adjust, total: total,
      retainer: retainer, balance: total - retainer, fullOnly: fullOnly,
      balanceDue: a !== null ? iso(a - RULES.balanceDays) : "", first: input.first || "", last: a !== null ? iso(a + days - 1) : "", area: input.area || ""
    };
  }

  /* The agreement, with this booking written in. q is a quote; d holds the client's details. */
  function agreement(q, d) {
    var pieces = q.lines.map(function (l) { return l.label + (d.options && d.options[l.id] ? " (" + d.options[l.id] + ")" : ""); }).join("; ");
    var when = q.days > 1 ? longDate(q.first) + " to " + longDate(q.last) + " (" + q.days + " days)" : longDate(q.first);
    var who = (d.name || "the Client") + (d.company ? ", for " + d.company : "");
    var pay = q.fullOnly || d.pay === "full"
      ? "The Fee is paid in full on signing."
      : "A retainer of " + money(q.retainer) + " is paid on signing and holds the date. The balance of " + money(q.balance) + " is due by " + longDate(q.balanceDue) + ".";
    return [
      { h: "Rental agreement " + RULES.version, p: [
        "Between HW Talent LLC (\"HW Talent\") and " + who + " (\"the Client\").",
        "Installation: " + pieces + ".",
        "Dates: " + when + ". Venue: " + (d.venue || "to be confirmed") + ", " + (AREAS[q.area] || "") + ".",
        "Fee: " + money(q.total) + "." ] },
      { h: "1. What HW Talent provides", p: [
        "HW Talent delivers the Installation to the Venue, installs it, lights it, dresses it with professional decor, inspects it, and removes it after the event. All of this is carried out by HW Talent's own crew and is included in the Fee.",
        "Colours and themes named in the booking guide the lighting and decor. HW Talent makes the final design choices." ] },
      { h: "2. Fee and payment", p: [
        pay,
        "If a balance is not received by its due date, HW Talent may release the date." ] },
      { h: "3. Changes and cancellation", p: [
        "The retainer is not refundable. With at least 30 days' notice the Client may move the booking once to another date within 12 months, subject to availability.",
        "If the Client cancels within " + RULES.balanceDays + " days of the first event day, the full Fee is due.",
        "If HW Talent cannot provide the Installation, it refunds everything the Client has paid for it." ] },
      { h: "4. Venue and access", p: [
        "The Client arranges the Venue's permission for the Installation, a clear and level footprint, safe access for delivery and removal at the agreed times, and power for lighting.",
        "The Client confirms that the details given about the Venue are accurate. If the site is unsuitable or unsafe on arrival, HW Talent may adapt the Installation or decline to install it. The Fee remains due where this results from inaccurate details." ] },
      { h: "5. Safety and use", p: [
        "The Installation may be used only by trained professional performers, within its rated limits, and never by guests unless HW Talent has agreed in writing.",
        "Only HW Talent's crew may move, adjust or re-rig any part of the Installation.",
        "HW Talent's crew has the final word on safety, including stopping use in wind, rain or lightning outdoors." ] },
      { h: "6. Care of the equipment", p: [
        "The equipment is rented, not sold. It remains the property of HW Talent at all times, and no rental runs longer than " + RULES.maxDays + " days.",
        "From installation to removal the Client is responsible for loss of, or damage to, the equipment beyond ordinary wear, at repair or replacement cost." ] },
      { h: "7. Risk and responsibility", p: [
        "Aerial and pole performance carries inherent risk. The Client is responsible for the people it permits to use the Installation, and will cover HW Talent against claims arising from that use, except where a claim results from HW Talent's own negligence in installing the equipment.",
        "HW Talent's total liability under this agreement is limited to the Fee." ] },
      { h: "8. Insurance", p: [
        "HW Talent carries general liability insurance and provides a certificate on request. Requests to name a venue or client as additional insured are made at least 10 days before the first event day." ] },
      { h: "9. Discretion", p: [
        "HW Talent does not publish images or details of the Client's event without the Client's written permission." ] },
      { h: "10. Events beyond control", p: [
        "Neither party is liable for failure caused by events outside its reasonable control. In that case the parties will agree a new date, or HW Talent will refund amounts paid for services not provided." ] },
      { h: "11. General", p: [
        "This is the whole agreement for the Installation. It is governed by the laws of the State of Nevada.",
        "The Client agrees to sign electronically. Typing a name in the signature field and confirming has the same effect as a handwritten signature." ] }
    ];
  }

  root.HWBooking = { RULES: RULES, AREAS: AREAS, share: share, price: price, quote: quote, agreement: agreement, money: money, title: title, longDate: longDate };
})(typeof window !== "undefined" ? window : globalThis);
