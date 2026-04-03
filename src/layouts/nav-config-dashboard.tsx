import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { useLanguage } from 'src/context/language-provider';

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
            path: paths.dashboard.overview,
            icon: ICONS.dashboard,
          },
          {
            title: t('sidebar.orderManagement'),
            path: paths.orders.root,
            icon: ICONS.order,
            children: [
              { title: t('sidebar.receiveOrders'), path: paths.orders.receiveList },
              { title: t('sidebar.receiveSummary'), path: paths.orders.receiveSummary },
              { title: t('sidebar.paymentOrders'), path: paths.orders.paymentList },
            ],
          },
          {
            title: t('sidebar.fundManagement'),
            path: paths.fund.root,
            icon: ICONS.banking,
            children: [
              { title: t('sidebar.settlementRecords'), path: paths.fund.settlementList },
              { title: t('sidebar.applicationApproval'), path: paths.fund.rechargeWithdraw },
            ],
          },

          {
            title: t('sidebar.exportManagement'),
            path: paths.exportManagement,
            icon: ICONS.folder,
          },
          {
            title: t('sidebar.apiDocs'),
            path: 'https://docs.taropay.com/guide/overview',
            icon: ICONS.external,
          },
        ],
      },
    ],
    [t]
  );
}
