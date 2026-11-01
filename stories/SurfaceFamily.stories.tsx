import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { SurfaceFamily } from "../apps/showcase/components/surface-family";
const meta = { title:"Foundation/Surface family", component:SurfaceFamily, parameters:{layout:"fullscreen"}, decorators:[(Story)=><ThemeProvider attribute="class" defaultTheme="light"><Story/></ThemeProvider>] } satisfies Meta<typeof SurfaceFamily>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
