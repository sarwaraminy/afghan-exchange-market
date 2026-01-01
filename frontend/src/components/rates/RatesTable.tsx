import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef, type MRT_Localization } from 'material-react-table';
import { Box, Chip, Typography } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import type { ExchangeRate } from '../../types';

interface RatesTableProps {
  rates: ExchangeRate[];
  isLoading?: boolean;
}

const mrtLocalizationFa: Partial<MRT_Localization> = {
  actions: 'عملیات',
  cancel: 'لغو',
  clearFilter: 'پاک کردن فیلتر',
  clearSearch: 'پاک کردن جستجو',
  clearSort: 'پاک کردن مرتب‌سازی',
  search: 'جستجو',
  showHideSearch: 'نمایش/مخفی کردن جستجو',
  noRecordsToDisplay: 'رکوردی برای نمایش وجود ندارد',
  sortByColumnAsc: 'مرتب‌سازی صعودی',
  sortByColumnDesc: 'مرتب‌سازی نزولی',
};

export const RatesTable = ({ rates, isLoading = false }: RatesTableProps) => {
  const { t, i18n } = useTranslation();

  const getFlagUrl = (code: string) => `https://flagcdn.com/24x18/${code}.png`;

  const formatRate = (rate: number) => {
    if (rate < 1) return rate.toFixed(4);
    if (rate < 100) return rate.toFixed(2);
    return rate.toFixed(0);
  };

  const getCurrencyName = (code: string, fallback: string) => {
    const translated = t(`currencies.${code}`, { defaultValue: '' });
    return translated || fallback;
  };

  const getMarketName = (name: string) => {
    const translated = t(`rates.markets.${name}`, { defaultValue: '' });
    return translated || name;
  };

  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  const columns = useMemo<MRT_ColumnDef<ExchangeRate>[]>(
    () => [
      {
        accessorKey: 'currency_code',
        header: t('rates.currency'),
        Cell: ({ row }) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {row.original.flag_code && (
              <img
                src={getFlagUrl(row.original.flag_code)}
                alt={row.original.currency_code}
                style={{ width: 24, height: 18, borderRadius: 2 }}
              />
            )}
            <Box>
              <Typography fontWeight={600}>{row.original.currency_code}</Typography>
              <Typography variant="caption" color="text.secondary">
                {getCurrencyName(row.original.currency_code, row.original.currency_name)}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        accessorKey: 'market_name',
        header: t('rates.market'),
        Cell: ({ cell }) => (
          <Chip label={getMarketName(cell.getValue<string>())} size="small" variant="outlined" />
        ),
      },
      {
        accessorKey: 'buy_rate',
        header: t('rates.buy'),
        Cell: ({ cell }) => (
          <Typography fontWeight={600} color="success.main">
            {formatRate(cell.getValue<number>())} AFN
          </Typography>
        ),
      },
      {
        accessorKey: 'sell_rate',
        header: t('rates.sell'),
        Cell: ({ cell }) => (
          <Typography fontWeight={600} color="error.main">
            {formatRate(cell.getValue<number>())} AFN
          </Typography>
        ),
      },
      {
        accessorKey: 'change_percent',
        header: t('rates.change'),
        Cell: ({ cell }) => {
          const value = cell.getValue<number>() || 0;
          const color = value > 0 ? 'success.main' : value < 0 ? 'error.main' : 'text.secondary';
          const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : TrendingFlat;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Icon sx={{ color, fontSize: 18 }} />
              <Typography color={color} fontWeight={500}>
                {value > 0 ? '+' : ''}{value}%
              </Typography>
            </Box>
          );
        },
      },
    ],
    [t, i18n.language]
  );

  return (
    <MaterialReactTable
      columns={columns}
      data={rates}
      state={{ isLoading }}
      enableColumnActions={false}
      enableColumnFilters={false}
      enablePagination={false}
      enableSorting={true}
      enableBottomToolbar={false}
      enableTopToolbar={true}
      enableGlobalFilter={true}
      localization={isRtl ? mrtLocalizationFa : undefined}
      muiTableContainerProps={{ sx: { maxHeight: '600px' } }}
      muiTableProps={{
        sx: {
          tableLayout: 'fixed',
          direction: isRtl ? 'rtl' : 'ltr',
        },
      }}
      muiTableHeadCellProps={{
        sx: { textAlign: isRtl ? 'right' : 'left' },
      }}
      muiTableBodyCellProps={{
        sx: { textAlign: isRtl ? 'right' : 'left' },
      }}
      muiSearchTextFieldProps={{
        placeholder: t('common.search'),
        variant: 'outlined',
        size: 'small',
        sx: { direction: isRtl ? 'rtl' : 'ltr' },
      }}
      initialState={{
        density: 'comfortable',
      }}
    />
  );
};
