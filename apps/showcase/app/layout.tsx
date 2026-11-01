import { PreviewProviders } from "../components/preview-providers";
import "./styles.css";
export const metadata = { title: { default: "Highway", template: "%s · Highway" }, description: "Highway component library and guide" };
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><PreviewProviders><a className="skip-link" href="#main">Skip to content</a><main id="main" tabIndex={-1}>{children}</main></PreviewProviders></body></html>;
}
