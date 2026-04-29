import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { useLanguage } from 'src/context/language-provider';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  setting: icon('ic-setting'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

export function useNavData(): NavSectionProps['data'] {
  const { t } = useLanguage();

  return useMemo(
    () => [
      {
        items: [
          {
            title: t('sidebar.dashboard'),
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
            menuId: 1,
          },
          {
            title: t('sidebar.orderManagement'),
            path: paths.orders.root,
            icon: ICONS.order,
            menuId: 2,
            children: [
              { title: t('sidebar.receiveOrders'), path: paths.orders.receiveLists, menuId: 4 },
              { title: t('sidebar.paymentOrders'), path: paths.orders.paymentLists, menuId: 3 },
              {
                title: t('sidebar.transactionSummary'),
                path: paths.orders.transactionSummary,
                menuId: 5,
              },
            ],
          },
          {
            title: t('sidebar.fundManagement'),
            path: paths.fund.root,
            icon: ICONS.banking,
            menuId: 6,
            children: [
              { title: t('sidebar.fundsDetail'), path: paths.fund.fundsDetail, menuId: 7 },
              {
                title: t('sidebar.rechargeWithdraw'),
                path: paths.fund.rechargeWithdraw,
                menuId: 8,
              },
            ],
          },
          {
            title: t('sidebar.subAccountManagement'),
            path: paths.subAccountManagement,
            icon: ICONS.user,
            menuId: 11,
          },
          {
            title: t('sidebar.secretManagement'),
            path: paths.secret.management,
            icon: ICONS.lock,
            menuId: 9,
          },
          {
            title: t('sidebar.exportManagement'),
            path: paths.exportManagement,
            icon: ICONS.folder,
            menuId: 10,
          },
          {
            title: t('sidebar.apiDocs'),
            path: 'https://docs.taropay.com/guide/overview',
            icon: ICONS.external,
          },
          {
            title: t('sidebar.apiPlayground'),
            path: paths.apiPlayground,
            icon: <Iconify icon="solar:code-bold-duotone" width={24} />,
          },
        ],
      },
    ],
    [t]
  );
}
