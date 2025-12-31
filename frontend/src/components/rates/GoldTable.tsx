import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { Typography, Chip } from '@mui/material';
import type { GoldRate } from '../../types';

interface GoldTableProps {
  rates: GoldRate[];
  isLoading?: boolean;
}

export const GoldTable = ({ rates, isLoading = false }: GoldTableProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'fa' || i18n.language === 'ps';

  const columns = useMemo<MRT_ColumnDef<GoldRate>[]>(
    () => [
      {
        accessorKey: 'type',
        header: t('gold.type'),
        Cell: ({ cell }) => (
          <Typography fontWeight={600}>{cell.getValue<string>()}</Typography>
        ),
      },
      {
        accessorKey: 'price_afn',
        header: t('gold.priceAfn'),
        Cell: ({ cell }) => (
          <Typography fontWeight={600} color="warning.main">
            {cell.getValue<number>().toLocaleString()} AFN
          </Typography>
        ),
      },
      {
        accessorKey: 'price_usd',
        header: t('gold.priceUsd'),
        Cell: ({ cell }) => (
          <Typography fontWeight={600} color="success.main">
            ${cell.getValue<number>().toFixed(2)}
          </Typography>
        ),
      },
      {
        accessorKey: 'unit',
        header: t('gold.unit'),
        Cell: ({ cell }) => (
          <Chip label={cell.getValue<string>()} size="small" variant="outlined" />
        ),
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
      enableSorting={false}
      enableBottomToolbar={false}
      enableTopToolbar={false}
      muiTableProps={{
        sx: { direction: isRtl ? 'rtl' : 'ltr' },
      }}
      muiTableHeadCellProps={{
        sx: { textAlign: isRtl ? 'right' : 'left' },
      }}
      muiTableBodyCellProps={{
        sx: { textAlign: isRtl ? 'right' : 'left' },
      }}
      initialState={{
        density: 'comfortable',
      }}
    />
  );
};
