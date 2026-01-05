# Releases

## Branch structure and intent

- `main` always mirrors the latest code that has actually shipped. Every public release commit lives on `main` and is tagged there.
- For each major series we keep a long-lived `N.x` branch (for example `0.x`, `1.x`, `2.x`, …). That branch collects **all** work that will eventually be released as `N.y.z`.
- A series branch covers the entirety of that major train: `0.x` carries everything from `0.1` through `0.1.0`, `0.2.3`, etc.; when we move on to `1.0` we repeat the pattern with `1.x`, and so on.
- There is no separate release branch. The matching `N.x` branch is the staging ground; once it is ready we merge it to `main` and cut the tag.

## Day-to-day development workflow

1. Identify the active series branch (e.g., `0.x`). That branch always tracks the next unreleased work.
2. Create short-lived feature branches from that series branch: `git switch -c feature/xyz 0.x`.
3. Land pull requests back into the same series branch (`0.x`). Keep it green: rebase frequently, run the full test suite, and update documentation there.
4. `main` stays untouched during the iteration and continues to point at the previously shipped tag.

## Cutting a release from a series branch

1. Pick the exact semantic version you plan to ship (e.g., `0.3.0`).
2. Ensure the matching series branch (e.g., `0.x`) already contains every change you want plus any release-specific metadata (CHANGELOG entries, config tweaks, etc.).
3. Merge the series branch into `main` (fast-forward if possible): `git switch main && git merge --ff-only 0.x`.
4. Tag the resulting commit on `main` using the `v<major>.<minor>.<patch>` format: `git tag v0.3.0 && git push origin main v0.3.0`.
5. Deploy from `main` so production always matches the latest tag.

## Moving to the next train

- After tagging (say `v0.3.0`), decide whether you need to keep the old series alive for hotfixes. If so, leave the `0.x` branch in place for those fixes; otherwise it can be closed.
- Start the next cycle by creating the new series branch from `main`: `git switch -c 1.x main`. From that point onward, all feature work for `1.0` through `1.0.0` lands on `1.x` until it is merged back into `main` and tagged.
- At any given time `main` must track whichever series branch represents the most recent release so that the code on `main` and the highest tag are always in sync.

## Quick reference

- Feature work → `feature/*` branches cut from the active `N.x` series branch.
- Integration/testing → happens directly on the series branch (`N.x`).
- Release → merge `N.x` to `main`, then tag `vN.y.z` on `main`.
- Latest code in production → always the HEAD of `main` and the highest `vN.y.z` tag.
