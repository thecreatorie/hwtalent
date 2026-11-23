# hw-talent.com

HW Talent — The impossible, arranged.

Plain HTML, CSS and JavaScript. No build step. Open `index.html` in a browser to preview.
The site carries no photography yet. It is built from type, line drawings and one field of
sparks that sits behind every page and rearranges itself as you scroll: a turning aerial hoop
on the home page, a blueprint, a bloom, a quad rig on Rentals, and so on. Photographs are few and
framed with corner marks; line drawings carry the rest.

## Settings

At the top of `assets/js/site.js`:

| Setting | What it does |
| --- | --- |
| `CALENDLY_URL` | Set to `https://calendly.com/hw-talent-info/30min`. The consultation page shows this calendar. |
| `FORM_MODE` | `"mailto"` opens the visitor's email app with the request filled in. This is the mode for GitHub Pages. |
| `HERO_VIDEO` | Optional. Path to a silent looping film for the home hero. Empty keeps the hoop of light. |

At the top of `assets/js/rentals.js`:

| Setting | What it does |
| --- | --- |
| `BOOKING_API` | Empty for now. While empty, a signed rental booking is sent to info@hw-talent.com and the director follows with a card link. Once a card processor is chosen, a small payment service goes here and clients pay on the spot. |

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home: the three-beat story, the photographs moving sideways, "Only here", talent, LED name demo, "Hire without stress", where we work, questions |
| `acts.html` | Acts: every discipline, plus a photo gallery that appears once photos are listed |
| `costumes.html` | Costumes: styles, plus a photo gallery that appears once photos are listed |
| `bespoke.html` | Custom branding and LED programming, with the live LED name demo |
| `workshops.html` | Workshops |
| `rentals.html` | Rentals: choose the pieces, describe the event, see the figure, sign the agreement |
| `booked.html` | The page a client lands on after paying by card (used once card payment is connected) |
| `join.html` | Roster application for performers |
| `consult.html` | Begin the conversation: step one is name, email, phone and a time; step two is the event details |
| `enquire.html` | Forwards to `consult.html` (kept so old links still work) |

## The consultation

Every page points to one action: thirty minutes with the Entertainment Director.

1. **Step one:** name, email, phone, then a time. With `CALENDLY_URL` set, the visitor picks a slot in
   your calendar and their name and email are carried into it.
2. **Step two:** type of inquiry, date of event, city or venue, guests, theme, what they are looking
   for, how involved they want to be, and notes. This is sent to info@hw-talent.com.

In Calendly, set the event to 30 minutes and add a phone question if you want the number in the
calendar invitation as well.

## Rental prices and rules

Prices are worked out, not typed in. For each piece:

    price = replacement value x share for the length of the rental x risk (x outdoors) + installation

- **Per piece** (`assets/js/rental-data.js`): `value` is what it costs to replace, `risk` is low, medium
  or high, and `install` is the one-time charge for the crew to deliver, install, light, dress and
  strike it. Correct a `value` and every price for that piece follows.
- **The rules** (top of `assets/js/booking-core.js`): the `curve` (one day = 30% of value, 3 days 45%,
  7 days 60%, 14 days 75%, 30 days 95%), the risk multipliers (1, 1.15, 1.3), outdoors (1.1), the cap
  (the rental part never passes 98% of the piece's value), the longest rental (30 days), the smallest
  booking ($400), the retainer (half) and when the balance is due (14 days before).
- **Sent to the director instead of signed on the page:** outside Las Vegas, apparatus with no rig to
  fly from, dates within 3 days, or a ceiling lower than a piece needs.
- **Specs and questions:** also in `rental-data.js`. `specs` are the lines on each card, `opt` is the one
  question asked when a piece is chosen, and `clear` is the ceiling a piece needs indoors.
- **The agreement:** the text is in `booking-core.js`. It is a draft and has not been reviewed by a
  lawyer. Have a Nevada attorney review it before taking live bookings.
- Prices are never shown in the catalog. The client sees the figure only after describing the event.

## Editing

- **Colours and type:** `assets/css/site.css`, the `:root` block at the top.
- **Fonts:** Archivo (statements and wordmark), Instrument Serif Italic (the one amber word in a
  statement), Geist (text) and Geist Mono (labels). All open licence, in `assets/fonts/`.
- **Questions and answers:** plain HTML in each page, inside `<details class="q">` blocks.
- **Photos:** put the file in `assets/img/work/`, then add one line to `assets/js/gallery-data.js`
  (the file shows the format). Labels name the discipline only: no performer names, no event names.
  Photos are always shown whole. Nothing on the site crops them.
- **Menu and footer:** repeated in each HTML file.
- **Motion:** visitors who ask their device for reduced motion get a still version of everything.

## Going live on GitHub Pages

Upload this folder's contents to a repository and turn on Pages. The `CNAME` file (hw-talent.com) and
`.nojekyll` are already here. Point the domain's DNS at GitHub Pages.

## To confirm before launch

- The rental prices and the rules above.
- A lawyer's review of the rental agreement, and the cancellation terms in it.
- Whether sales tax applies to rentals (none is added at present).
- A card processor, so clients can pay on the page.
- Every answer in the questions sections is a draft in the brand voice.
- More photography, with each performer's permission.
