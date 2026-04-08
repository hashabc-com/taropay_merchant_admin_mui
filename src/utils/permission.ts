import type { IResource } from 'src/stores/auth-store';
import type { NavSectionProps, NavItemDataProps } from 'src/components/nav-section';

// ----------------------------------------------------------------------

/**
 * Check if a route is accessible based on the user's resource list.
 * Uses **exact match** on `resource.url` where `type === 'menu'`.
 * (Aligned with taropay_merchant_admin.)
 */
export function hasRoutePermission(route: string, resourceList?: IResource[]): boolean {
  if (!resourceList?.length) return false;

  const normalized = route === '/' ? '/' : route.replace(/\/$/, '');

  return resourceList.some(
    (r) => r.type === 'menu' && (r.url === '/' ? '/' : r.url.replace(/\/$/, '')) === normalized
  );
}

/**
 * Get the first authorized route from the resource list.
 * Returns the URL of the first `type === 'menu'` resource.
 */
export function getFirstAuthorizedRoute(resourceList?: IResource[]): string | null {
  if (!resourceList?.length) return null;
  const first = resourceList.find((r) => r.type === 'menu');
  return first?.url ?? null;
}

/**
 * Get all authorized route paths from the resource list.
 */
export function getAllAuthorizedRoutes(resourceList?: IResource[]): string[] {
  if (!resourceList?.length) return [];
  return resourceList.filter((r) => r.type === 'menu').map((r) => r.url);
}

// ------ Nav filtering (used by layout) ------

/**
 * Recursively filter navigation data, keeping only items the user has permission to see.
 * Parent groups are kept only when at least one child survives the filter.
 */
export function filterNavByPermission(
  data: NavSectionProps['data'],
  resourceList?: IResource[]
): NavSectionProps['data'] {
  return data
    .map((group) => ({
      ...group,
      items: filterNavItems(group.items, resourceList),
    }))
    .filter((group) => group.items.length > 0);
}

/**
 * Check if a menu item is permitted by matching menuId against resource id.
 */
function hasMenuPermission(menuId: number, resourceList?: IResource[]): boolean {
  if (!resourceList?.length) return false;
  return resourceList.some((r) => r.id === menuId);
}

function filterNavItems(items: NavItemDataProps[], resourceList?: IResource[]): NavItemDataProps[] {
  return items
    .map((item) => {
      // Has children — recurse, keep parent only if children remain
      if (item.children?.length) {
        const filteredChildren = filterNavItems(item.children, resourceList);
        if (filteredChildren.length > 0) {
          return { ...item, children: filteredChildren };
        }
        return null;
      }

      // External links — always visible, skip permission check
      if (item.path?.startsWith('http')) {
        return item;
      }

      // Match by menuId against backend resource id
      if (item.menuId != null) {
        return hasMenuPermission(item.menuId, resourceList) ? item : null;
      }

      // Items without menuId — keep (backwards compatibility)
      return item;
    })
    .filter((item): item is NavItemDataProps => item !== null);
}
