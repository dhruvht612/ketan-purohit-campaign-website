# Ketan Purohit — TDSB Ward 12 Campaign Website

A clean, responsive campaign site built with **HTML5, CSS3, and vanilla JavaScript** — no frameworks, no build step.

## Run it
Just open `index.html` in a browser, or serve the folder:
```
python3 -m http.server 8000
```
Then visit http://localhost:8000

## Structure
```
campaign-website/
├── index.html          # All sections (nav, hero, about, why, priorities,
│                       # connect/forms, contribute, news, FAQ, footer)
├── css/
│   └── style.css       # Design tokens + every section style (commented)
├── js/
│   └── script.js       # Nav, dropdowns, tabs, accordion, form logic,
│                       # captcha, scroll reveal, back-to-top
└── assets/
    ├── images/         # Drop candidate photos here (see below)
    └── icons/
```

## Add the candidate photo
Place a portrait at `assets/images/ketan.jpg` (and optionally `ketan-2.jpg`
for the About section). If the file is missing, a styled "KP" placeholder
shows automatically — no broken images.

## Wire up the forms (later)
All three forms already collect and validate data and build a clean object.
The only integration point is in `js/script.js`:

- `submitVolunteer(data)`
- `submitEnrollment(data)`
- `submitFeedback(data)`
- `sendAutomatedEmail(type, data)`  ← auto-reply hook

Each currently logs the payload to the console. To go live, drop a `fetch()`
inside the relevant function pointing at a Google Sheets Web App, a serverless
endpoint, or an email service. The `data` object is already shaped as one row.

## Donation link
In `index.html`, replace the `href="#"` on the **Donate Now** button
(`id="donateBtn"`) with your Square checkout link.

## Social links
Replace the `href="#"` values in the News section and footer with the real
Facebook and Instagram URLs.

## Notes
- Math captcha is randomized on each load (still a simple human check).
- Fully responsive, keyboard-accessible, and respects reduced-motion.
