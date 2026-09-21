# GameIndex Beta 0.991 I1 HF2

Public version: **0.991**  
Internal release: **0.991-I1-HF2**  
Release code: **BETA_0_991_I1_HF2_CREATOR_ANIMATION_EDITOR**  
SQLite schema: **44**

## Creator Authority Restoration

HF2 fixes the state where an account could display the **CREATOR** identity while having no administrative capabilities.

The authority model is now synchronized across:

- `users.role = ADMIN`
- internal DEV tier
- `staff_role_assignments = CREATOR`
- `admin_connections = CREATOR / ACTIVE`
- `primary_creator_user_id`
- the centralized capability snapshot

Migration 044 repairs **missing** Admin Connections for active CREATOR/DEV assignments. It does not reactivate an explicitly existing `INACTIVE` or `REVOKED` connection.

First-owner setup and secure owner recovery now establish the complete Creator authority state instead of assigning only the visible role.

## Admin Panel

The existing sidebar Admin Panel remains the final collapsible section. Its visibility continues to come from server capabilities, not from a frontend-only CREATOR label.

HF2 adds:

- Animation Editor
- a working Admin Connections section in the Admin Control Center
- Creator Authority diagnostics in Admin → Sistema
- safe capability/connection status without exposing credentials

## Animation Editor

HF2 introduces a Creator-focused, timeline-based Animation Editor.

Core capabilities:

- Desktop workspace with Layers, Live Preview, Inspector and Timeline
- Mobile panel mode
- tracks and draggable keyframes
- playhead, scrubbing, timeline zoom, 50 ms snapping, play/pause/restart/loop
- local Undo/Redo
- debounced draft autosave
- DRAFT / PREVIEW / PUBLISHED / ARCHIVED lifecycle
- immutable published revision history
- rollback to a previous published revision
- safe custom HEX colors plus recommended GameIndex identity tokens
- component-specific inspector controls
- GameIndex easing presets
- preset library
- duplication of existing GameIndex cinematics as editable approximations
- critical persistence flush when publishing, rolling back, archiving or binding

Built-in preset families include Creator, DEV, Tester, PRO, Welcome and Theme Power Transfer.

Animation definitions are declarative JSON. Arbitrary JavaScript, arbitrary properties and unknown components are rejected server-side.

## Persistence

HF2 preserves the I1 HF1 architecture:

```
GitHub
  ↓
Render Free
  ↓
temporary SQLite runtime
  ↕
Neon PostgreSQL
  ↓
durable versioned SQLite snapshots
```

On Render, `DATABASE_URL` remains mandatory. A Render-local SQLite path is never treated as durable production storage.

Animation tables live in schema 44 and are automatically included in the Neon-backed SQLite snapshots.
