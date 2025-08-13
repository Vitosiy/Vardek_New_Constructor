export const usePrint = () => {
  const printPage = () => window.print?.();
  return { printPage };
}; 