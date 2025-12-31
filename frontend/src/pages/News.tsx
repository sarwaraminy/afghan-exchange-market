import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Box,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { getNews } from '../services/api';
import type { News as NewsType } from '../types';
import { Loading } from '../components/common/Loading';

export const News = () => {
  const { t, i18n } = useTranslation();
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await getNews(category || undefined);
        setNews(data.news);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [category]);

  const getLocalizedTitle = (item: NewsType) => {
    if (i18n.language === 'fa' && item.title_fa) return item.title_fa;
    if (i18n.language === 'ps' && item.title_ps) return item.title_ps;
    return item.title;
  };

  const getLocalizedContent = (item: NewsType) => {
    if (i18n.language === 'fa' && item.content_fa) return item.content_fa;
    if (i18n.language === 'ps' && item.content_ps) return item.content_ps;
    return item.content;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'fa-AF', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('news.title')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ToggleButtonGroup
          value={category}
          exclusive
          onChange={(_, value) => setCategory(value)}
        >
          <ToggleButton value={null}>{t('news.all')}</ToggleButton>
          <ToggleButton value="market">{t('news.market')}</ToggleButton>
          <ToggleButton value="announcement">{t('news.announcement')}</ToggleButton>
          <ToggleButton value="general">{t('news.general')}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <Loading />
      ) : news.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          {t('common.noResults')}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {news.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card>
                <CardActionArea>
                  {item.image_url && (
                    <Box
                      component="img"
                      src={item.image_url}
                      alt={item.title}
                      sx={{ width: '100%', height: 160, objectFit: 'cover' }}
                    />
                  )}
                  <CardContent>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {getLocalizedTitle(item)}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {getLocalizedContent(item)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      {formatDate(item.created_at)}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
