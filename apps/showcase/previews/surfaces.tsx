"use client";
import { useExampleState } from "./example-state";
import { Button } from "../../../packages/highway-react/src/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../packages/highway-react/src/components/ui/card";
import { Status } from "../../../packages/highway-react/src/components/foundation/status";
import { GradientAvatar } from "../../../packages/highway-react/src/components/visual/gradient-avatar";
import { GradientSurface } from "../../../packages/highway-react/src/components/visual/gradient-surface";
import { ProgressiveBlur } from "../../../packages/highway-react/src/components/visual/progressive-blur";
import { AccountAvatar } from "../../../examples/yardwork/src/components/yardwork/account-avatar";
import { appearanceStyle, DEFAULT_ACCENT } from "../../../lib/design/appearance-style";
import { ThemeScope } from "../../../packages/highway-react/src/components/ui/theme-scope";
import "../../../packages/highway-react/src/components/visual/visual-effects.css";
import "../../../examples/yardwork/src/components/yardwork/yardwork.css";
import { MenuPreview } from "./actions";

export function CardPreview(){return <Card><CardHeader><CardTitle>A little room to think.</CardTitle><CardDescription>Related information, kept together.</CardDescription></CardHeader><CardContent><p className="muted">Group related information and actions.</p></CardContent></Card>;}

export function AvatarPreview(){const [identity]=useExampleState("identity", "Alex Morgan");return <div className="library-preview-form"><div className="library-preview-row"><AccountAvatar identity={identity}/><GradientAvatar identity={identity} label={identity||"Example avatar"} size={64}/></div></div>;}

export function GradientPreview(){const [variant]=useExampleState<"onboarding"|"profile"|"upload"|"stage">("variant", "onboarding");return <><GradientSurface className="library-gradient" variant={variant}><ProgressiveBlur recipe="header" edge="top"/><h3>Space for the next good idea.</h3></GradientSurface></>;}

export function ThemePreview(){const tokens=appearanceStyle(DEFAULT_ACCENT);return <ThemeScope tokens={tokens}><div style={tokens} className="library-preview-form"><Button>Continue</Button><Status tone="good">Semantic status stays independent</Status><MenuPreview/></div></ThemeScope>;}
