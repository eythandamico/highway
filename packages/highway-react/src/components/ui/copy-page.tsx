"use client";
import { useState, useEffect, useRef } from "react";
import { Copy, Check, ChevronDown, FileText, Link as LinkIcon, Terminal, ArrowUpRight } from "lucide-react";
import { Button } from "./button";
import { ButtonGroup } from "./action-patterns";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from "./dropdown-menu";

// Keep provider artwork with the component so global CSS consumers do not download it.
function ProviderMark({ provider }: { provider: "openai" | "claude" }) {
  return <svg className={`hw-copy-provider-logo hw-copy-provider-${provider}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {provider === "openai" ? <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/> : <path d="M5.62025 15.461L9.75114 13.1448L9.82025 12.943L9.75114 12.8314H9.54911L8.85798 12.7889L6.49747 12.7251L4.45063 12.6401L2.4676 12.5339L1.96785 12.4277L1.5 11.8114L1.54785 11.5033L1.96785 11.2217L2.56861 11.2749L3.89772 11.3652L5.89139 11.5033L7.33747 11.5883L9.48 11.8114H9.82025L9.8681 11.6733L9.75114 11.5883L9.66076 11.5033L7.59798 10.1061L5.36506 8.62927L4.19544 7.77928L3.56278 7.34898L3.2438 6.94523L3.10557 6.06337L3.67975 5.43119L4.45063 5.48432L4.64734 5.53744L5.42886 6.13774L7.09823 7.42866L9.27798 9.03301L9.59696 9.29863L9.72456 9.20832L9.74051 9.14457L9.59696 8.90552L8.41139 6.76461L7.14608 4.58652L6.58253 3.68341L6.43367 3.14154C6.38051 2.91842 6.34329 2.73248 6.34329 2.50405L6.99722 1.61687L7.35873 1.5L8.23063 1.61687L8.59747 1.93562L9.13975 3.17341L10.017 5.12307L11.378 7.77397L11.7767 8.56021L11.9894 9.28801L12.0691 9.51113H12.2073V9.38363L12.319 7.89084L12.5263 6.05806L12.7284 3.69934L12.7975 3.03529L13.1271 2.23843L13.781 1.80812L14.2914 2.05249L14.7114 2.6528L14.6529 3.0406L14.403 4.66089L13.9139 7.20023L13.5949 8.9002H13.781L13.9937 8.68771L14.8549 7.54554L16.301 5.73931L16.939 5.02214L17.6833 4.23058L18.1618 3.8534H19.0656L19.7301 4.84151L19.4324 5.8615L18.502 7.04086L17.7311 8.03959L16.6253 9.52707L15.9342 10.7171L15.998 10.8127L16.1628 10.7967L18.6615 10.2655L20.0119 10.0211L21.6228 9.74488L22.3511 10.0849L22.4309 10.4302L22.1438 11.1367L20.4213 11.5617L18.401 11.9655L15.3919 12.6773L15.3547 12.7039L15.3972 12.757L16.7529 12.8845L17.3324 12.9164H18.7519L21.3942 13.113L22.0853 13.5698L22.5 14.1276L22.4309 14.5526L21.3676 15.0945L19.9322 14.7545L16.5828 13.9576L15.4344 13.6708H15.2749V13.7664L16.2319 14.7014L17.9863 16.2845L20.182 18.3244L20.2937 18.8291L20.0119 19.2275L19.7142 19.185L17.7843 17.7348L17.04 17.0813L15.3547 15.6629H15.243V15.8117L15.6311 16.3801L17.6833 19.4613L17.7896 20.4069L17.6408 20.715L17.1091 20.901L16.5243 20.7947L15.3228 19.1107L14.0841 17.2141L13.0846 15.5142L12.9623 15.5832L12.3722 21.9316L12.0957 22.2556L11.4577 22.5L10.9261 22.0963L10.6443 21.4428L10.9261 20.1519L11.2663 18.4679L11.5428 17.1291L11.7927 15.4664L11.9415 14.9139L11.9309 14.8767L11.8086 14.8926L10.5539 16.6138L8.64532 19.1904L7.13544 20.8053L6.77392 20.9488L6.14658 20.6247L6.20506 20.0457L6.55595 19.5304L8.64532 16.8741L9.90532 15.2273L10.7187 14.2764L10.7134 14.1383H10.6656L5.11519 17.7401L4.12633 17.8676L3.70101 17.4691L3.75418 16.8157L3.9562 16.6032L5.62557 15.4557L5.62025 15.461Z"/>}
  </svg>;
}

export interface CopyPageProps {
  markdown: string;
  pageUrl?: string;
  installCommand?: string;
  showAssistants?: boolean;
  className?: string;
}
/** Copy documentation and links, view plain text, or hand context to an assistant. */
export function CopyPage({ markdown, pageUrl, installCommand, showAssistants = true, className = "" }: CopyPageProps) {
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);
  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setCopied(true);
      setNotice(`${label} copied`);
      resetTimer.current = setTimeout(() => { setCopied(false); setNotice(""); }, 2000);
    }
    catch { if (resetTimer.current) clearTimeout(resetTimer.current); setCopied(false); setNotice("Copy failed. Check clipboard permission and try again."); }
  }
  function openAssistant(provider: "chatgpt" | "claude") {
    const prompt = `Help me understand and use this component. Here is its documentation:\n\n${markdown}`;
    const base = provider === "chatgpt" ? "https://chatgpt.com/" : "https://claude.ai/new";
    const target = new URL(base);
    const needsPaste = encodeURIComponent(prompt).length > 7000;
    target.searchParams.set("q", needsPaste ? "Help me use this component. I will paste its documentation next." : prompt);
    window.open(target.toString(), "_blank", "noopener,noreferrer");
    if (needsPaste) {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      setCopied(false);
      navigator.clipboard.writeText(markdown).then(() => setNotice("Documentation copied—paste it into the new chat."), () => setNotice("Use Copy page, then paste the documentation into the new chat."));
    }
  }
  function viewMarkdown() {
    const url = URL.createObjectURL(new Blob([markdown], { type: "text/plain;charset=utf-8" }));
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  return <div className={`hw-copy-page-actions ${className}`}>
    <ButtonGroup label="Page actions">
      <Button static variant="secondary" size="sm" className="hw-copy-page-copy" data-copied={copied || undefined} aria-label={copied ? "Copied" : "Copy page"} onClick={() => copy(markdown, "Page")}>
        <span className="hw-copy-page-content" aria-hidden="true">
          <span className="hw-copy-page-idle"><Copy/><span>Copy page</span></span>
          <span className="hw-copy-page-success"><Check/><span>Copied</span></span>
        </span>
      </Button>
      <DropdownMenu><DropdownMenuTrigger asChild><Button static variant="secondary" size="icon-sm" aria-label="More page actions"><ChevronDown aria-hidden="true"/></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="hw-copy-page-menu">
          <DropdownMenuItem onSelect={() => void copy(markdown, "Page")}><Copy/><span>Copy page as Markdown</span></DropdownMenuItem>
          <DropdownMenuItem onSelect={viewMarkdown}><FileText/><span>View as Markdown</span><ArrowUpRight className="hw-copy-page-external"/></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void copy(pageUrl ?? window.location.href, "Page link")}><LinkIcon/><span>Copy page link</span></DropdownMenuItem>
          {installCommand && <DropdownMenuItem onSelect={() => void copy(installCommand, "Install command")}><Terminal/><span>Copy install command</span></DropdownMenuItem>}
          {showAssistants && <>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="hw-copy-page-menu-label">Ask about this component</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => openAssistant("chatgpt")}><ProviderMark provider="openai"/><span>Open in ChatGPT</span><ArrowUpRight className="hw-copy-page-external"/></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => openAssistant("claude")}><ProviderMark provider="claude"/><span>Open in Claude</span><ArrowUpRight className="hw-copy-page-external"/></DropdownMenuItem>
          </>}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
    <span className={copied ? "sr-only" : "hw-copy-page-notice"} role="status">{notice}</span>
  </div>;
}
