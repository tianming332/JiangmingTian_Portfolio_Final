# TJM UI / Motion Upgrade — 2026-09-29

## Scope

- 8 public center pages: all works, commercial projects, applied projects, annual portfolios, gallery, videos, workflows and about.
- All 17 independent case studies in the canonical deployment map.
- Existing artwork, project descriptions, specialized case-study sections, media, project IDs and production destinations are retained.
- The admin screen, redirect-only pages and the empty `TIAN-xxx` placeholder are intentionally outside the visual redesign.

## Changes

- Two-section work index: the original diffuse-blue glass filter area followed directly by the plain work grid; three cards per row on desktop.
- Full-image translucent frosted-glass covers offset 8px from the image; hover or keyboard focus fades the glass away to reveal the clean artwork. Touch retains the cover.
- Mobile filter disclosure, selected-state semantics and live result announcements. Filtering still **prioritizes** matching work instead of removing other projects.
- Interruptible FLIP reordering, restrained press feedback, heading reveals, scroll entrances, pointer highlights and hover depth.
- Welcome restored to the original layout, floating text network, typography, controls and selection flow. Choosing three tags or random exploration automatically enters the work index. The added pause/skip controls and mobile tag-grid redesign were removed.
- The restored welcome stops its animation loop on dismissal, in background tabs and under the OS reduced-motion preference; the original floating layout is retained on mobile.
- Enhanced native image dialog across case studies: previous/next, image count, caption, zoom, horizontal/vertical native scrolling when enlarged, ArrowLeft/ArrowRight, Escape and focus return.
- Reading-progress / back-to-top control, keyboard skip link and reduced-motion protections.
- Mobile menu opener moved into the header so settings no longer cover it. Closed navigation and settings are inert to keyboard focus.
- Local previews navigate between both workspace folders; public deployment links are unchanged. Preference query parameters travel with project links.
- Fixed the original motion initialization exception (`NodeList.indexOf`).

## Design references

The user-provided shadcn/ui, Kinetics, Theatre.js, Anime.js, Colorion Text Effects and Hyperiux Vault sites were reviewed for interaction and motion direction. The implementation is original CSS, native Web Animations, Pointer Events and native dialogs. No React migration, animation/CDN dependency, third-party paid effect source, or runtime WebGL dependency was introduced.

## Canonical source / maintenance

The existing `skills/tjm-web-skill` remains the authority for shared components. Each case study loads exact canonical snapshots rather than maintaining another near-identical settings/sidebar implementation. Original project-specific CSS and scripts remain in place.

Run from this folder:

```sh
python3 scripts/sync-ui.py
python3 scripts/sync-ui.py --check
node scripts/test-ui.cjs
```

The sync command first updates the skill's center-source snapshot and route map, then copies six exact assets into every configured case-study folder: motion CSS/JS, sidebar CSS/JS, settings/navigation JS and the canonical shell stylesheet. The check command is read-only. Bump public HTML asset query versions after a later change to avoid stale browser caches.

## Validation

- 25 public pages × 3 viewports (1440×900, 1280×720, 390×844): 75 browser checks; no horizontal page overflow, duplicate shell components or observed broken loaded images.
- All 25 static entrypoints: local script/style/image references resolve; one motion CSS and one motion script each.
- Three languages × three themes checked on the center; persistence and cross-page preference transfer checked.
- Center and representative case-study shell geometry exactly matches at all three viewports.
- Native lightbox navigation/zoom/Escape/focus return, mobile filter expansion and mobile-menu Escape verified in-browser. The welcome was subsequently restored per user feedback.
- 18 dependency-free regression tests, including production/local routing, restored welcome lifecycle, full-image glass coverage and exact AI-tool list contents.
- Canonical skill snapshot and all 17 detail-site copies pass byte-for-byte synchronization checks.

Evidence and source backup: the workspace's `output/ui-upgrade-20260929` folder. Reduced-motion lifecycle is unit-tested; visual QA used the normal browser motion setting. Lazy media was checked statically and when loaded, not every project video was played end-to-end.

## Release status

**Local changes only. No Git commit, push, or production deployment was performed.** Existing unrelated working-tree changes were retained.

## User revision — 2026-09-29

- Restored the pre-upgrade welcome markup from the source backup and removed the added welcome styling. Original three-tag auto-enter and random exploration behavior restored. Shell completion events and reduced-motion/background safety retained.
- Work cards now have frosted glass covering the entire image, not only the lower caption area. Glass remains visible on hover.
- About → AI Tools now lists exactly: claudecdoe; vscode+claude/cline; codex; comate; cursor; GPT5-6; opus4.4-5; GLM5; gemin3; grok4. User spelling/case retained.
- All unrelated UI upgrades retained. Revision backup/screenshots are in `output/ui-revision-20260929`. Still local-only; no deployment.

## Screenshot-guided refinement — 2026-09-29

This revision supersedes the preceding glass hover behavior.

- Welcome: only the two bottom-right buttons regain the first-pass 12px corners and 340ms press/rebound animation; the restored floating-word layout and original selection flow are unchanged.
- Work cards: full-image glass is offset 8px right/down and clipped within the rounded artwork frame, matching the supplied screenshots. Desktop hover and keyboard focus fade it away, including labels and its arrow; mouse leave restores it. Touch screens retain the glass. The clean artwork has no pointer-light overlay or zoom jump.
- Selected filter chips: black background, white primary text, translucent white English labels; dark theme keeps a visible gray edge. Other blue accents, such as project match outlines, are unchanged.
- AI-tool content, shared navigation/settings geometry, and all other previous improvements remain unchanged.

Revision evidence and backup: `output/ui-refinement-20260929`. Local only, not deployed.

## Two-section homepage revision — 2026-09-29

- Removed the added editorial title/introduction block. `#all-works` once again targets the filter section, followed immediately by the work grid.
- Reused the existing canonical diffuse-blue filter background and translucent glass panel from `custom.css`, instead of creating a second approximate design. The lower work section uses the theme surface (white in the default theme); gray/black theme compatibility retained.
- Homepage desktop grid restored to three columns from 1200px; narrower screens retain responsive columns.
- Welcome confirm button uses black with white text in idle, hover and ready states; 12px rounded corners and rebound behavior unchanged.
- Offset glass, hover reveal, black filter selections, AI-tool content and all unrelated pages remain unchanged.

Backup and visual evidence: `output/ui-two-sections-20260929`. Local-only changes; no push or deployment.
