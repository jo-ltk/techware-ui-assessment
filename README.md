# Techware

A website built to match the Figma design — including how things **move** when you scroll, not just how they look in still pictures.

---

## How to run it

1. Install the tools once:
   ```bash
   npm install
   ```
2. Start the site:
   ```bash
   npm run dev
   ```
3. Open this link in your browser: [http://localhost:3000](http://localhost:3000)

Other useful commands:

- `npm run build` — prepare the site for going live
- `npm run start` — run the live version on your computer
- `npm run lint` — check the code for simple mistakes

You need **Node.js 20** (or newer) installed first.

---

## Live preview

- **Website link:** _(add your Vercel / Netlify link here)_
- **Video of the animations:** _(add a short screen recording link here)_

---

## What I built with

| What | Tool | In plain words |
| --- | --- | --- |
| Website base | Next.js + React | The frame the page sits in |
| Look and style | Tailwind CSS | Colours, fonts, spacing |
| Scroll animations | GSAP | Makes things move as you scroll |
| Card stack | Custom code (`ScrollStack`) | Cards stack like a deck of cards |
| Icons | Lucide | Small icons in the UI |
| Pictures | Next.js Image | Loads images in a smart way |

### Things I chose differently

- I did **not** use Framer Motion for the big scroll scenes. GSAP was a better fit for “move while you scroll.”
- The card stack follows the **normal page scroll** (especially on phones), so it feels natural when you swipe.
- I **did not shrink** the cards as they stack. Shrinking made the sides look bent. Cards only slide up, so the edges stay straight.
- The folder over the phone uses a solid shape mask, so the phone does not show through by mistake.

---

## How I read the Figma motion

When the design was unclear, I made a clear choice and wrote it here.

### Hero (phone coming out of the folder)

- The phone and numbers start **inside / under** the folder.
- As you scroll, they **move up**.
- They rise most of the way, then **pause** briefly so you can see the final look.
- The move slows a little at the end (soft stop).
- The text lights up **word by word** as you scroll.
- On phones, the same idea is used, with a simpler layout.

### Who It’s For (cards around the logo)

- Cards **spin around** the centre logo.
- While they spin, they also **move closer** to the centre.
- They turn once all the way around.
- Labels stay upright (they don’t tip sideways).
- The spin feels soft at the start and end — not sudden.

### Platform Preview (stacked cards)

- As you scroll, cards **stack on top of each other**, like a deck.
- Newer cards sit **above** older ones.
- Movement follows your scroll — it does not play on a timer.
- On phones, the stack is a bit shorter so it does not feel stuck.
- Card sides stay **straight** (no shrinking).
- If someone has “reduce motion” on, the fancy stack turns off and cards just sit in a normal list.

### Footer

- The background video only loads when you get near the bottom.
- If “reduce motion” is on, the video is skipped.

---

## Things that are not perfect yet

- On some phones, the browser bar changing size can make the stack jump a tiny bit. I wait until scrolling stops before re-checking sizes.
- Older / slower phones may feel the scroll animations a bit heavy.
- Figma and the real website are not always an exact copy of every curve — I matched the **feel** by eye.
- Some text is still placeholder (“lorem”) where the brief used filler text.
- Please add the live link and a short video in the **Live preview** section before you submit.

---

## Made for everyone

- You can use the keyboard to move around buttons and links.
- Images that matter have useful descriptions.
- If the user asks for less motion, big animations turn off or stay still.

---

## Folders (simple map)

```
app/         → pages
sections/    → each big part of the page (Hero, cards, footer, …)
components/  → small reusable pieces
public/      → images and video
styles/      → colours and fonts
```
