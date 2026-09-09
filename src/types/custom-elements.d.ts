// Custom elements used in the root layout.
//
// `amp-auto-ads` is the AdSense auto-ads element (AMP script included in
// <head>, element rendered in <body>). It is not a React component, so the
// JSX intrinsic element must be declared for TypeScript strict mode.
import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "amp-auto-ads": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: string;
        "data-ad-client"?: string;
      };
    }
  }
}
