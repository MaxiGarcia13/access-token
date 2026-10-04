export function debounce(fn: () => void, ms: number) {
  let timer: number | undefined;

  const run = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(fn, ms);
  };

  run.cancel = () => {
    window.clearTimeout(timer);
  };

  return run;
}
