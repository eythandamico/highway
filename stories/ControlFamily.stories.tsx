import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { ControlFamily } from "../apps/showcase/components/control-family";
const meta = {
  title: "Foundation/Control family",
  component: ControlFamily,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <ThemeProvider attribute="class" defaultTheme="light"><Story/></ThemeProvider>],
} satisfies Meta<typeof ControlFamily>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
