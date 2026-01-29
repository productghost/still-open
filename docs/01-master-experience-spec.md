# STILL OPEN – MASTER EXPERIENCE SPEC

## 0. Status, Purpose, and Authority

This document defines the **experience contract** for Still Open.

All other specs (environment world, camera navigation, content mapping, element inventory, and technical delivery) must conform to this document.

If any implementation, feature, or decision conflicts with this document, **this document wins**.

When in doubt, implementation should pause and ask for clarification rather than guessing.

This is not:

- A PRD
- A UX wireframe
- A technical brief

This is the **why**, **what**, and **how it should feel**.

---

## 1. Concept Overview

Still Open is a personal, after‑hours experience set outside a corner store at night.

It is inspired by late‑night convenience stores and street‑side stalls — places that remain available when most of the world has shut down.

These places are informal, human, and quietly alive.

They are not destinations you enter; they are places you approach.

The experience exists **outside** the store.

You never go inside.

You are always standing on the sidewalk, but not on a physical street.

The store is a constant presence — lit, open, waiting — while different offerings exist along its exterior.

This is not a simulation of reality.

It is a **distillation of memory and feeling**.

Primary audience:

- Clients and hiring managers who could hire me as an AI Product Manager or a Collaboration.
- Talented peers who should think: “This person is cool, has a clear brand, and understands creative technology / vibe‑coding.”

The experience has “worked” when a visitor thinks **“wow, this is awesome, I want to see more”** and explores at least one project or experiment that links out (for example, to GitHub).

---

## 2. Meaning of “Still Open”

“Still Open” does **not** mean:

- nightlife
- partying
- exclusivity
- excess

“Still Open” means:

- available after hours
- present when others disengage
- open to ideas, stories, and work
- unhurried attention

The phrase implies **continuation**, not escalation.

The experience should feel like:

- something that is still there
- something you can approach
- something that doesn’t need to convince you

“Still Open” also reflects my own pattern:

daytime is structured and ambitious; after hours is where my best, most personal work and experiments happen.

---

## 3. Core Metaphor

The core metaphor is:

> A corner store at night, viewed from the outside.
> 

Key implications of this metaphor:

- You do not wander freely.
- You do not explore interiors.
- You reposition yourself along a façade.
- You lean in toward things that interest you.
- You step back when you’re done.

This metaphor must remain legible even if the visuals become abstracted or minimal.

If the implementation changes, the visitor should still understand: **I am outside a late‑night corner store that is still open, with offerings arranged along its exterior.**

---

## 4. Experience Principles (Ranked)

When decisions conflict, **higher principles override lower ones**.

Each principle includes a practical implication for implementation.

1. **Presence over novelty**
    - The experience should feel calm, grounded, and intentional — never showy.
    - Implication: Prefer one polished, well‑paced interaction over multiple gimmicks; do not add mechanics just to surprise.
2. **Orientation over mystery**
    - Visitors should always understand where they are and how to proceed, even without instructions.
    - Implication: Every framing must show at least one clear, legible affordance (e.g., signpost, storefront element) that suggests what can be explored next.
3. **Reframing over navigation**
    - Navigation does not change scenes or locations; it reframes the same place.
    - Implication: No routing, no portals, no level changes; all movement is camera adjustment and attention shift within the same exterior scene.
4. **Invitation over instruction**
    - The experience invites engagement; it never demands it.
    - Implication: Copy invites (“Come closer,” “Take a look”) instead of commands (“Click here to continue”); no forced flows, timers, or blocking gates.
5. **Restraint over completeness**
    - Fewer, clearer elements are preferred to exhaustive representation.
    - Implication: If adding an object, effect, or UI element reduces clarity or calm, omit it even if it means leaving content out.

---

## 5. Role of the Visitor

The visitor is **not**:

- a player
- a character
- a protagonist
- an operator

The visitor is a **guest standing outside**.

They have agency through:

- attention
- choice
- focus

Nothing happens unless the visitor chooses to engage.

Mechanical implications:

- No timers, scores, achievements, or completion states.
- No interaction should require speed or precision; camera motion and interactions must be smooth and forgiving.
- The site never traps the visitor in a flow; they can always move their focus or return to a neutral framing without loss or punishment.

---

## 6. Interaction Philosophy (Non‑Mechanical)

All interaction has meaning, not just function.

- Looking = curiosity
- Choosing = commitment
- Moving closer = interest
- Stepping back = openness

Camera movement represents **attention**, not locomotion.

The experience should never feel reactive or twitchy.

Interactions are deliberate, smooth, and human‑paced.

(Concrete camera and input rules live in the camera navigation spec; this section defines **why** those rules exist.)

---

## 7. Navigation Philosophy

Navigation does not change scenes or locations.

Navigation reframes the **same** place.

Orientation (About me, Projects, Experiments, Notes, Contact) is achieved by:

- moving the camera to an authored framing
- bringing a specific part of the storefront into focus

This creates the feeling of:

- standing in the same place, but looking differently

There is always a stable, neutral “Default” framing the visitor can return to in a single simple action.

---

## 8. Signs as Intentional Interfaces

Navigation intent is expressed through **physical signposts** and environmental affordances.

Signs are:

- explicit
- legible
- optional
- part of the environment

Signs **guide attention**; they do not contain content.

Content lives in the world, not on the signs.

---

## 9. Content as Offerings

Content is not presented as pages or sections.

Content is offered through physical elements along the storefront, for example:

- a poster (about me)
- a vending machine (professional projects)
- a food stall (experiments)
- a community board (notes / writing links)
- an ATM (contact / “work with me”)

Each offering feels:

- intentional
- finite
- curated

There is no infinite scroll, feed, or content dump.

Visitors may leave wanting more; that is acceptable and preferred to overload.

---

## 10. Absence of People

There are **no people** present in the scene.

This is intentional.

Absence:

- avoids narrative distraction
- keeps the experience professional
- allows projection
- reinforces stillness

The space feels **available**, not abandoned.

Any future proposal to add characters, silhouettes, or avatars is considered a major conceptual change and must be explicitly approved and reflected in an updated Master Spec.

---

## 11. Tone and Brand

Desired tone (always welcome):

- playful
- impressive
- cozy
- energetic
- creative
- mischievous
- human
- narrative

Never‑appropriate tone or framing:

- corporate
- conservative
- “AI lab” / clinical studio
- sterile, over‑designed tech demo
- crypto/tech‑bro vibes

Key tensions to preserve in copy and behavior:

- recruiter‑friendly but not recruiter‑designed
- professional but mischievous
- experimental but intentional
- narrative‑first but technically sharp

“Still Open” as brand:

- The brand leads; my real name appears in appropriate places (for example, About me and Contact) but is not the primary title or logo.
- The brand reflects my duality: ambitious and structured by day, playful and messy by night.
- The space should feel like a **beautifully chaotic, human place** where stories, emotions, ideas, and experiments collide — structured enough to be intentional, loose enough to feel alive.

Forbidden or sensitive themes:

- No explicit party, drug, or club imagery as focus.
- No religious symbols or any visuals that could read as harmful or exclusionary.
- No cultural appropriation
- Context‑appropriate background details (for example, a couple of beer bottles on a shelf) are acceptable but must never become central.

---

## 12. Temporal Quality

The experience should feel:

- late
- unhurried
- continuous

There is no sense of progression, levels, or completion.

The site does not “end”.

It simply remains open.

Session implications:

- The experience may remember shallow context (for example, last section visited) but should not track or visualize “progress.”
- Visitors should feel free to leave and return; the space always welcomes them back without ceremony.

---

## 13. Longevity and Evolution

The concept must survive:

- removal of 3D
- visual redesigns
- content growth
- technology changes

If reduced to a static image with subtle motion, the experience should still make sense as **Still Open**.

The metaphor must outlive the implementation.

Allowed evolution **without** changing this document:

- Different art direction, as long as it preserves: late‑night, warm/cool contrast, subtle glow, human/cozy energy.
- Adding or removing specific projects, experiments, or notes within the existing offerings.
- Visual refreshes of props/signage that do not alter the core metaphor of a late‑night corner store exterior.

Changes that **do** require updating this document:

- Introducing people, avatars, or characters.
- Making interiors explorable or primary.
- Adding new major content categories that require additional metaphors beyond the current offerings.
- Shifting the tone toward nightlife, club culture, or anything that contradicts the “available after hours, unhurried attention” quality.

---

## 14. Scope Protection and Collaboration with Tools

This Master Spec is intentionally high‑level and **scope‑protective**.

Any tool or collaborator (including AI assistants) working on Still Open must:

1. Treat this document as the source of truth for concept, tone, and boundaries.
2. Avoid introducing new interaction paradigms, content categories, or thematic elements that conflict with these principles.
3. If a new idea appears to require breaking or bending these rules, **pause and ask for explicit permission** and, if approved, reflect the change in an updated version of this Master Spec.

Other specs (environment world, camera navigation, content mapping, performance, security, etc.) may be detailed and technical, but they must remain consistent with the intent defined here.

---

## 15. Final Truth Statement

If this experience works, visitors should feel:

> “I didn’t expect this —but I understand it.I stayed longer than I thought.I can come back.”
>