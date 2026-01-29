Camera & Navigation Spec v0.1 — Still Open

This document defines all camera behavior, navigation logic, and input handling for Still Open.
If any implementation, interaction, or camera behavior conflicts with this document, this document wins.

This spec defines:
- Camera behavior and movement semantics
- Navigation triggers and hierarchy
- Allowed and forbidden inputs
- Transition logic and constraints

This spec does not define: visual styling, lighting values, shader behavior, exact easing formulas, or low‑level Three.js/WebGL code.

## Entry Flow Overview

1. Visitor opens www.stillopen.xyz.
2. While the 3D scene and assets load, a simple loading UI is shown (exact design defined in other specs).
3. When loading completes, the scene is rendered in CAM_DEFAULT, but the phase is `PRE_ARRIVAL`:
   - camera locked,
   - no movement,
   - main CTA “ARRIVE” visible.
4. When the visitor taps/clicks “ARRIVE” for the first time:
   - phase becomes `ARRIVED`,
   - an optional initial reveal plays: camera starts slightly further back on the sidewalk and moves forward into CAM_DEFAULT, then stops.
5. On all later visits in the same session:
   - after loading, phase may start directly in `ARRIVED` at CAM_DEFAULT without replaying the reveal animation.

1. Core Navigation Principle (Non‑Negotiable)
Navigation is achieved by reframing the same place, not by changing places.

The visitor:
- never teleports
- never changes scenes
- never enters interiors
- never free‑flies around the model

They remain outside, on the sidewalk, facing the storefront.
All movement represents attention, not locomotion.

If the camera draws attention to itself, it is wrong.

2. Camera Mental Model
The camera behaves like a person on the sidewalk:

- turning their head
- subtly shifting their stance
- leaning in only when intentionally guided

The camera does not behave like:
- a drone
- orbit / trackball control
- FPS
- cinematic rail cam

Rule: if the experience feels like “controlling a camera,” adjust it until it feels like “standing there and looking around.”

3. States and Phases
There are exactly two high‑level phases.

3.1 PRE_ARRIVAL
Scene is fully visible and rendered.

Camera is locked to the CAM_DEFAULT frame.

No camera movement from user input.

Hover or subtle cues are allowed (e.g., signpost glow), but camera position/rotation must not change.

A primary CTA (“ARRIVE”) is visible in the HUD.

3.2 ARRIVED
Triggered only when the visitor clicks/taps the ARRIVE CTA.

Scene does not reload or switch to a new angle; camera remains where it is and controls become active.

All navigation and camera interactions described here are enabled.

Implementation note: store phase in global state as a union type:
'PRE_ARRIVAL' | 'ARRIVED'.

4. Camera Frames (Anchors)
The environment defines six authored camera frames, each represented by a fixed anchor in the scene:

CAM_DEFAULT — sidewalk / neutral
CAM_ABOUT — glass door poster
CAM_PROJECTS — vending machine
CAM_EXPERIMENTS — food stall
CAM_NOTES — community board
CAM_CONTACT — ATM

Rules:
Frames are discrete, intentional states; only one is active at a time.

Frames are never dynamically generated.

Frames represent focus, not physical relocation to a different place.

CAM_DEFAULT is the home state; all navigation ultimately returns here.

Technical shape for each anchor (in scene/anchors/anchors.json):

id (one of the six above)

position (camera position in world coordinates)

target (look‑at point in world coordinates)

yawBounds (min/max horizontal deviation allowed from base frame)

heightBounds (min/max camera height, or pitch bounds if you later choose tilt)

Optional: any additional per‑frame options (e.g., ease, duration overrides).

All camera framing must come from anchors.json; no hard‑coded camera values elsewhere.

5. Default State — CAM_DEFAULT
Purpose: arrival, orientation, rest.

Behavior:

Camera at sidewalk distance, human eye height.

Storefront fully readable; no single semantic element in tight focus.

Allowed input in ARRIVED phase:

Click/tap + drag → view adjustment (Section 7).

Signpost click/tap → transition to focused frame (Section 9).

Double click / double tap on a semantic element → transition to its frame (Section 10).

CAM_DEFAULT is the neutral place the visitor can always step back to.

6. Focused States
(CAM_ABOUT, CAM_PROJECTS, CAM_EXPERIMENTS, CAM_NOTES, CAM_CONTACT)

Purpose: intentional attention on one offering.

Behavior:

Camera transitions to the frame’s authored composition.

One semantic element is primary; others may remain visible but clearly secondary.

Constraints:

No lateral “sliding around” beyond the bounded view adjustment described in Section 7.

View‑adjustment bounds are tighter than in CAM_DEFAULT.

No nested focus states; no “frame inside a frame.”

Do not chain directly from one focus to another without finishing the current transition (transitions always start from the current pose).

Perceived “moving closer” happens only via transitions between anchors, not via user‑controlled zoom.

7. Continuous Input — View Adjustment
There is no zoom in this experience.

7.1 Input mapping
Desktop: left mouse button drag only.

Touch devices: single‑finger drag only.

Two-finger pinch for zoom

7.2 Behavior
View adjustment is the only continuous camera input.

Horizontal drag (X‑axis)

Rotates the view left/right around a vertical axis (yaw).

Rotation is bounded per anchor via yawBounds so that:

The visitor cannot move behind the store.

No extreme angles that feel like spinning or flipping the scene.

Vertical drag (Y‑axis)

Adjusts camera height, not FOV and not exaggerated pitch.

Drag up → camera moves a bit higher (slightly above eye level).

Drag down → camera moves a bit lower (closer to ground), within limits.

At max “down,” the visitor sees a bit more ground in front, not an extreme worm’s‑eye view.

At max “up,” the camera must not tilt into a top‑down view; there is a clear upper bound.

Rules:

Horizon should feel stable; any pitch change, if used, is very subtle and never reveals rooftops or the back of the building.

Movement is subtle and bounded in speed and responsiveness, simulating stance shifts rather than aggressive free‑look controls.

8. Zoom, Dolly, and FOV (Forbidden)

There is no scroll‑wheel or desktop zoom. On mobile, zoom is allowed only via two‑finger pinch, within strict limits

Mobile pinch zoom only changes distance within a narrow range: close enough to read content clearly, far enough that the visitor still feels outside on the sidewalk; no extreme macro/inside views

The following are never allowed:
- Scroll wheel zoom
- Trackpad pinch zoom
- Touch pinch zoom
- Mouse wheel changing camera distance or FOV
- Dolly (forward/back) movement via drag
- FOV changes tied to input
- Full 360° “spin the model” orbit viewer behavior

All forward “movement” happens only through authored transitions between frames.

If any zoom or free‑orbit behavior appears in implementation, it is incorrect.

9. Transition Model
9.1 Context‑Aware Transitions
Transitions always start from the current camera state (position + orientation + height).
The camera does not reset to CAM_DEFAULT before moving.

The camera interpolates smoothly from the current state into the target frame’s authored composition.

Applies to:
- Signpost navigation
- Double click / double tap navigation
- Back / return to CAM_DEFAULT
- Result: feels like “I turned and stepped closer from where I already was,” not “I got reset and replayed.”

9.2 Transition Rules (All Transitions)
Duration guideline: 800–1200 ms for typical transitions.

Motion: smooth, continuous, human; no overshoot, bounce, snap, or camera roll.

No FOV changes during transitions.

During transitions:
- Continuous drag input is ignored.
- No zoom or FOV changes.

Atmosphere (lighting, glow, etc.) remains unchanged.

9.3 Initial Reveal (Optional)
When the 3D world has finished loading and the user activates the main CTA for the first time:

Start slightly further back on the sidewalk, same general axis as CAM_DEFAULT.

Move forward toward the storefront and gently settle into CAM_DEFAULT.

Duration: about 1200–1600 ms, with the same smooth character as other transitions.

Plays once per new session only; later visits start directly in CAM_DEFAULT.

This should feel like a human walking up, not a drone fly‑through.

10. Primary Navigation — Signpost
The signpost is the primary, explicit navigation system.

Rules:

Each sign maps 1:1 to a camera frame (CAM_ABOUT, CAM_PROJECTS, etc.).

Clicking/tapping a sign always transitions to that frame, using the transition model above.

When a focused frame is active, a subtle Back affordance returns to CAM_DEFAULT.

The signpost is always visible/reachable from CAM_DEFAULT.

Signs express intent (“look there”), not content.

11. Secondary Navigation — Gesture Focus
Gesture navigation is optional but allowed.

Allowed gesture:

Double click / double tap on a semantic element (poster, vending machine, stall, board, ATM, or the signpost).

Behavior:

Triggers transition to that element’s camera frame.

Transition starts from the current state (no reset to CAM_DEFAULT).

Constraints:

Gestures can only activate existing frames.

No gesture‑only destinations; every destination must also be reachable via the signpost.

If gestures are never discovered, the experience is still complete.

12. Input Priority
When inputs conflict, priority is:

Signpost click / tap

Double click / double tap on semantic element

Click / tap + drag (view adjustment)

Higher‑priority input cancels any lower‑priority input in progress.

All other inputs (e.g., keyboard, secondary mouse buttons, multi‑touch) are ignored unless explicitly added later with an updated spec.

13. Back / Return to Default
When in any focused state (CAM_ABOUT, CAM_PROJECTS, CAM_EXPERIMENTS, CAM_NOTES, CAM_CONTACT):

A subtle, consistent Back affordance is present in the HUD.

Back behavior:

Transitions to CAM_DEFAULT.

Uses the same smooth interpolation rules as Section 9.

Preserves as much orientation and height as possible within CAM_DEFAULT’s framing.

Optional secondary triggers (only if they don’t conflict with other inputs):

ESC key

Click/tap on “empty” background areas

Back represents stepping away and returning to the sidewalk.

14. Relationship to Atmosphere
Camera and navigation:

Do not change lighting setups, particles, or glow.

Do not “punch up” atmospheric effects during motion.

Atmosphere is constant and indifferent to navigation.

Any atmospheric variation (if ever added) must be subtle and independent of camera control.

15. Accessibility & Clarity
All destinations are reachable via the signpost.

No gesture‑only paths.

No timing‑sensitive input, no high‑dexterity requirements.

If gestures are ignored, motion is reduced, or performance is constrained, the experience remains legible and navigable.

16. Implementation Notes for AI Assistants
Implement camera logic in a dedicated component (e.g., SceneCameraController) inside scene/, separate from content meshes.

All anchor definitions come from scene/anchors/anchors.json; helpers may read and cache this file but must not redefine values.

Any new interaction proposal (e.g., keyboard navigation, inertia, auto‑pan) must be checked against this spec and the Master Experience Spec and should only be added after explicit approval and a spec update.

17. Final Navigation Truth
The experience should feel like:

“I am standing here, outside.
I turned toward something.
I leaned in.
I never lost my place.
I can always step back.”