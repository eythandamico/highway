"use client";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Feedback } from "./feedback";

/** Keep the workspace shell usable if one lazy feature cannot render. */
export class SectionBoundary extends Component<
  { children: ReactNode; resetKey?: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidUpdate(previous: { resetKey?: string }) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (this.state.failed)
      return (
        <Feedback
          action={
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Reload app
            </Button>
          }
        >
          This section couldn’t open. Reload to try
          again; unsaved entries on this page will be lost.
        </Feedback>
      );
    return this.props.children;
  }
}
