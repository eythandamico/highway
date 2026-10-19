import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeProvider } from "next-themes";
import { DesignLab } from "@/components/foundation/design-lab";
const meta = {
  title: "Foundation/Quality lab",
  component: DesignLab,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <ThemeProvider attribute="class" defaultTheme="light">
        <Story />
      </ThemeProvider>
    ),
  ],
} satisfies Meta<typeof DesignLab>;
export default meta;
type Story = StoryObj<typeof meta>;
export const AllStates: Story = {};
export const NarrowViewport: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
