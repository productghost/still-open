# Still Open – An interactive 3D Portfolio

Still Open is a personal 3D portfolio set outside a late‑night corner store.

## Concept

Single 3D scene: exterior of a corner store at night, viewed from the sidewalk.

Focus on mood: cozy, human, slightly mischievous; not corporate or "tech lab."

Goal: help visitors quickly understand what I do and invite them to explore at least one project or experiment.

For more detail, see the high‑level docs in the docs/ folder.

## Tech Stack (planned)

- Next.js (App Router)
- React + WebGL
- Deployed via Vercel

The scene and lighting are authored in Blender; the web code focuses on loading the model, handling camera framing, and wiring up interactions.

## Interaction Overview

- Scene is visible on load; interaction is enabled after a simple "Arrive" action.
- Navigation is driven by a physical signpost and clickable objects (door poster, vending machine, stall, board, ATM).
- No zoom or free‑fly camera; movement is limited to gentle, authored framings.

Implementation details live in separate specs (camera, environment, content mapping).

## Repo Structure (simplified)

- `app/` – Next.js app entry and routes
- `components/` – UI shell around the 3D scene
- `scene/` – 3D + interaction logic and configuration
- `public/assets/` – GLB, textures, environment maps
- `docs/` – Design and implementation notes
- `scripts/` – Small validation utilities

## Notes

This is a personal, non‑commercial project.

The repo is structured so AI coding assistants can help evolve it while keeping the concept consistent.
