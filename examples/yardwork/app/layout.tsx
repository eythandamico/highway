import { PreviewProviders } from "../src/demo-providers";
import "./styles.css";
export const metadata = { title: "Highway · Yardwork demo", robots: { index: false, follow: false } };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><PreviewProviders><a className="skip-link" href="#main">Skip to content</a><main id="main" tabIndex={-1}>{children}</main></PreviewProviders></body></html>;
}
