---
name: pexels-source
description: Search and download media from Pexels API with provenance metadata sidecar files
---

# Pexels Media Sourcing Skill

Search, download, review, and catalogue media from the Pexels API. Every downloaded asset gets a machine-readable `.meta.json` sidecar file for full provenance tracking.

## NEVER HOTLINK

You MUST download every image to `public/media/`.
You MUST NEVER use a Pexels URL, CDN URL, or any external URL as an image `src`.
The `downloadUrl` in sidecar metadata is for provenance only.
All image references in code must use relative paths: `public/media/...` or `/media/...`.
If you reference an external URL as an image source, this is a CRITICAL BUG.

## Prerequisites

- `PEXELS_API` environment variable must be set
- Node.js with `--experimental-transform-types --experimental-detect-module`

## Workflow

### 1. Search

```bash
node --experimental-transform-types --experimental-detect-module \
  scripts/media/pexels-search.ts "<query>" [orientation] [perPage]
```

Example:
```bash
node --experimental-transform-types --experimental-detect-module \
  scripts/media/pexels-search.ts "modern film studio interior, dramatic lighting" landscape 10
```

### 2. Download

Use the `downloadPhoto` function from `scripts/media/pexels-download.ts` to download selected photos. Each download creates:
- The media file at the specified output path
- A `.meta.json` sidecar file alongside it

### 3. Review

Use `reviewCandidates` from `scripts/media/pexels-review.ts` to evaluate candidates for:
- Minimum resolution (default 1920x1080)
- Color palette classification (light/dark/universal)
- Alt text quality
- Aspect ratio suitability

### 4. Pair Selection

Use `selectPairs` from `scripts/media/pexels-pair.ts` to select the best light/dark pair from reviewed candidates. The pairing logic:
- Finds the highest-scoring light and dark candidates
- Verifies sufficient contrast between them
- Falls back to a single universal image if no valid pair exists

## Output Structure

```
public/media/<content-context>/
├── <context>-light.jpg
├── <context>-light.meta.json
├── <context>-dark.jpg
└── <context>-dark.meta.json
```

## Sidecar Metadata

Every `.meta.json` file contains:
- **Provenance**: source platform, photographer, license, attribution
- **Media properties**: dimensions, average color, alt text, MIME type, checksum
- **Classification**: theme variant (light/dark/universal), content context, AI flags
- **Cultural sensitivity**: `hasFirstNationsPermission`, `culturalNotes`
- **Agent provenance**: sourcing agent, prompt, review status and notes

## Constraints

- Only raster formats: JPEG, PNG, WebP (no SVG — script injection risk)
- Maximum file size: 50 MB
- API key must never appear in sidecar files, logs, or committed code
- Rate limiting: respect Pexels API limits, warn when quota < 20%
- All filenames are generated server-side from slugs (no user input in filenames)
