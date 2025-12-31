import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import {
  getExchangeRates,
  getGoldRates,
  getAllNews,
  updateExchangeRate,
  updateGoldRate,
  createNews,
  updateNews,
  deleteNews
} from '../services/api';
import type { ExchangeRate, GoldRate, News } from '../types';
import { Loading } from '../components/common/Loading';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

export const Admin = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);

  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [goldRates, setGoldRates] = useState<GoldRate[]>([]);
  const [news, setNews] = useState<News[]>([]);

  const [editRateDialog, setEditRateDialog] = useState(false);
  const [editGoldDialog, setEditGoldDialog] = useState(false);
  const [newsDialog, setNewsDialog] = useState(false);

  const [selectedRate, setSelectedRate] = useState<ExchangeRate | null>(null);
  const [selectedGold, setSelectedGold] = useState<GoldRate | null>(null);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  const [buyRate, setBuyRate] = useState('');
  const [sellRate, setSellRate] = useState('');
  const [priceAfn, setPriceAfn] = useState('');
  const [priceUsd, setPriceUsd] = useState('');

  const [newsForm, setNewsForm] = useState({
    title: '',
    title_fa: '',
    title_ps: '',
    content: '',
    content_fa: '',
    content_ps: '',
    category: 'general',
    is_published: false
  });

  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ratesData, goldData, newsData] = await Promise.all([
        getExchangeRates(),
        getGoldRates(),
        getAllNews()
      ]);
      setRates(ratesData);
      setGoldRates(goldData);
      setNews(newsData.news);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditRate = (rate: ExchangeRate) => {
    setSelectedRate(rate);
    setBuyRate(rate.buy_rate.toString());
    setSellRate(rate.sell_rate.toString());
    setEditRateDialog(true);
  };

  const handleSaveRate = async () => {
    if (!selectedRate) return;
    try {
      await updateExchangeRate(selectedRate.id, parseFloat(buyRate), parseFloat(sellRate));
      setEditRateDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update rate');
    }
  };

  const handleEditGold = (gold: GoldRate) => {
    setSelectedGold(gold);
    setPriceAfn(gold.price_afn.toString());
    setPriceUsd(gold.price_usd.toString());
    setEditGoldDialog(true);
  };

  const handleSaveGold = async () => {
    if (!selectedGold) return;
    try {
      await updateGoldRate(selectedGold.id, parseFloat(priceAfn), parseFloat(priceUsd));
      setEditGoldDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update gold rate');
    }
  };

  const handleNewNews = () => {
    setSelectedNews(null);
    setNewsForm({
      title: '',
      title_fa: '',
      title_ps: '',
      content: '',
      content_fa: '',
      content_ps: '',
      category: 'general',
      is_published: false
    });
    setNewsDialog(true);
  };

  const handleEditNews = (item: News) => {
    setSelectedNews(item);
    setNewsForm({
      title: item.title,
      title_fa: item.title_fa || '',
      title_ps: item.title_ps || '',
      content: item.content,
      content_fa: item.content_fa || '',
      content_ps: item.content_ps || '',
      category: item.category,
      is_published: !!item.is_published
    });
    setNewsDialog(true);
  };

  const handleSaveNews = async () => {
    try {
      if (selectedNews) {
        await updateNews(selectedNews.id, newsForm);
      } else {
        await createNews(newsForm);
      }
      setNewsDialog(false);
      fetchData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save news');
    }
  };

  const handleDeleteNews = async (id: number) => {
    if (confirm('Are you sure you want to delete this news?')) {
      try {
        await deleteNews(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  const rateColumns = useMemo<MRT_ColumnDef<ExchangeRate>[]>(
    () => [
      { accessorKey: 'currency_code', header: t('rates.currency') },
      { accessorKey: 'market_name', header: t('rates.market') },
      { accessorKey: 'buy_rate', header: t('rates.buy') },
      { accessorKey: 'sell_rate', header: t('rates.sell') },
      {
        id: 'actions',
        header: 'Actions',
        Cell: ({ row }) => (
          <IconButton onClick={() => handleEditRate(row.original)}>
            <Edit />
          </IconButton>
        )
      }
    ],
    [t]
  );

  const goldColumns = useMemo<MRT_ColumnDef<GoldRate>[]>(
    () => [
      { accessorKey: 'type', header: t('gold.type') },
      { accessorKey: 'price_afn', header: t('gold.priceAfn') },
      { accessorKey: 'price_usd', header: t('gold.priceUsd') },
      {
        id: 'actions',
        header: 'Actions',
        Cell: ({ row }) => (
          <IconButton onClick={() => handleEditGold(row.original)}>
            <Edit />
          </IconButton>
        )
      }
    ],
    [t]
  );

  const newsColumns = useMemo<MRT_ColumnDef<News>[]>(
    () => [
      { accessorKey: 'title', header: 'Title' },
      {
        accessorKey: 'category',
        header: 'Category',
        Cell: ({ cell }) => <Chip label={cell.getValue<string>()} size="small" />
      },
      {
        accessorKey: 'is_published',
        header: 'Published',
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue<number>() ? 'Published' : 'Draft'}
            color={cell.getValue<number>() ? 'success' : 'default'}
            size="small"
          />
        )
      },
      {
        id: 'actions',
        header: 'Actions',
        Cell: ({ row }) => (
          <Box>
            <IconButton onClick={() => handleEditNews(row.original)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDeleteNews(row.original.id)} color="error">
              <Delete />
            </IconButton>
          </Box>
        )
      }
    ],
    []
  );

  if (loading) return <Loading />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('admin.panel')}
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t('admin.manageRates')} />
          <Tab label="Gold Rates" />
          <Tab label={t('admin.manageNews')} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tab} index={0}>
            <MaterialReactTable
              columns={rateColumns}
              data={rates}
              enablePagination
              enableSorting
              enableGlobalFilter
            />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <MaterialReactTable
              columns={goldColumns}
              data={goldRates}
              enablePagination={false}
            />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Box sx={{ mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={handleNewNews}>
                {t('admin.addNew')}
              </Button>
            </Box>
            <MaterialReactTable
              columns={newsColumns}
              data={news}
              enablePagination
              enableSorting
              enableGlobalFilter
            />
          </TabPanel>
        </Box>
      </Paper>

      {/* Edit Rate Dialog */}
      <Dialog open={editRateDialog} onClose={() => setEditRateDialog(false)}>
        <DialogTitle>Edit Exchange Rate - {selectedRate?.currency_code}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            type="number"
            label={t('rates.buy')}
            value={buyRate}
            onChange={(e) => setBuyRate(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('rates.sell')}
            value={sellRate}
            onChange={(e) => setSellRate(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditRateDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveRate}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Gold Dialog */}
      <Dialog open={editGoldDialog} onClose={() => setEditGoldDialog(false)}>
        <DialogTitle>Edit Gold Rate - {selectedGold?.type}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceAfn')}
            value={priceAfn}
            onChange={(e) => setPriceAfn(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            type="number"
            label={t('gold.priceUsd')}
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGoldDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveGold}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* News Dialog */}
      <Dialog open={newsDialog} onClose={() => setNewsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedNews ? 'Edit News' : 'Create News'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            fullWidth
            label="Title (English)"
            value={newsForm.title}
            onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label="Title (Dari)"
            value={newsForm.title_fa}
            onChange={(e) => setNewsForm({ ...newsForm, title_fa: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Title (Pashto)"
            value={newsForm.title_ps}
            onChange={(e) => setNewsForm({ ...newsForm, title_ps: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Content (English)"
            value={newsForm.content}
            onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Content (Dari)"
            value={newsForm.content_fa}
            onChange={(e) => setNewsForm({ ...newsForm, content_fa: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Content (Pashto)"
            value={newsForm.content_ps}
            onChange={(e) => setNewsForm({ ...newsForm, content_ps: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Category"
            value={newsForm.category}
            onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
            sx={{ mt: 2 }}
            SelectProps={{ native: true }}
          >
            <option value="general">General</option>
            <option value="market">Market</option>
            <option value="announcement">Announcement</option>
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={newsForm.is_published}
                onChange={(e) => setNewsForm({ ...newsForm, is_published: e.target.checked })}
              />
            }
            label="Published"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewsDialog(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleSaveNews}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
