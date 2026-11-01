---
name: highway
description: Build, adopt, audit, or refine React interfaces with Highway. Applies product-specific direction, concrete visual audit, nine ordered design passes, and rendered critique using real Highway components and tokens. Use when Highway is requested or the project uses @highway/react or @highway/styles.
metadata:
  author: Highway
  homepage: https://github.com/eythandamico/highway
---

# Design and build with Highway

Maintained by [Highway](https://github.com/eythandamico/highway). See [UPSTREAM.md](UPSTREAM.md) for project provenance and maintenance.

This skill combines a detailed design-review workflow with Highway's component and implementation contracts.

## Highway contract — read before the passes

User intent and the existing brand come first. Highway's installed API, tokens, accessibility, and component-specific craft govern implementation. The passes below govern composition and critique. A diagnostic is not a ban on a material: preserve intentionally selected glass, gradients, filled status icons, avatars, and springs. Do not flatten them to imitate another library.

- **Build:** establish audience, primary job, content and brand from the request. Draft a content inventory before JSX. For a fresh screen, perform the visual audit on the first render rather than pretending a before screen exists.
- **Adopt:** map existing controls and handlers; preserve routes, data, validation and business behavior. Do not redesign the app merely to install Highway.
- **Refine:** inspect the screen and fix the diagnosed scope. **Review only:** report without editing.
- Read [integration.md](references/integration.md) before installation or API decisions. Discover connected Highway MCP, call `get_installation`, inspect exact `get_component` declarations and supporting types. State unavailable connections honestly; do not claim an SDK harness is a connected agent tool.
- Use public `@highway/react` exports and `@highway/styles/styles.css`; use `HighwayTheme` for the intended scope. Install the exact version-matched public URLs returned by MCP. Do not import checkout internals, copy showcase markup, install Tailwind merely to render Highway, or invent familiar props.
- Record each selected export's value shape, callback and state ownership. Native `Input` and composed `TextInput` are not interchangeable. A family is discovery metadata, not a shared API.
- Compose shared controls before writing app CSS. App CSS owns layout and external spacing; tokens and component props own control geometry, focus, elevation, typography and motion. Do not patch `.ui-*`/`.hw-*` internals or replace shared behavior with lookalikes.
- Read [Highway tokens](references/tokens.md) and [component craft](references/design-decisions.md) for implementation. They replace upstream numeric sizes, font suggestions, icon stroke prescriptions and blanket motion bans.
- Every substantial build/refinement must read [signs.md](references/signs.md) and [content-review.md](references/content-review.md). Keep a short audit ledger: **location → observed problem → user impact → change → rendered evidence**. A completed build is not evidence of design quality.

Vibecoded UI fails in the same predictable ways. Every surface glows, every label has an emoji, spacing is whatever the model typed that day, and the copy shouts. Unslopping fixes the craft and keeps the product. The features, content and order of sections stay. What changes is that every size, color, word and image becomes deliberate.

Removing slop is only half the job. A screen that is clean but could belong to any product is the next template. Every run ends with a screen that only this product could have.

The difference between slop and craft is where the richness goes. Slop spreads color and effects over the chrome, the backgrounds, buttons, borders and labels. Craft keeps the chrome quiet and puts the richness into one or two moments of content that people remember, like a rendered object, a beautiful chart or an image from the product's world.

Work like a designer doing a redline pass, one layer at a time, across the whole screen.

## What good looks like

- **A deliberate focal point.** Each screen has a clear emphasis earned by its task: a decision, a primary action, a chart, or a product visual. A dense tool need not add a bright illustration. Everything around it is quiet, so it reads instantly.
- **Quiet chrome.** Navigation, buttons and text use the tinted neutrals and one accent. Nothing glows, nothing competes with the bright element.
- **A clear idea.** You can say in one sentence what the visual shows and why it belongs to this product.
- **Text on calm space.** The headline sits on a part of the image or layout that was left empty for it, short and specific, with one primary and one secondary action and nothing stacked under them.
- **Real product, real material.** Previews look like the real app with plausible data, and objects look like real things with weight, light and shadow.

Which visual styles tend to work, and which fail, is in [references/visuals.md](references/visuals.md). Finished examples to learn from are in [references/refs.md](references/refs.md), and code treatments like drawing an image in glyphs are in [references/effects.md](references/effects.md).

## Run it

1. **Look at the screen.** Find the files that render it. If you can run the app or open the file in a browser and take a screenshot, do it, so you judge what people see and not only the code.
   - Only a link to a live site, no code? Save the page with `node <skill folder>/scripts/snapshot.mjs <url> unslop/original.html` and work on a copy of that file. Add `--dark` or `--light` to match the theme the user sees. It also saves `original.live.png`, a screenshot of the live page, so render the saved copy and compare the two before you start. Animated backgrounds drawn by scripts do not survive, so describe them in the audit from the live page.
   - Only a screenshot? Rebuild the screen as one static HTML file first, matching it closely, and treat that as the original.
   - In both cases the result is a redesigned page in code that the user can hand to whoever owns the real site, so say that in the report.
2. **Audit.** Go through [references/signs.md](references/signs.md) and list every sign you find, one line each with where it lives.
3. **Decide how much to change.** Read the audit honestly before planning anything.
   - **Heavy slop**, many signs across color, type, icons and copy. Run the full process below.
   - **Light slop**, a screen that is mostly designed with a few signs left. Polish mode. Fix only what the audit found, take the direction from the existing brand instead of inventing a new one, and keep the palette, type, layout and visual. Bigger ideas, like a moment that is missing or a scene for the hero, go into the report as suggestions, not changes.
   - **No slop.** Say so plainly and suggest two or three small refinements at most, with exact values. Apply them only if the user agrees, and stop there. Never change a good screen just to make it different.
4. **Set the direction.** Write the five lines described below. State the audit and direction briefly before implementation. When the user already authorized the work, continue without another approval checkpoint. Ask only for missing product intent that would materially change the result; a review-only request remains review-only.
5. **Fix in nine passes, in order.** Finish a pass across the whole screen before starting the next. When nearly every line changes, plan the passes in order and then write the new screen in one go, as long as every pass is applied. Spacing comes first because everything else reads differently once the rhythm is right. Copy comes before type and layout because the length of the headline decides its size and where it sits. Visuals and motion come last because they should fit a screen that already works without them.
6. **Check.** Run the checklist at the end of this file, render again and compare with the audit list. Anything still on the list gets fixed.
7. **Report** the direction, a few lines per pass about what changed, and any image prompt you wrote.
8. **Record, when asked or when the user wants something to share.** Build the story file and render the video described in [Story video](#story-video). If the user asks for it at the start, write each pass into the story file as you go.

Keep a run quick. Aim for an initial render, a refinement render, and a final check; do not leave a known defect merely to meet a render count. When you generate an image, start it right after the direction is confirmed and keep doing the first passes while it runs, instead of waiting for it.

Exact values for every pass live in [references/tokens.md](references/tokens.md).

## Direction

Before touching anything, write five short lines. Derive them from what the page says the product does and who it is for. Never from what is trending.

- **Product.** What it does and for whom, in one plain sentence.
- **Character.** Two or three concrete words, like `calm, exact, a little warm` or `fast, technical, playful`. Words like clean, modern, sleek, minimal and premium are not allowed, because they describe every template.
- **World.** The place or material the product naturally belongs to. A note app lives near paper and ink, a monitoring tool near instruments and night shifts, a travel app near maps and window light. This world sets the tint of the neutrals, the accent and the visual.
- **Moments.** One or two places where the screen gets rich color, material and detail, chosen from what the product shows. A rendered card or device inside the preview, a chart whose colors each mean a series, an object from the world placed next to the content. Write what they are.
- **Signature.** One small detail only this product would have, used consistently. A live status dot for a monitoring tool, keycaps for a developer tool, hand drawn underlines for a teaching app, a route line for a delivery app. One detail, not five.

The examples here only show the shape of an answer. Derive yours from the product in front of you, even when an example happens to fit.

If the product already has a real brand, like a logo file, a color or a typeface that is not slop, keep it and build the direction around it. Do not declare an existing logo or approved material invalid because it resembles a generic trend. Diagnose its actual effect on this screen.

## 1. Spacing

- Everything sits on a 4px grid. Margins, paddings, gaps and fixed heights are multiples of 4, so 28 or 104 are fine even though they are not in the token list. A 2px step is fine for nudges inside small controls, and an odd value that exactly centers something stays.
- Same thing, same size. All rows in a list share one height and one gap, all cards in a row share one padding.
- Space shows grouping. Space inside a group is smaller than space between groups, so a list reads as one block and sections read as separate ones.
- Things line up. Icons sit in one column, labels start on one line, numbers align right in one column. Nothing is nudged off the line with a stray translate or odd margin.
- Padding follows density. Compact panels and sidebars around 16, cards 20 to 24, page edges 24 to 32.
- Navigation is compact relative to the content, but shared target sizes and text wrapping remain intact. Use supported component sizes, icons in one column, and aligned labels. A section label sits closer to its own items than to the section above it, like 24 above and 8 below. Measure the sidebar after the pass, it is where spacing breaks most often.
- Remove one-off values that break the rhythm, like `mt-[13px]` or `py-[11px]`, and replace them with steps from the scale.

## 2. Color

- Build from one neutral ramp, tinted toward the world from the direction. Pick graphite, warm or ink from the tokens, or tint your own the same way. Background, raised surfaces, borders and text all come from that ramp.
- In apps and dashboards the backgrounds, surfaces, borders and text stay neutral, the graphite ramp or something just as grey. People look at them for hours and the content has to carry the color. A screen whose background reads as orange, brown, blue or green has gone too far. The world shows in the accent, the charts and the moments, not in the surfaces. Landing pages can tint their surfaces further toward the world.
- Three text roles, primary, secondary and muted. Not ten slightly different lavenders.
- In the chrome, one accent, used rarely. It marks the primary action, the selection or the one number that matters.
- The moments from the direction are the exception. Inside them color can be rich, several hues in a chart, a rendered object with real materials, an image with its own light, as long as it stays inside the world and each color means something.
- If the brand has a real color, it becomes the accent and leaves the surfaces. If there is no real brand color, take the accent from the world.
- Accent with text on it reaches 4.5 to 1 contrast. If it does not, darken it or put dark text on it. Accent used as text or ink on a light surface needs the same contrast, so use a darker shade of it there.
- On dark themes the primary button can be an off white from the ramp with dark text, and the accent can live in a smaller place like the selection or a key figure. This often looks more deliberate than a colored button.
- Semantic colors only carry meaning, like green for a good change and red for an error, and they are toned down to sit inside the palette.
- Remove unmotivated gradients, glows, washes and borders that compete with content. Preserve brand-approved artwork and Highway materials where they serve hierarchy or product identity.
- Borders are quiet hairlines, the text color of the ramp at 6 to 10% opacity.
- On dark themes depth comes from surface steps and hairlines, not from shadows. A window or object floating over an image may keep a soft neutral shadow. On light themes shadows are neutral, soft and small.
- A neutral surface step is the usual app default. Richer gradients belong to intentional product content or approved materials, not an automatic decoration on every control.

## 3. Icons

- Use Highway’s documented icon options and the project’s established icon set. Remove gratuitous emoji; preserve meaningful user content, actual logos, filled status icons and brand artwork.
- Consistent optical size and stroke within a role; let shared controls own their icon geometry. Do not globally override every SVG.
- Action icons generally inherit their text role. Status icons retain semantic color; actual brand and token artwork retain their colors. Color must communicate meaning rather than decorate every category.
- The icon box has the same width in every row and the gap to the label is fixed, 8 or 10, so labels align.
- Drop icons that add nothing, like an emoji in every card title or before every section label. Categories that need color get a small status dot.

## 4. Copy

- Headlines say what the product does for whom, in plain words, so they could not fit another product. Use the facts already on the page and do not invent new ones.
- No exclamation marks in interface text, and never `!!`.
- No greeting headlines like `Welcome back, Alex! 👋`. The title names the context, like the page name or the period, for example `October 2026`.
- Short labels. `Search`, not `Search anything...`.
- A change says what it compares to, like `+12% vs last month` or `3 fewer vs last month`.
- Headlines, subheads, labels, buttons and captions end without a period. Only paragraphs of several sentences keep their periods.
- No hype words like supercharge, seamless, unlock, magic, revolutionize or game-changing, and no `AI-powered` on everything.
- Claims that cannot be checked, like `Loved by 10,000+ teams` or `10x faster`, become quiet and specific if the user confirms they are real, and are removed otherwise. Ask, and list them in the report.
- Mock data looks real, with plausible numbers and names, never `[X]` or `123,456`.
- Badges like `PRO`, `New ✨` or `Beta 🚀` go away unless the product really needs them, and then they are quiet text.

## 5. Type

- Use the installed Highway type roles and existing brand font. Do not introduce an unrelated font or scale merely to signal design effort. See [tokens.md](references/tokens.md).
- Weights 400/500/600 as supported by the role; hierarchy uses size, spacing, and contrast together. No automatic heavy headings.
- Prefer sentence case and normal tracking for app labels. Wide uppercase eyebrow labels must earn their place; do not add them to every section.
- Keep small text readable; do not shrink the root font size or use negative tracking to force it to fit.
- Numbers use `tabular-nums` and one format across the screen. If one figure is `$48,210`, the next is not `$124,860.40`.
- Avoid arbitrary italic emphasis; preserve intentional brand typography.

## 6. Layout

- Keep the sections and their order. Inside a section, alignment and proportions may change when that makes the screen clearer.
- Apps and dashboards keep real app proportions. The shell fills the viewport, a sidebar of 240 to 280 and fluid content, usually capped around 1440 to 1600 wide, and the page is as long as its content, with more sections below the first screen. Never shrink an app into a narrow centered column. If the original was drawn as a small window on a backdrop, keep it visibly a window, with its frame and backdrop, and still give it desktop proportions inside.
- For a landing page that needs a scene, one coherent image can carry the hero, leaving calm space for the headline and a real product view. Read the visual references for composition. A scene is an option, not a default for every product or an excuse to add a hero to an app.
- Without a scene, use an asymmetric split, text on one side and the visual given at least half the width, or text over a large product view below it. Everything stacked and centered is the template default, keep it only for a short hero with no visual.
- In a scene hero, the text block sits in the upper part, in the space between the navigation and the top of the product view, at its optical center, a little above the true middle.
- In a split, center the text block vertically against the visual, so neither side leaves a big empty corner. If the visual is much taller, shorten it instead of pushing the text down. Floating cards and devices next to the text are hard to balance, prefer one solid visual. The spacing token from the navigation to the headline applies to stacked heroes, a split hero is centered instead.
- Long headlines align left. Centered text works for one or two short lines.
- One primary action and at most one secondary action next to it. Anything else moves out of the hero.
- Navigation stays quiet. Logo, the existing links, one button. Log in is a quiet text link next to it, not a second button. A floating pill header is not required. On small screens the links collapse into one menu button.
- Compose the first screen as a whole. The hero fills the viewport height without a dead empty band. If the content is shorter, center it or let the product view start low and run past the bottom edge, so the page invites a scroll.
- On small screens everything stacks in reading order, the headline drops to the mobile size from the tokens and the visual comes after the actions. A dense preview gets simpler on mobile, with fewer rows and columns, instead of being zoomed down. No text in it goes below 11px.

## 7. Details

- Nested radius. An inner radius equals the outer radius minus the padding between them, never less than 4. Use Highway radius tokens and supported component sizes. Shared components already own nested geometry; do not override their radii globally.
- Counts and meta become quiet text, often mono and muted, instead of glowing pills.
- Keyboard shortcuts become small keycaps.
- Charts sit on a muted grid with muted mono labels. No rainbow bars inside one series, no glowing bars, no uppercase day labels. If the chart is placeholder noise, replace it with data that tells something real.
- Charts have a hierarchy, like text. One main chart is clearly the biggest thing on the screen, drawn with care, like smooth lines or a mirrored comparison. Anything else that shows data is smaller and different in kind, like a ranked list with thin bars or a short table, never a second chart of the same size.
- One accent per chart. The thing that matters, like the current month, the line you are tracking or the plan that grew, gets the accent, and everything else sits in neutral steps of the ramp. Several hues only when the chart really has to tell series apart, and even then one leads and the rest are quiet.
- Stat cards are numbers. A label, a big figure and a change with what it compares to. No sparklines, tallies, mini bars or icons added to fill them, they read as decoration. A card can hold a real looking object when it is the very thing its number counts, like a paid receipt next to paid revenue or bank cards next to spend. Use as many as make sense for that dashboard, as long as each one reads on its own and none of them is a mini chart.
- Vary the sizes. Cards of equal width side by side, each with the same kind of content, read as a template. Give the grid a rhythm, like three or four compact stats in a row above one wide chart, or a wide chart next to a narrow list.
- Pick the chart type for the data. A trend is a line, a comparison is bars, a share is one stacked bar or a list with bars, a single goal is a progress bar.
- The active state is a small surface step with a hairline highlight, not a gradient with a glow.
- Hover and focus states exist and stay inside the palette. A visible focus ring for keyboard users.
- Preserve an existing approved logo. If creating a new identity within scope, start with the product name and a meaningful mark; avoid an automatic sparkle tile or gradient wordmark.
- The signature detail from the direction appears where it belongs and nowhere else.

## 8. Visuals

- Decorative filler goes. Glossy blobs, orbs, nebulas, floating cubes, glowing grids, holographic brains and robots say nothing about the product.
- A landing hero gets a visual that shows something true.
- Dashboards and app screens almost never need generated images. Their moments come from the product itself: a chart drawn with care, figures set beautifully, real content like product photos or avatars, a status that feels alive. A physical thing the product deals with, like a payment card in a finance app, is usually better built in code with real materials, a soft gradient, a chip, a number.
- Generate images for an app only for empty states, onboarding and marketing moments, or when the user asks for it.
- With an image generation tool, the first choice for a landing hero is a scene from the world in the direction, generated wide enough to sit behind the whole hero, with calm empty space where the text goes. It carries the color and the mood, and the chrome stays quiet over it.
- Under the scene, or as the visual when there is no tool, show the product. Build a preview in code of what the page already promises, with the project's components or careful HTML and plausible data, like the main screen, one key card or the result the product produces. Showing what the copy already claims is not inventing a feature. In a scene hero it rises from the bottom edge and runs past it.
- The product view carries a moment, not just a plain card. A rendered object inside it, like a payment card on a figure, a rich chart or a small object from the world. These are kinds of objects, so using one that fits is fine.
- Before this pass, look at the references in [references/refs.md](references/refs.md). Take qualities from them, like composition, light, restraint and how the moment is placed, never their subject or layout.
- Rendered objects and scenes come from an image generation tool when you have one. If you do not, build what you can in code, write the prompts for the rest and leave empty slots of the right size.
- How to pick the subject, the prompt recipe and how to place the image are in [references/visuals.md](references/visuals.md). Read it before this pass.

## 9. Motion

- Remove motion that loops for no reason, like `animate-pulse` or `animate-ping` on things that are not live, shimmer on headings, breathing glows, floating elements and parallax.
- Remove indiscriminate `transition-all`, purposeless movement and decorative bouncing. Preserve Highway’s purpose-built springs and press behavior; do not add a second animation to shared controls.
- Keep motion that explains something. A hover is a quick color or surface change, a press is a tiny scale down, a menu fades and rises a few pixels from where it opens, a changed number tweens.
- Transition color, background, border, opacity and transform, and name them, like `transition-colors` or `transition-[transform,opacity]` in Tailwind, instead of a catch all. Prefer transform/opacity for custom motion. Keep proven shared resize, morph and layout transitions; inspect their actual performance before changing them.
- Use Highway motion tokens; preserve component-specific easing or physics rather than forcing one curve onto every interaction. Short for feedback, a little longer for things that enter.
- At most one entrance on load, a short fade and rise for the main content with a small stagger. Not every card flying in from a different side.

## Story video

A short video where the screen unslops itself step by step, with red redlines on the slop. Look at [refs/story-dashboard-frames.webp](references/refs/story-dashboard-frames.webp) before you build it, eight frames from it in order. That video went viral, and this is how it works:

- **Nothing is swapped, everything morphs.** One page, and each step only changes CSS, so padding, gaps, sizes, colors, radii and shadows tween from the old value to the new one in place. You see the spacing open up, the purple drain out, the corners soften.
- **A wave.** Elements start a few dozen milliseconds apart from the top left down, so a change runs across the screen instead of everything flipping at once.
- **Text rolls.** Copy that changes blurs out, and the new words rise in letter by letter.
- **Redlines first.** The slop gets red selection boxes with tags, a spacing step shows red measurements that turn white once fixed, a details step outlines corners with their radius.
- **Close and short.** Square, cropped close on the part that changes most, so it reads on a phone, and about 10 seconds.

It adds a few minutes, so make it only when the user wants it.

1. **One story file.** Build `unslop-story/story.html`, a standalone copy of the original screen with its styles in the file. Keep the original rules as they are, they are step 0.
2. **Steps.** Three to five, merging passes so each one changes something you can see, like `Spacing`, `Color and icons`, `Type and copy`, `Details`. A new chart or visual goes into the last step. List them in the head as `<meta name="unslop-steps" content="Spacing, Color and icons, Type and copy, Details">`. A name containing Spacing shows spacing measurements, one containing Details shows corner outlines.
3. **Each step is CSS on top.** Write the changes of step 1 under `.s1`, step 2 under `.s2` and so on, like `.s1 .card { padding: 24px }` or `.s2 body { background-color: #141415 }`. The classes add up, so step 3 still has the rules of steps 1 and 2. Change values, never structure, so the browser can tween them.
4. **What cannot tween, and how to handle it.**
   - Gradients, glows and washes: put them on their own layer and fade its `opacity` to 0, with the solid color underneath changing. Gradient text goes on the `.from` span only, never on the swap or its parent, because a text clip also catches the hidden new text.
   - Pills: write their radius as half the height, like `23px`, not `9999px`, or the corner only changes in the last frame.
   - Use swaps sparingly, only where the words change, at most eight in a story. Twenty swaps blurring at once read as a cut between two pictures, which is exactly what the video must not look like. Weight, size, tracking and color changes tween on their own, so they never need a swap. A new font family switches directly in its step, without swaps.
   - Text that changes, a new font family, an emoji that becomes an icon: `<span class="swap" data-at="3"><span class="from">Welcome back, Alex! 👋</span><span class="to">October 2026</span></span>`. At step 3 the old part blurs out and the new one rolls in.
   - Emoji that become icons: put the new icon next to the emoji inside the same box, both absolutely stacked, and crossfade their `opacity` in the step. That is not a swap and does not count toward the limit.
   - Things that disappear, like a `New ✨` badge: `data-out="2"` collapses them at step 2.
   - Things that appear, like a legend: `data-in="4"` fades them in at step 4. Reserve their space so nothing jumps.
5. **Redlines.** The measurements follow the elements live, so their numbers count from the old value to the new one while things move. That is the moment people watch, so choose them well.
   - `data-gap` goes on the blocks of a vertical stack, like the brand row, the search, the navigation group and the plans group in a sidebar, or the headline, the stat row and the chart in the main column. Not on every row, or the screen fills with tiny 2px tags. Aim for four to six measured gaps per stack, and give each stack its own name if there is more than one, like `data-gap="sidebar"` and `data-gap="main"`.
   - `data-radius` goes on two to four buttons and cards whose corners change.
   - `data-slop="Gradient text"` and so on marks the slop for a short first beat, at most five, on the clearest examples that sit apart from each other, with short tags. It is optional, the reference video has none.
6. **Only the screen and its background.** The video shows the story page as it is, with no extra window, border or shadow around it, so the page's own background fills the frame and the screen is the only box. If the screen sits in a window that grows to desktop proportions, anchor it to the left in the story so it widens to the right instead of gliding sideways. The story page renders 1440 wide and at least 900 tall, so do not size things from `100vh`, and keep `position: fixed` for background layers only.
7. **Camera.** `<meta name="unslop-frame" content="0 0 960">` sets which part of the page fills the frame, as x, y and width in page pixels. Point x and y at the screen's own top left corner, so the frame starts with the page background around it, and crop close on where the most visible change happens, usually the sidebar or headline and the first cards.
8. **Render.** `node <skill folder>/scripts/story.mjs unslop-story/story.html unslop-story.mp4`, square by default, `--wide` for 16:9. It needs Playwright and ffmpeg, so if either is missing, tell the user the one command that installs it. To watch it live first, run it with `--play` instead of the output path, and it loops in a browser window until closed. Pull a few frames with ffmpeg and look at them before you hand it over. Checking the story file and the video does not count toward the render limit of a run.
9. **The story file is a presentation piece.** The clean result still ships as normal code in the project's own stack, without `.s` classes or story attributes.

## Do not

- Do not rename the product or redraw an approved logo. If identity refinement is explicitly in scope, diagnose the mark’s legibility and relevance before changing it. Do not automatically introduce a generic glossy orb, sparkle tile or gradient wordmark.
- Do not change what the product is. Keep its features, content and the order of sections unless the user asks for more. Placeholder content that means nothing may be replaced with content that does.
- Do not replace removed decoration with new decoration, and do not swap one trend for another like glass, grain, noise, neon or bento grids.
- Do not invent product features or factual claims. New demo fixtures may use clearly illustrative, coherent data; do not present it as verified customer or performance evidence.
- Do not fall back to the same look for every product. The direction decides the palette tint, type and visual, not habit.

## Checklist

- [ ] The direction is written and every pass follows it
- [ ] Every spacing value is on the 4px scale and equal things have equal sizes
- [ ] Icons, labels and numbers each sit in one aligned column
- [ ] One tinted neutral ramp, three text roles, one accent with enough contrast
- [ ] No unmotivated surface effects; approved Highway materials and brand artwork remain intact
- [ ] No gratuitous emoji decoration; meaningful user content is preserved
- [ ] Icons align within their roles; real logos and filled status marks retain their intended geometry
- [ ] Highway type roles and brand font preserved; readable small text; any uppercase/italic treatment serves an explicit purpose
- [ ] No exclamation marks, no trailing periods on short strings, no greeting headline, no unverified claims
- [ ] Numbers in one format with tabular figures
- [ ] Nested radii add up
- [ ] Any hero visual proves something about the product; app screens do not gain decorative heroes just to satisfy a checklist
- [ ] The first screen is composed as a whole with no dead empty band
- [ ] Motion explains state, respects reduced motion, and preserves shared component behavior
- [ ] Template check. If you swapped the product name for another product's, would the screen still fit? If yes, push the direction harder in the copy, the visual and the signature detail

## Highway completion gate

Before calling a substantial design complete, render at desktop and narrow widths. Compare the screen with the audit ledger and the five-line direction. Run the content review, then make at least one evidence-based refinement pass if defects remain. Do not invent a change when the first result already satisfies the checks.

Report specific decisions and fixes, not “polished” or “premium.” Include whether the skill and connected MCP were actually used, build/interaction checks, screenshot evidence, unresolved issues, and any external review that was necessary. If rendering is unavailable, say visual quality is unverified. Exercise the main flow, its meaningful failure state, keyboard focus and reduced motion proportionally. Preserve drafts, selection and scroll across updates. No screen gets a design-quality pass solely because tests pass.
