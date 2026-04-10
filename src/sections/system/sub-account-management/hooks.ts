import type { RawMenuItem, SubUserListParams } from 'src/api/sub-account';

import useSWR from 'swr';
import { useMemo } from 'react';

import { useListSWRKey } from 'src/hooks/use-list-swr-key';
import { useSearchParamsObject } from 'src/hooks/use-list-search';

import { getMenuList, getSubUserList } from 'src/api/sub-account';

// ----------------------------------------------------------------------

export type PermissionNode = {
  key: string;
  label: string;
  children?: PermissionNode[];
};

export const FIELD_KEYS = [] as const;

// ----------------------------------------------------------------------

export function useSubAccountList() {
  const params = useSearchParamsObject(FIELD_KEYS) as unknown as SubUserListParams;
  const key = useListSWRKey('sub-account', 'list', params);

  const { data, isLoading, mutate } = useSWR(key, () => getSubUserList(params), {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const records = data?.result?.listRecord || [];
  const totalRecord = data?.result?.totalRecord || 0;

  return { records, totalRecord, isLoading, mutate, params };
}

// ----------------------------------------------------------------------

export function useMenuList() {
  const { data, isLoading } = useSWR(['sub-account', 'menu-list'], () => getMenuList(), {
    revalidateOnFocus: false,
  });

  const treeData = useMemo<PermissionNode[]>(() => {
    const menuList: RawMenuItem[] = data?.result || [];
    const byParent: Record<number, RawMenuItem[]> = {};
    menuList.forEach((item) => {
      const pid = item.parentId ?? 0;
      if (!byParent[pid]) byParent[pid] = [];
      byParent[pid].push(item);
    });
    const build = (pid: number): PermissionNode[] => {
      const children = byParent[pid] || [];
      return children.map((i) => ({
        key: String(i.id),
        label: i.name,
        children: build(i.id),
      }));
    };
    return build(0);
  }, [data?.result]);

  return { treeData, isLoading };
}
