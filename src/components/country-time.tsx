// ----------------------------------------------------------------------

/** Country code → IANA timezone mapping */
const COUNTRY_TIMEZONE: Record<string, string> = {
  ID: 'Asia/Jakarta',
  BR: 'America/Sao_Paulo',
  VN: 'Asia/Ho_Chi_Minh',
  MX: 'America/Mexico_City',
  BD: 'Asia/Dhaka',
  PH: 'Asia/Manila',
  NG: 'Africa/Lagos',
  PK: 'Asia/Karachi',
};

function formatTime(date: Date, timezone: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function formatDate(date: Date, timezone: string, locale: string) {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-US', {
    timeZone: timezone,
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).format(date);
}

// ----------------------------------------------------------------------

export function CountryTime() {
  console.log('CountryTime==========>');
  return <h1>CountryTime</h1>;
  // const countryCode = useAuthStore((s) => s.userInfo?.countryCode);
  // const { t, lang } = useLanguage();
  // const [now, setNow] = useState(() => new Date());

  // useEffect(() => {
  //   const timer = setInterval(() => setNow(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  // console.log('CountryTime-code==========>', countryCode);

  // if (!countryCode) return null;

  // const timezone = COUNTRY_TIMEZONE[countryCode];
  // if (!timezone) return null;

  // const countryName = t(`common.countrys.${countryCode}`);
  // const countryTime = formatTime(now, timezone, lang);
  // const countryDate = formatDate(now, timezone, lang);
  // const beijingTime = formatTime(now, 'Asia/Shanghai', lang);
  // const beijingDate = formatDate(now, 'Asia/Shanghai', lang);

  // return (
  //   <Tooltip
  //     arrow
  //     title={
  //       <Box sx={{ p: 0.5 }}>
  //         <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3, mb: 0.5 }}>
  //           <Typography
  //             variant="caption"
  //             sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
  //           >
  //             {countryName}
  //           </Typography>
  //           <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
  //             {countryDate} {countryTime}
  //           </Typography>
  //         </Box>
  //         <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
  //           <Typography
  //             variant="caption"
  //             sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
  //           >
  //             {t('common.countryTime.beijing')}
  //           </Typography>
  //           <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
  //             {beijingDate} {beijingTime}
  //           </Typography>
  //         </Box>
  //       </Box>
  //     }
  //   >
  //     <Box
  //       sx={{
  //         display: { xs: 'none', md: 'flex' },
  //         alignItems: 'center',
  //         gap: 0.75,
  //         cursor: 'default',
  //         color: 'text.secondary',
  //         '&:hover': { color: 'text.primary' },
  //         transition: (theme) => theme.transitions.create('color'),
  //       }}
  //     >
  //       <Iconify icon="solar:clock-circle-outline" width={18} />
  //       <Typography
  //         variant="caption"
  //         sx={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
  //       >
  //         {countryTime}
  //       </Typography>
  //     </Box>
  //   </Tooltip>
  // );
}
