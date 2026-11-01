# Content review: every element needs a job

Run before layout on a new build, and again against the rendered screen. This is a decision check, not a word blacklist. Preserve intentional brand voice and user-supplied facts.

## Inventory before JSX

For each section, write: user question → information needed → action enabled → source/state. If it has no answer, remove it or explain why it belongs. Use the real product's nouns and objects; don't add generic widgets to fill a column.

For a new demo, label the dataset as illustrative in the implementation/report and make it internally coherent. A fictional project may have a review date and a responsible person. Do not present invented testimonials, customer counts or performance claims as real. For existing products, don't replace unknown facts with fiction.

## Concrete diagnoses

| Observed pattern | Why it fails | Correction criterion |
| --- | --- | --- |
| “A little clarity,” “find your rhythm,” “work smarter” above a task list | Describes a mood instead of the work | Replace with useful context such as “4 tasks due today,” derived from the actual list, or remove |
| A “note for the week” with motivational prose | Occupies a useful information region without enabling a decision | Use a real dependency, deadline or instruction if supplied; otherwise leave the space unfilled |
| Project 65% complete with no definition | Implies precision without a denominator | Derive completed/total items and label the measure, or show concrete status; do not substitute a different invented figure |
| Equal KPI tiles on a screen whose job is reviewing tasks | Lets a template choose the content | Put the next actionable item first; metrics belong only if they inform this job |
| Priority badge on every item | Removes meaningful prioritization | Identify the actual priority rule or omit the badge |
| Eyebrow, title and subtitle repeat the same idea | Adds vertical bulk and weakens hierarchy | Keep the page name and only context that changes interpretation |
| Decorative lines, dots, mini charts or icons fill a blank area | Calls attention to something with no meaning | Explain what it encodes; remove it if it encodes nothing |
| “View,” “Manage,” or “Explore” on every action | Conceals the consequence | Name the object/action: “Review proposal,” “Resolve comment,” or a concise established product label |
| Fictional completion animation with no saved change | Confuses feedback with behavior | Connect the actual operation and show failure; state local-only persistence honestly |

These examples are diagnostic, not a new template. A useful note, genuine percentage or meaningful illustration can stay.

## Final rendered review

1. Cover the logo. Do the content and workflow still identify the kind of product and user? If not, replace generic copy with the actual objects and decisions—not merely a new name or decorative motif.
2. Read only headings and buttons. Can the user find the next action? Remove competing emphasis before adding color.
3. Inspect every statistic, status, deadline and badge. What produced it? Can the UI explain it? Check demo numbers against the underlying fixture.
4. Inspect each card, sidebar block and decorative mark. Does it group related content, support interaction, or communicate product meaning? Spacing is an acceptable boundary. Empty space does not require filler.
5. Check content after filtering, completion and empty states. Counts, copy and actions must remain true. Avoid hardcoded summaries that become false after one click.
6. Record remaining defects by location and fix them. If external review caught something missed, name that distinction in the report. Do not claim the skill independently caught it.
