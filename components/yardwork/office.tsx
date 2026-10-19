"use client";
import { lazy, Suspense, useEffect, useRef, useState, startTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Users,
  House,
  ReceiptText,
  MessageSquare,
  Inbox as InboxIcon,
  Settings,
  Activity,
  PanelLeftClose,
  UserRound,
  Sparkles,
} from "lucide-react";
import { OfficeProvider, useOffice, type Snapshot } from "./context";
import { Button } from "./shared";
import {DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuLabel,DropdownMenuItem,DropdownMenuSeparator} from "@/components/ui/dropdown-menu";
import { officeClock } from "@/lib/yardwork/office-clock";
import { AccountAvatar } from "./account-avatar";
import { ProgressiveBlur } from "@/components/visual/progressive-blur";
import { useSession } from "@/components/foundation/providers";
import { appearanceStyle } from "@/lib/yardwork/appearance-style";
import { SectionBoundary } from "@/components/foundation/section-boundary";
import { ThemeScope } from "@/components/ui/theme-scope";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Feedback, LoadingState } from "@/components/foundation/feedback";
import "@/components/visual/visual-effects.css";
import "./yardwork.css";
import AskLauncher from "./ask-launcher";
import { preloadOnce } from "@/lib/ui/preload";
import { OfficeNavigation } from "./office-navigation";
import { PageMemory, RememberedPage, usePageMemory } from "./page-memory";
const AccountOnboarding = lazy(() => import("./account-onboarding"));
const loadToday = preloadOnce(() => import("./today"));
const Today = lazy(loadToday);
const loadFindWork = preloadOnce(() => import("./find-work"));
const FindWork = lazy(loadFindWork);
const loadSchedule = preloadOnce(() => import("./schedule"));
const Schedule = lazy(loadSchedule);
const loadCustomers = preloadOnce(() => import("./customers"));
const Customers = lazy(loadCustomers);
const loadMoney = preloadOnce(() => import("./money"));
const Money = lazy(loadMoney);
const loadTeam = preloadOnce(() => import("./team"));
const Team = lazy(loadTeam);
const loadInbox = preloadOnce(() => import("./inbox"));
const Inbox = lazy(loadInbox);
const loadSettingsScreen = preloadOnce(() => import("./settings"));
const SettingsScreen = lazy(loadSettingsScreen);
const loadActivityScreen = preloadOnce(() => import("./activity"));
const ActivityScreen = lazy(loadActivityScreen);
const loadAsk = preloadOnce(() => import("./ask"));
const Ask = lazy(loadAsk);
const sections = [
  ["today", "Today", House],
  ["schedule", "Schedule", CalendarDays],
  ["customers", "Customers", Users],
  ["money", "Money", ReceiptText],
  ["inbox", "Inbox", MessageSquare],
  ["team", "Team", Users],
  ["activity", "Activity", Activity],
  ["settings", "Settings", Settings],
] as const;
const pageLoaders = { today: loadToday, schedule: loadSchedule, customers: loadCustomers, money: loadMoney, inbox: loadInbox, team: loadTeam, activity: loadActivityScreen, settings: loadSettingsScreen, chat: loadAsk };
function warmPage(section: keyof typeof pageLoaders) { void pageLoaders[section]().catch(() => {}); }
export type Section = (typeof sections)[number][0] | "chat";
export default function Office({
  initial,
  initialNow,
  demo = true,
}: {
  initial: Snapshot;
  initialNow: string;
  demo?: boolean;
}) {
  return (
    <OfficeProvider initial={initial} initialNow={initialNow} demo={true}>
      <PageMemory key={demo ? "demo" : initial.workspaceId} scope={demo ? "demo" : initial.workspaceId || "guest"}><OfficeLayout /></PageMemory>
    </OfficeProvider>
  );
}
function OfficeLayout() {
  const { state, demo, busy, error, refresh, role, now } = useOffice(),
    { user, openSignIn, signOut } = useSession();
  const pageMemory = usePageMemory();
  const params = useSearchParams();
  const selected = params.get("view") as Section;
  const view = (selected === "chat" || sections.some((s) => s[0] === selected)) ? selected : "today";
  const inboxCount = state.leads.filter(lead => lead.status === "new").length;
  const [more, setMore] = useState(false);
  const [account, setAccount] = useState(false);
  const [findWork, setFindWork] = useState(false);
  const accountAuth = useRef(false);
  const openAsk = () => go("chat");
  const go = (next: Section) => {
    const method = next === "chat" || view === "chat" ? "pushState" : "replaceState";
    pageMemory?.set(`scroll:${view}`, window.scrollY);
    warmPage(next);
    // These are views of the same authorized snapshot, not new server routes.
    startTransition(() => window.history[method](null, "", `${demo ? "/demo" : "/workspace"}?view=${next}${demo&&params.get("devData")==="off"?"&devData=off":""}`));
    setMore(false);
  };
  const content = {
    today: <Today go={go} />,
    schedule: <Schedule />,
    customers: <Customers />,
    money: <Money />,
    team: <Team />,
    inbox: <Inbox />,
    activity: <ActivityScreen />,
    settings: <SettingsScreen />,
    chat: <Ask />,
  }[view];
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 90000);
    return () => clearInterval(timer);
  }, [refresh]);
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? "")) return;
    const idle = window.requestIdleCallback?.(() => { warmPage("today"); warmPage("schedule"); }, { timeout: 2500 });
    return () => { if (idle !== undefined) window.cancelIdleCallback(idle); };
  }, []);
  const style = appearanceStyle(state.appearance);
  return (
    <ThemeScope tokens={style}>
      <div className="yw-app" data-view={view} style={style}>
        <div className="yw-body">
          <header className="yw-topbar">
            <ProgressiveBlur recipe="header" edge="top" />
            <div className="yw-topbar-content">
              <div className="yw-wordmark">
                
                <Link href={demo ? (params.get("devData")==="off"?"/demo?devData=off":"/demo") : "/workspace"}>yardwork<span>.</span></Link>
              </div>
              <OfficeNavigation current={view} onNavigate={go} onIntent={warmPage} />
              <div className="yw-account">
                <Button className="yw-header-find-work" onPointerEnter={() => { void loadFindWork().catch(() => {}); }} onFocus={() => { void loadFindWork().catch(() => {}); }} onClick={() => setFindWork(true)}>Find work</Button>
                <Button variant="ghost" size="icon" className="yw-header-inbox" aria-label={inboxCount ? `Inbox, ${inboxCount} new ${inboxCount === 1 ? "item" : "items"}` : "Inbox"} title="Inbox" onPointerEnter={() => warmPage("inbox")} onFocus={() => warmPage("inbox")} aria-current={view === "inbox" ? "page" : undefined} onClick={() => go("inbox")}>
                  <InboxIcon className="size-6" size={24} strokeWidth={1.75} aria-hidden="true" />
                  {inboxCount > 0 && <span className="yw-header-inbox-count" aria-hidden="true">{inboxCount > 99 ? "99+" : inboxCount}</span>}
                </Button>
                <DropdownMenu open={account} onOpenChange={setAccount}>
                  <DropdownMenuTrigger asChild><Button variant="ghost" className="yw-account-trigger" aria-label="Account and workspace"><AccountAvatar identity={user?.id || (demo ? "yardwork-demo" : "yardwork-guest")}/></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={8} className="yw-account-menu" aria-label="Account and workspace" onCloseAutoFocus={event=>{if(accountAuth.current){event.preventDefault();accountAuth.current=false;}}}>
                    <DropdownMenuLabel className="yw-account-summary"><strong>{state.business.name}</strong>{state.business.city&&<span>{state.business.city}</span>}</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuLabel>Standalone demo · changes reset on reload</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link href="/guide">How to use this foundation</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/showcase">Component showcase</Link></DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onSelect={()=>go("team")}><Users aria-hidden="true"/>Team</DropdownMenuItem>
                    <DropdownMenuItem onSelect={()=>go("settings")}><Settings aria-hidden="true"/>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onSelect={()=>{if(user)void signOut();else{accountAuth.current=true;openSignIn();}}}><UserRound aria-hidden="true"/>{user?"Sign out":"Sign in"}</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <div className="yw-content" aria-busy={busy}>
            {error && (
              <Feedback
                action={
                  <Button variant="ghost" onClick={() => void refresh()}>
                    Refresh
                  </Button>
                }
              >
                {error}
              </Feedback>
            )}
            <SectionBoundary resetKey={view}>
              <Suspense fallback={<LoadingState>Opening {view}…</LoadingState>}>
                {!demo&&role==="owner"&&state.onboarding && !state.onboarding.dismissed&&<AccountOnboarding/>}
                <RememberedPage key={view} name={view}>{content}</RememberedPage>
              </Suspense>
            </SectionBoundary>
          </div>
        </div>
        <nav className="yw-mobile-nav" aria-label="Mobile office navigation">
          {sections.slice(0, 4).map(([key, label, Icon]) => (
            <Button
              key={key}
              variant="ghost"
              aria-current={view === key ? "page" : undefined}
              onPointerEnter={() => warmPage(key)} onFocus={() => warmPage(key)} onClick={() => go(key)}
            >
              <Icon size={21} />
              <span>{label}</span>
            </Button>
          ))}
          <Dialog open={more} onOpenChange={setMore}>
            <DialogTrigger asChild>
              <Button variant="ghost" aria-label="More navigation">
                <PanelLeftClose size={21} />
                <span>More</span>
              </Button>
            </DialogTrigger>
            <DialogContent mobileSheet className="yw-navigation-dialog">
              <DialogTitle>Office navigation</DialogTitle>
              <DialogDescription>Choose a workspace section.</DialogDescription>
              <nav
                className="yw-navigation-list"
                aria-label="More office navigation"
              >
                {sections.map(([key, label, Icon]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    aria-current={view === key ? "page" : undefined}
                    onPointerEnter={() => warmPage(key)} onFocus={() => warmPage(key)} onClick={() => go(key)}
                  >
                    <Icon aria-hidden="true" size={20} />
                    {label}
                  </Button>
                ))}
              </nav>
              <Button
                variant="secondary"
                onClick={() => {
                  setMore(false);
                  go("chat");
                }}
              >
                <Sparkles aria-hidden="true" size={18} />
                Ask Yardwork
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setMore(false);
                  if (user) void signOut();
                  else openSignIn();
                }}
              >
                {user ? "Sign out" : "Sign in"}
              </Button>
            </DialogContent>
          </Dialog>
        </nav>
        {findWork && <Suspense fallback={null}><FindWork date={officeClock(now).day} crew="all" onClose={() => setFindWork(false)} /></Suspense>}
        <AskLauncher open={view === "chat" || more || findWork} onOpen={openAsk} />
      </div>
    </ThemeScope>
  );
}
