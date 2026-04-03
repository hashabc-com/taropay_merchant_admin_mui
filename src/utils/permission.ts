import type { NavSectionProps, NavItemDataProps } from 'src/components/nav-section';

// ----------------------------------------------------------------------

type MenuItem = { name: string; url: string };
type Permissions = { menu: MenuItem[]; user: { roleId: number; account: string } };

/**
 * Check if a route is accessible based on user permissions.
 * Uses prefix matching so that parent permissions (e.g. "/order")
 * grant access to child routes (e.g. "/orders/receive-list").
 */
export function hasRoutePermission(route: string, permissions?: Permissions | null): boolean {
  if (!permissions?.menu?.length) return false;

  const normalized = route === '/' ? '/' : route.replace(/\/$/, '');

  return permissions.menu.some((item) => {
    const menuUrl = item.url === '/' ? '/' : item.url.replace(/\/$/, '');

    // Exact match
    if (menuUrl === normalized) return true;

    // Prefix match — parent permission grants access to children
    if (
      normalized.startsWith(`${menuUrl}/`) ||
      normalized.startsWith(`${menuUrl.replace(/s$/, '')}s/`)
    ) {
      return true;
    }

    return false;
  });
}

/**
 * Get the first authorized route by traversing the nav config in sidebar display order.
 * Returns the path of the first leaf item that passes the permission check.
 */
export function getFirstAuthorizedRoute(
  navData: NavSectionProps['data'],
  checkPermission: (url: string) => boolean
): string | null {
  for (const group of navData) {
    for (const item of group.items) {
      const found = findFirstLeaf(item, checkPermission);
      if (found) return found;
    }
  }
  return null;
}

function findFirstLeaf(
  item: NavItemDataProps,
  checkPermission: (url: string) => boolean
): string | null {
  // Has children — recurse into first authorized child
  if (item.children?.length) {
    for (const child of item.children) {
      const found = findFirstLeaf(child, checkPermission);
      if (found) return found;
    }
    return null;
  }

  // Leaf item — check permission
  if (item.path && checkPermission(item.path)) return item.path;

  return null;
}

/**
 * Recursively filter navigation data, keeping only items the user has permission to see.
 * Parent groups are kept only when at least one child survives the filter.
 */
export function filterNavByPermission(
  data: NavSectionProps['data'],
  checkPermission: (url: string) => boolean
): NavSectionProps['data'] {
  return data
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, checkPermission),
    }))
    .filter((group) => group.items.length > 0);
}

function filterNavItems(
  items: NavItemDataProps[],
  checkPermission: (url: string) => boolean
): NavItemDataProps[] {
  return items
    .map((item) => {
      // Has children — recurse, keep parent only if children remain
      if (item.children?.length) {
        const filteredChildren = filterNavItems(item.children, checkPermission);
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }

      // External links — always visible, skip permission check
      if (item.path?.startsWith('http')) {
        return item;
      }

      // Leaf item — check permission by path
      if (item.path) {
        return checkPermission(item.path) ? item : null;
      }

      // Items without path (unlikely) — keep
      return item;
    })
    .filter((item): item is NavItemDataProps => item !== null);
}
