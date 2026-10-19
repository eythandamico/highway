import "../app/globals.css";
import "../app/foundation.css";
import { useLayoutEffect, type ReactNode } from "react";
import type { Preview } from "@storybook/react-vite";
function StoryTheme({theme,scale,children}:{theme:string;scale:string;children:ReactNode}) {
  useLayoutEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.fontSize = `${scale}%`;
    return () => { document.documentElement.classList.remove("dark"); document.documentElement.style.removeProperty("font-size"); };
  }, [theme,scale]);
  return children;
}
export default {
  initialGlobals:{theme:"light",textScale:"100"},
  globalTypes:{
    theme:{description:"Surface theme",toolbar:{icon:"circlehollow",items:["light","dark"]}},
    textScale:{description:"Text size",toolbar:{icon:"paragraph",items:["100","200"]}},
  },
  decorators:[(Story,context)=><StoryTheme theme={context.globals.theme} scale={context.globals.textScale}><Story/></StoryTheme>],
  parameters:{a11y:{test:"error"},layout:"padded"},
} satisfies Preview;
