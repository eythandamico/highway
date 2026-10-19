import type { Meta, StoryObj } from "@storybook/react-vite";
import { EffectsGallery } from "@/components/visual/effects-gallery";
const meta={title:"Foundation/Visual effects",component:EffectsGallery,parameters:{layout:"padded"}} satisfies Meta<typeof EffectsGallery>;
export default meta;type Story=StoryObj<typeof meta>;
export const Light:Story={args:{initialDark:false}};
export const Dark:Story={args:{initialDark:true}};
