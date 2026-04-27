---
# ============================================================
#  J.A.R.V.I.S Local Agent — Design Tokens
# ============================================================
#  A self-contained dark-interface system for a local AI agent.
#  Aesthetic: cinematic, editorial, technical-quiet.
# ============================================================

# ── Color Primitives ─────────────────────────────────────────
color:
  void:
    $type: color
    $value: "#080909"
  surface:
    $type: color
    $value: "#0f1010"
  surface-raised:
    $type: color
    $value: "#151717"
  ink:
    $type: color
    $value: "#e8ebe9"
  teal:
    $type: color
    $value: "#00dcb4"
  cyan:
    $type: color
    $value: "#00a8ff"
  amber:
    $type: color
    $value: "#f0b040"
  red:
    $type: color
    $value: "#ff4455"

  # Semantic mappings
  background-base:
    $type: color
    $value: "#080909"
  background-surface:
    $type: color
    $value: "#0f1010"
  background-elevated:
    $type: color
    $value: "#151717"
  background-user:
    $type: color
    $value: "rgba(0, 220, 180, 0.05)"
  background-glow:
    $type: color
    $value: "rgba(0, 220, 180, 0.04)"

  text-primary:
    $type: color
    $value: "#e8ebe9"
  text-muted:
    $type: color
    $value: "rgba(232, 235, 233, 0.38)"
  text-dim:
    $type: color
    $value: "rgba(232, 235, 233, 0.18)"

  border-subtle:
    $type: color
    $value: "rgba(255, 255, 255, 0.06)"
  border-bright:
    $type: color
    $value: "rgba(255, 255, 255, 0.12)"
  border-accent:
    $type: color
    $value: "rgba(0, 220, 180, 0.25)"
  border-line:
    $type: color
    $value: "rgba(255, 255, 255, 0.07)"
  border-corner:
    $type: color
    $value: "rgba(255, 255, 255, 0.15)"

  status-online:
    $type: color
    $value: "#00dcb4"
  status-error:
    $type: color
    $value: "#ff4455"

  glow-accent:
    $type: color
    $value: "rgba(0, 220, 180, 0.12)"
  glow-wake:
    $type: color
    $value: "rgba(240, 176, 64, 0.2)"
  glow-danger:
    $type: color
    $value: "rgba(255, 68, 85, 0.4)"
  glow-ptt:
    $type: color
    $value: "rgba(0, 220, 180, 0.3)"

# ── Typography ───────────────────────────────────────────────
font:
  family-display:
    $type: fontFamily
    $value: "'Syne', sans-serif"
  family-body:
    $type: fontFamily
    $value: "'DM Sans', sans-serif"
  family-mono:
    $type: fontFamily
    $value: "'DM Mono', monospace"

  size-root:
    $type: dimension
    $value: 16px
  size-hero:
    $type: dimension
    $value: "clamp(40px, 6vw, 84px)"
  size-display:
    $type: dimension
    $value: 11px
  size-label:
    $type: dimension
    $value: 10px
  size-caption:
    $type: dimension
    $value: 9px
  size-micro:
    $type: dimension
    $value: 8px
  size-body:
    $type: dimension
    $value: 15px
  size-body-sm:
    $type: dimension
    $value: 14px
  size-body-xs:
    $type: dimension
    $value: 12px

  weight-light:
    $type: fontWeight
    $value: 300
  weight-regular:
    $type: fontWeight
    $value: 400
  weight-medium:
    $type: fontWeight
    $value: 500
  weight-bold:
    $type: fontWeight
    $value: 700
  weight-black:
    $type: fontWeight
    $value: 800

  letter-spacing-tight:
    $type: dimension
    $value: "-0.03em"
  letter-spacing-normal:
    $type: dimension
    $value: "0.01em"
  letter-spacing-wide:
    $type: dimension
    $value: "0.12em"
  letter-spacing-wider:
    $type: dimension
    $value: "0.18em"
  letter-spacing-widest:
    $type: dimension
    $value: "0.28em"

  line-height-tight:
    $type: number
    $value: 0.95
  line-height-normal:
    $type: number
    $value: 1.65
  line-height-relaxed:
    $type: number
    $value: 1.75
  line-height-loose:
    $type: number
    $value: 1.85

# ── Spacing ──────────────────────────────────────────────────
spacing:
  unit:
    $type: dimension
    $value: 4px
  sidebar-width:
    $type: dimension
    $value: 220px
  header-height:
    $type: dimension
    $value: 56px
  header-padding-x:
    $type: dimension
    $value: 32px
  message-padding-x:
    $type: dimension
    $value: 32px
  message-padding-y:
    $type: dimension
    $value: 20px
  message-meta-width:
    $type: dimension
    $value: 72px
  message-gap:
    $type: dimension
    $value: 24px
  input-max-height:
    $type: dimension
    $value: 160px
  input-padding:
    $type: dimension
    $value: "10px 16px"
  footer-padding:
    $type: dimension
    $value: "16px 32px 20px"
  sidebar-padding:
    $type: dimension
    $value: "14px 12px 10px"
  corner-size:
    $type: dimension
    $value: 20px

# ── Shape ────────────────────────────────────────────────────
radius:
  sharp:
    $type: dimension
    $value: 0px
  subtle:
    $type: dimension
    $value: 2px
  pill:
    $type: dimension
    $value: 9999px
  dot:
    $type: dimension
    $value: 50%

border-width:
  hairline:
    $type: dimension
    $value: 1px
  medium:
    $type: dimension
    $value: 1.5px
  thick:
    $type: dimension
    $value: 2px

# ── Elevation ────────────────────────────────────────────────
elevation:
  sidebar:
    $type: number
    $value: 200
  overlay:
    $type: number
    $value: 500
  mobile-sidebar:
    $type: number
    $value: 600
  mobile-nav:
    $type: number
    $value: 800
  decorative:
    $type: number
    $value: 999
  texture:
    $type: number
    $value: 1000

# ── Shadow & Glow ────────────────────────────────────────────
shadow:
  hero-text:
    $type: shadow
    $value: "0 0 20px rgba(255, 255, 255, 0.25), 0 0 40px rgba(0, 220, 180, 0.15)"
  ptt-glow:
    $type: shadow
    $value: "0 0 0 0 rgba(0, 220, 180, 0.3)"
  danger-pulse:
    $type: shadow
    $value: "0 0 0 0 rgba(255, 68, 85, 0.4)"

# ── Motion ───────────────────────────────────────────────────
motion:
  duration-instant:
    $type: duration
    $value: "0.1s"
  duration-fast:
    $type: duration
    $value: "0.15s"
  duration-normal:
    $type: duration
    $value: "0.2s"
  duration-slow:
    $type: duration
    $value: "0.28s"
  duration-deliberate:
    $type: duration
    $value: "0.38s"
  duration-dramatic:
    $type: duration
    $value: "0.42s"

  easing-default:
    $type: cubicBezier
    $value: [0.4, 0, 0.2, 1]
  easing-enter:
    $type: cubicBezier
    $value: [0.2, 0, 0.1, 1]
  easing-linear:
    $type: cubicBezier
    $value: [0, 0, 1, 1]

  animation-spin:
    $type: string
    $value: "16s linear infinite"
  animation-spin-slow:
    $type: string
    $value: "18s linear infinite"
  animation-spin-reverse:
    $type: string
    $value: "12s linear infinite reverse"
  animation-fade-in:
    $type: string
    $value: "0.3s ease"
  animation-blink:
    $type: string
    $value: "1.4s infinite"
  animation-pulse-ring:
    $type: string
    $value: "1.2s infinite"
  animation-speak-wave:
    $type: string
    $value: "0.8s infinite"
  animation-wake-pulse:
    $type: string
    $value: "2.5s infinite"
  animation-orb-idle:
    $type: string
    $value: "5s ease-in-out infinite"
  animation-orb-listen:
    $type: string
    $value: "1.2s ease-in-out infinite"
  animation-orb-think:
    $type: string
    $value: "3s linear infinite"
  animation-orb-speak:
    $type: string
    $value: "0.8s ease-in-out infinite"
  animation-orb-bar:
    $type: string
    $value: "0.9s infinite"
  animation-ptt-glow:
    $type: string
    $value: "1.2s infinite"

# ── Breakpoints ──────────────────────────────────────────────
breakpoint:
  mobile:
    $type: dimension
    $value: 479px
  tablet:
    $type: dimension
    $value: 1023px
  desktop-xl:
    $type: dimension
    $value: 1600px

# ── Grid ─────────────────────────────────────────────────────
grid:
  message:
    $type: string
    $value: "72px 1fr"
  message-gap:
    $type: dimension
    $value: 24px
  hero:
    $type: string
    $value: "52% 48%"

# ── Opacity ─────────────────────────────────────────────────-
opacity:
  full:
    $type: number
    $value: 1
  high:
    $type: number
    $value: 0.85
  medium:
    $type: number
    $value: 0.55
  low:
    $type: number
    $value: 0.38
  faint:
    $type: number
    $value: 0.18
  ghost:
    $type: number
    $value: 0.06
---

# J.A.R.V.I.S Local Agent — Design System

## Design Philosophy

The interface is built around the idea of **technical quiet** — a dark, unobtrusive environment that feels like a piece of precision hardware rather than a consumer web app. The aesthetic borrows from cinematic HUDs, editorial typography, and early-2000s sci-fi interfaces, but restrains itself with generous whitespace, muted color, and deliberate motion.

The core metaphor is a **local intelligence**: something that lives inside your machine, not in the cloud. This is communicated through:
- A near-black void background that suggests an infinite terminal space
- Teal and cyan accents that evoke phosphor glow and circuit boards
- Monospace labels that feel like system readouts
- Corner bracket decorations that frame the viewport like a camera reticle
- A persistent noise texture that adds analog grain to the digital surface

The personality is confident but not arrogant — the Gen-Z voice of the AI is reflected in the UI through bold display typography, tight letter-spacing on labels, and playful but controlled motion (spinning orbs, breathing rings, wave-form visualizers).

## Color System

The palette is extremely narrow by intention. Three hues carry the entire interface:

1. **Teal (`#00dcb4`)** — The primary accent. Used for the online status, active states, user-message tint, send button, and the core of the voice orb. It represents life, activity, and the AI's presence.
2. **Cyan (`#00a8ff`)** — The secondary accent. Used for secondary rings, thinking states, and hover highlights. It provides cool contrast to the warmth of teal.
3. **Amber (`#f0b040`)** — The wake-word color. Used exclusively for the microphone wake-state and pulse animations. It signals "attention" without the urgency of red.

Text exists in three opacities of the same off-white (`#e8ebe9`):
- **Primary (100%)** — Body text, headings, active labels
- **Muted (38%)** — Secondary labels, hints, inactive tabs
- **Dim (18%)** — Tertiary info, disabled states, decorative text

Borders are almost always white at very low opacity (6–15%). This creates separation without introducing new colors. The only colored borders are the accent teal at 25% opacity and the danger red at 20% opacity for error bars.

Backgrounds are stacked in three depths:
- **Void (`#080909`)** — The absolute background. Nothing sits behind this.
- **Surface (`#0f1010`)** — The sidebar, header, and input field.
- **Raised (`#151717`)** — Code blocks, toggle pills, and elevated containers.

## Typography

Three typefaces create a strict hierarchy:

### Display — Syne
Used for brand identity, hero headlines, and voice-state labels. Set in all-caps with extremely wide letter-spacing (`0.18em`–`0.28em`). The hero title breaks this rule: it is mixed-case, ultra-bold (800), tightly tracked (`-0.03em`), and massive (`clamp(40px, 6vw, 84px)`). This contrast between the whispered labels and the shouting headline is intentional — it creates editorial drama.

### Body — DM Sans
Used for all readable content: chat bubbles, voice replies, subtitles. Always light weight (300) with relaxed line-height (1.75). The light weight prevents the interface from feeling heavy despite the dark background.

### Mono — DM Mono
Used for UI chrome: status text, button labels, section headers, timestamps. Always small (8–10px), all-caps, wide letter-spacing. This is the "system voice" of the interface — precise, mechanical, quiet.

## Layout & Spacing

The layout is a classic **sidebar + main** split, but treated with editorial restraint.

- **Sidebar**: Fixed 220px width. Contains navigation, model selection, controls, and session history. Collapses to zero width on desktop with a smooth `0.28s` cubic-bezier transition. On mobile it becomes a fixed drawer that slides in from the left.
- **Header**: 56px fixed height. Contains the logo ring, brand title, and connection status. The logo is a 32px animated SVG with two counter-rotating dashed rings.
- **Main Content**: Flex column containing tab panels. Chat messages use a **two-column editorial grid**: a 72px meta column (mono label) and a fluid content column, separated by 24px.
- **Footer**: Contains the input row and hint text. Max-width 820px, centered, creating a comfortable reading measure.

Spacing is generous. Messages receive 32px horizontal and 20px vertical padding. The hero empty-state anchors text to the bottom-left with 48px/52px padding, mimicking the layout of high-end editorial sites.

## Surfaces & Elevation

Elevation is communicated almost entirely through **z-index layering** and **subtle borders**, not shadows. The interface rejects the Material Design shadow language in favor of a flatter, more technical approach.

- **Borders**: 1px `rgba(255,255,255,0.06)` is the default. Hover states brighten this to `0.12`. Focus states switch to the teal accent at `0.25`.
- **Active states**: Do not use solid fills. Instead, they apply a tinted background (`rgba(0,220,180,0.12)`) or a thin left border.
- **Code blocks**: Raised surface (`#151717`) with a 2px left border in teal. No border-radius.
- **Input field**: Surface background with a bright bottom border that shifts to teal on focus. No outline, no shadow.

The only true shadows are:
- **Hero text glow**: A soft white+teal double shadow that makes the headline float forward.
- **PTT glow**: An expanding ring shadow on the voice push-to-talk button when active.
- **Wake pulse**: A radial shadow that pulses outward from the wake-word button.

## Motion & Animation

Motion serves two purposes: **feedback** and **atmosphere**.

### Functional Motion
- **Tab transitions**: A 3D perspective flip. The exiting panel rotates away on the Y-axis (`rotateY(-40deg)`) while fading out; the entering panel unfolds from the opposite side. Duration `0.38s` exit, `0.42s` enter. This is the most dramatic motion in the system.
- **Sidebar collapse**: Width animates with `cubic-bezier(0.4, 0, 0.2, 1)` over `0.28s`.
- **Button feedback**: Send button scales to `0.96` on press. Hover transitions are universally `0.2s`.
- **Message entrance**: New messages fade in and slide up (`fadein 0.3s ease`).

### Atmospheric Motion
- **Logo rings**: Two SVG circles counter-rotate continuously (16s and 10s). This is the heartbeat of the idle interface.
- **Voice orb**: A complex SVG with three counter-rotating dashed rings. In idle it breathes opacity; in listening it scales gently; in thinking it spins; in speaking it pulses.
- **Orb wave bars**: Seven vertical bars animate at staggered delays when the system is listening, creating a classic audio-visualizer effect.
- **Hero 3D canvas**: A Three.js icosahedron with wireframe shells, particle field, and equatorial rings. It rotates slowly and responds to mouse position with parallax. State changes (listening/thinking/speaking) modulate rotation speed and wireframe opacity.
- **Particle canvas**: A 2D canvas behind the hero text with 60 drifting dots that connect to the mouse cursor with faint lines.
- **Noise overlay**: A fixed full-screen SVG fractal noise at 3.5% opacity, animated via `background-size` tiling. It gives the entire interface a subtle film-grain texture.

## Components

### Chat Message
- Grid layout: `72px 1fr`, gap `24px`
- Meta label: 9px mono, uppercase, wide tracking, teal tint for user messages
- Bubble: 15px body text, light weight, 1.75 line-height, pre-wrap
- User messages receive a `rgba(0,220,180,0.05)` background tint
- Bottom border: `1px solid rgba(255,255,255,0.07)` separates messages

### Voice Orb
- 180px × 180px SVG (130px on mobile, 240px on large screens)
- Five concentric elements: three dashed rings, two filled circles, one core dot
- Rings use `stroke-dasharray` patterns (4 3, 2 4, 3 4) to feel technical
- Core dot pulses opacity in sync with breathing animation
- State classes apply distinct CSS animations

### Input Row
- Flex row: textarea, voice button, send button
- Textarea: auto-resizing, max 160px, no scrollbar until overflow
- Voice button: 40px square, bordered, shows red pulse-ring when listening
- Send button: 40px square, solid teal, black arrow icon

### Toggle Pill (TTS)
- 28px × 14px track, 1px border
- 8px × 8px thumb, slides 14px on activation
- Active state: teal border, teal thumb, tinted track background

### Error Bar
- Left border: 2px solid red
- Background: `rgba(255,68,85,0.06)`
- Text: 11px mono, soft red
- Appears above input row, auto-dismisses after 6s

### Speaking Bar
- Fixed position, centered horizontally, above footer
- Teal top border, flex row with animated wave bars
- Click to cancel speech
- Hidden by default, shown only during TTS playback

### Corner Brackets
- Four fixed 20px squares at viewport corners (12px on mobile)
- 1px solid `rgba(255,255,255,0.15)` borders
- Only two sides each: top-left, top-right, bottom-left, bottom-right
- Creates a subtle "viewfinder" frame around the entire application

## Responsive Behavior

### Mobile (≤479px)
- Sidebar becomes a full-height fixed drawer (240px) that translates in from the left
- Bottom mobile nav appears: 56px fixed bar with two tabs (Chat / Voice)
- Header compresses to 50px; status text hidden
- Hero stacks vertically; right column becomes 240px tall
- Messages use 48px meta column and 12px gap
- Footer padding tightens; hint text hidden
- Voice orb shrinks to 130px

### Tablet (480–1023px)
- Sidebar remains visible but can be collapsed
- Hero maintains horizontal split (55/45)
- Message meta column reduces to 56px
- Control labels (wake, TTS) hidden to save space

### Large Desktop (≥1600px)
- Root font-size scales to 18px
- Header grows to 68px
- Message padding increases to 28px/56px
- Input row max-width expands to 1100px
- Voice orb scales to 240px
- All spacing scales proportionally

## Decorative Elements

### Noise Texture
A full-screen fixed pseudo-element applies an SVG fractal noise filter at 128px tile size and ~3.5% opacity. This is not a background image in the traditional sense — it is a texture layer at `z-index: 1000` that sits above everything but uses `pointer-events: none`. The effect is subliminal: the interface feels like it is rendered on matte paper or an old LCD rather than a glossy screen.

### 3D Hero Object
When no chat history exists, the right half of the empty state displays a Three.js scene containing:
- A large wireframe icosahedron (teal, opacity 0.55)
- A smaller inner wireframe icosahedron (cyan, opacity 0.22)
- An atmospheric glow sphere (teal, opacity 0.04)
- Two equatorial rings at different tilts
- A bright core dot
- 200 drifting particles

The object rotates continuously and responds to mouse/touch with parallax rotation. State changes from the voice system (listening, thinking, speaking) modulate rotation speed and wireframe opacity, making the 3D object a literal visualization of the AI's internal state.

### Particles Canvas
A 2D canvas layered behind the hero text contains 60 small dots that drift slowly and draw faint connecting lines to the mouse cursor within a 150px radius. This creates a sense of the interface being "alive" and responsive to the user's presence.
