export const useFullscreen = () => {
  const enterFullscreen = async (_element?: HTMLElement) => {
    const element = document.documentElement;
    const anyElement = element as any;
    if (anyElement.requestFullscreen) return anyElement.requestFullscreen();
    if (anyElement.webkitRequestFullscreen) return anyElement.webkitRequestFullscreen();
    if (anyElement.mozRequestFullScreen) return anyElement.mozRequestFullScreen();
    if (anyElement.msRequestFullscreen) return anyElement.msRequestFullscreen();
  };

  const exitFullscreen = async () => {
    const anyDoc = document as any;
    if (document.exitFullscreen) return document.exitFullscreen();
    if (anyDoc.webkitExitFullscreen) return anyDoc.webkitExitFullscreen();
    if (anyDoc.mozCancelFullScreen) return anyDoc.mozCancelFullScreen();
    if (anyDoc.msExitFullscreen) return anyDoc.msExitFullscreen();
  };

  const toggleFullscreen = async (_element?: HTMLElement) => {
    if (!document.fullscreenElement) {
      await enterFullscreen();
    } else {
      await exitFullscreen();
    }
  };

  return { enterFullscreen, exitFullscreen, toggleFullscreen };
};
