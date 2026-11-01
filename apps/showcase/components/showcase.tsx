"use client";
import { Breadcrumbs } from "../../../packages/highway-react/src/components/ui/breadcrumbs";
import { PageActions } from "./page-actions";
import { useLayoutEffect } from "react";
import { scrollComponentPanelToTop } from "./component-navigation";
import { ComponentSidebar } from "./component-sidebar";
import { ComponentGrid } from "./component-grid";
import packageReference from "../../../catalog/component-reference.json";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "../../../packages/highway-react/src/components/ui/dropdown-menu";
import { useRouter, useSearchParams } from "next/navigation";
import { PreviewPlayground } from "./preview-playground";
import { allEntries, familyEntries, familyFor, pageFor } from "./component-directory-data";
import componentCatalog from "../../../catalog/components.json";
import { LibraryShell } from "./library-shell";
import { CodeExample } from "./code-example";
import { PropsTable } from "./props-table";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { entries } from "../previews/examples";
export function Showcase() {
  const params = useSearchParams();
  const router = useRouter();
  const componentId = params.get("component");
  useLayoutEffect(() => { scrollComponentPanelToTop(); }, [componentId]);
  const aliases: Record<string, string> = { "inv-button": "button", "inv-toggle": "switch", "inv-icon-button": "button" };
  const requested = params.get("component") || "button";
  const catalogue = allEntries;
  if (!params.get("component")) return <LibraryShell><div className="library-layout library-component-layout"><ComponentSidebar entries={familyEntries} selected=""/><ComponentGrid embedded/></div></LibraryShell>;
  const selected = catalogue.find(e => e.id === (aliases[requested] || requested)) || entries.find(entry => entry.id === "button")!;
  const family = familyFor(selected.id);
  const page = pageFor(selected.id);
  const pageExamples = family?.variants.filter(item => page?.examples.includes(item.id)) ?? [];
  const familyVariant = family?.variants.find(variant => variant.id === selected.id);
  const legacyUsage = (componentCatalog.showcase as Record<string, { availability: string; exports: string[]; note: string }>)[selected.id];
  const packageUsage = { ...legacyUsage, exports: familyVariant?.exports ?? legacyUsage.exports };
  const publicComponents = componentCatalog.components.filter(component => packageUsage.exports.includes(component.export));
  const notes = [...new Set(publicComponents.flatMap(component => component.constraints ?? []))].filter(note =>
    typeof note === "string" && !note.startsWith("Use the installed implementation") && !note.startsWith("Import the exact package implementation"));
  const usage = (familyVariant && "example" in familyVariant ? familyVariant.example ?? selected.code : selected.code).replace(/^import[^\n]*from\s+['"](?:@\/|\.\/|\.\.\/)[^\n]*\n?/gm, "").trim();
  const title = page?.title ?? selected.name.split(",")[0];
  const installCommand = packageUsage.availability === "demo-only" ? undefined : `npm install --ignore-scripts --save-exact https://github.com/eythandamico/highway/releases/download/highway-v${componentCatalog.packageVersion}/highway-styles-${componentCatalog.packageVersion}.tgz https://github.com/eythandamico/highway/releases/download/highway-v${componentCatalog.packageVersion}/highway-react-${componentCatalog.packageVersion}.tgz`;
  const markdown = [
    `# ${title}`, selected.description,
    installCommand && `## Install\n\n\`\`\`sh\n${installCommand}\n\`\`\``,
    packageUsage.exports.length > 0 && `## Import\n\n\`\`\`tsx\nimport { ${packageUsage.exports.join(", ")} } from "@highway/react";\nimport "@highway/styles/styles.css";\n\`\`\``,
    `## Usage\n\n\`\`\`tsx\n${usage}\n\`\`\``,
    ...packageUsage.exports.map(name => {
      const reference = packageReference.components[name as keyof typeof packageReference.components];
      return reference && `## ${name} API\n\n\`\`\`ts\n${reference.displayDeclaration}\n\`\`\``;
    }),
    notes.length > 0 && `## Notes\n\n${notes.join("\n\n")}`,
    "documentation" in selected && selected.documentation,
  ].filter(Boolean).join("\n\n");
  if (params.get("preview") === "1") return <div className="library-standalone-preview"><PreviewPlayground key={selected.id} entry={selected}/></div>;
  return <LibraryShell>
    <div className="library-layout library-component-layout"><ComponentSidebar entries={familyEntries} selected={page?.id ?? selected.id}/>
    <article className="library-content" key={`content-${selected.id}`}>
      <Breadcrumbs items={[{ label: "Components", href: "/showcase" }, { label: title }]} renderLink={item => <Link href={item.href!} scroll={false}>{item.label}</Link>}/>
      <div className="library-page-heading"><div><h1 id="component-top">{title}</h1><p className="library-intro">{selected.description}</p></div><PageActions markdown={markdown} installCommand={installCommand}/></div>

      <div id="component-preview" className="library-component-preview">
        {family && pageExamples.filter(item => allEntries.some(entry => entry.id === item.id)).length > 1 && <div className="library-preview-picker">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" aria-label={`Choose component: ${familyVariant?.label ?? selected.name}`}>
              {familyVariant?.label ?? selected.name}<ChevronDown aria-hidden="true" size={14}/>
            </Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={selected.id} onValueChange={id => router.push(`/showcase?component=${encodeURIComponent(id)}`, { scroll: false })}>
                {pageExamples.filter(item => allEntries.some(entry => entry.id === item.id)).map(item => <DropdownMenuRadioItem key={item.id} value={item.id}>{item.label}</DropdownMenuRadioItem>)}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>}
        <PreviewPlayground key={selected.id} entry={selected}/>
      </div>
      {family && family.variants.length > 1 && <section className="library-api"><h2>Related components</h2><div className="library-api-scroll"><table className="library-mapping"><thead><tr><th>Component</th><th>Use when</th><th>Export</th></tr></thead><tbody>{family.variants.map(variant => <tr key={variant.id}><td>{allEntries.some(entry => entry.id === variant.id) ? <Link href={`/showcase?component=${variant.id}`}>{pageFor(variant.id)?.id === variant.id ? pageFor(variant.id)?.title : variant.label}</Link> : variant.label}</td><td>{variant.when}</td><td><code>{variant.exports.join(", ")}</code></td></tr>)}</tbody></table></div></section>}
      <section id="component-install" className="library-api" aria-label="Package usage">
        <h2>{packageUsage.availability === "demo-only" ? "Demo pattern" : "Import"}</h2>
        {packageUsage.availability === "demo-only" ? <p>{packageUsage.note}</p> : <>
          {packageUsage.availability === "mixed" && <p>{packageUsage.note}</p>}
          <CodeExample label="Import" code={`import { ${packageUsage.exports.join(", ")} } from "@highway/react";\nimport "@highway/styles/styles.css";`}/>
          <p className="library-install-note">New to Highway? <Link href="/guide#packages">Set up the packages and theme.</Link></p>
        </>}
      </section>
      <section id="component-source" className="library-reference"><h2>Usage</h2><CodeExample code={usage}/>{"styles" in selected && selected.styles && <CodeExample label="Styles" language="css" code={selected.styles}/>}</section>
      {"props" in selected && selected.props.length > 0 && <section id="component-props" className="library-api" aria-label="Component API"><h2>Props</h2><PropsTable rows={selected.props}/></section>}
      {packageUsage.exports.length > 0 && <section id="component-api" className="library-reference"><h2>API reference</h2>
        {packageUsage.exports.map(name => {
          const reference = packageReference.components[name as keyof typeof packageReference.components];
          return reference ? <section key={name}><h3>{name}</h3><CodeExample label="TypeScript" code={reference.displayDeclaration}/></section> : null;
        })}
      </section>}
      {notes.length > 0 && <section id="component-behavior" className="library-reference"><h2>Notes</h2>{notes.map(note=><p key={note}>{note}</p>)}</section>}
      <div id="component-related" className="library-links"><Button variant="ghost" asChild><Link href="/components/surfaces">Explore the surface family →</Link></Button><Button variant="ghost" asChild><Link href="/components/family">Explore the control family →</Link></Button><Button variant="ghost" asChild><Link href="/guide#build">How to use these components →</Link></Button><Button variant="ghost" asChild><Link href="/components/foundation">Full quality lab →</Link></Button></div>
    </article></div></LibraryShell>;
}
