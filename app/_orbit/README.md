# Orbit (switched off)

Orbit is kept here, complete, but switched off. Next.js ignores any folder
inside `app` whose name starts with an underscore, so nothing in here is
built, served or pre-loaded, and nothing on the site links to it.

What's in here:

- `page.tsx`: the Orbit hub (was /orbit)
- `catch/`: Catch Yourself (was /orbit/catch)
- `food-lab/`: The Food Lab, the biryani game (was /orbit/food-lab)
- `whisper-wall.html`: the Whisper Wall page (was /whisper-wall.html)
- `whispers-api/route.ts`: the Whisper Wall's data (was /api/whispers)

## To bring Orbit back

Run these from the repo folder, one at a time:

    git mv app/_orbit/whispers-api app/api/whispers
    git mv app/_orbit/whisper-wall.html public/whisper-wall.html
    git mv app/_orbit app/orbit

Then:

1. In `components/Header.tsx`, add the menu link back:
   `{ label: "Orbit", href: "/orbit" },`
2. In `next.config.ts`, delete the three Orbit redirects.

Commit, push, and Orbit is live again exactly as it was.
