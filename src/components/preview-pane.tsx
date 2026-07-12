import { useEffect, useRef, useState } from "react";
import { getRenderDocument } from "../lib/render-document";
import type { RenderTheme } from "../lib/theme";

interface PreviewPaneProps {
  source: string;
  theme: RenderTheme;
}

export function PreviewPane({ source, theme }: PreviewPaneProps) {
  const title = `README++ ${theme} preview`;
  const frameRef = useRef<HTMLIFrameElement>(null);
  const scrollState = useRef({
    cleanup: null as (() => void) | null,
    follow: true,
    top: 0,
  });
  const [isFollowing, setIsFollowing] = useState(true);

  useEffect(() => () => scrollState.current.cleanup?.(), []);

  const handleFrameLoad = () => {
    scrollState.current.cleanup?.();

    const frameWindow = frameRef.current?.contentWindow;
    const frameDocument = frameRef.current?.contentDocument;
    const scrollingElement = frameDocument?.scrollingElement;
    if (!frameWindow || !scrollingElement) return;

    const scrollToSavedPosition = () => {
      const maxScroll = Math.max(0, scrollingElement.scrollHeight - scrollingElement.clientHeight);
      frameWindow.scrollTo({
        top: scrollState.current.follow ? maxScroll : Math.min(scrollState.current.top, maxScroll),
      });
    };

    scrollToSavedPosition();
    frameWindow.requestAnimationFrame(scrollToSavedPosition);

    const handleScroll = () => {
      const maxScroll = Math.max(0, scrollingElement.scrollHeight - scrollingElement.clientHeight);
      const distanceFromBottom = maxScroll - scrollingElement.scrollTop;
      const follow = distanceFromBottom <= 24;
      scrollState.current.follow = follow;
      scrollState.current.top = scrollingElement.scrollTop;
      setIsFollowing(follow);
    };

    frameWindow.addEventListener("scroll", handleScroll, { passive: true });
    scrollState.current.cleanup = () => frameWindow.removeEventListener("scroll", handleScroll);
  };

  return (
    <div className="preview-pane" data-theme={theme}>
      <div className="pane-heading">
        <div>
          <p className="pane-heading__eyebrow">Preview</p>
          <h2 className="pane-heading__title">Shared renderer output</h2>
        </div>
        <p className="pane-heading__meta">{theme} theme · {isFollowing ? "following" : "scroll locked"}</p>
      </div>
      <div className="preview-pane__frame-shell">
        <iframe
          ref={frameRef}
          title={title}
          className="preview-pane__frame"
          sandbox="allow-same-origin"
          onLoad={handleFrameLoad}
          // Keep preview on the shared export path instead of maintaining a
          // separate React-only renderer. The sandbox keeps trusted-input HTML
          // from reaching back into the app shell.
          srcDoc={getRenderDocument(title, source, theme)}
        />
      </div>
    </div>
  );
}
