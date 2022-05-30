import { BrushParameters } from "@/core/painting/brush-parameters";

declare module "*/brush.json" {
  export interface BrushData {
    brushParamerters: BrushParameters[];
  }

  const value: BrushData;
  export = value;
}