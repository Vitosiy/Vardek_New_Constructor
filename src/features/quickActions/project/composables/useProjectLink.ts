import type { Router } from "vue-router";

export function buildProjectLink(
  router: Router,
  id: string | number,
): string {
  const resolved = router.resolve({
    path: "/2d",
    query: { projectId: String(id) },
  });

  return new URL(resolved.href, window.location.origin).toString();
}
