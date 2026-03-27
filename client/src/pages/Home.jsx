import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  Pagination,
  Alert,
  Skeleton,
  Badge,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// Categories for filtering
const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'textbooks', label: 'Textbooks' },
  { value: 'lab-equipment', label: 'Lab Equipment' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'sports-equipment', label: 'Sports Equipment' },
  { value: 'musical-instruments', label: 'Musical Instruments' },
  { value: 'art-supplies', label: 'Art Supplies' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'other', label: 'Other' },
];

const conditions = [
  { value: 'all', label: 'All Conditions' },
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

const ListingCard = ({ listing, onToggleFavorite }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    onToggleFavorite(listing._id);
  };

  const handleCardClick = () => {
    navigate(`/listing/${listing._id}`);
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={200}
          image={listing.mainImage?.url || '/placeholder-image.jpg'}
          alt={listing.title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Price badge */}
        <Chip
          label={`$${listing.price}`}
          color="primary"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        />
        
        {/* Favorite button */}
        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
        >
          {listing.isFavorited ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
        
        {/* Condition badge */}
        <Chip
          label={listing.condition}
          size="small"
          variant="outlined"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            textTransform: 'capitalize',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" component="h3" noWrap sx={{ mb: 1 }}>
          {listing.title}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {listing.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <LocationIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {listing.location?.campus}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
          </Typography>
          
          <Chip
            label={listing.category.replace('-', ' ')}
            size="small"
            variant="outlined"
            sx={{ textTransform: 'capitalize' }}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="body2" color="text.secondary">
            by {listing.seller?.firstName} {listing.seller?.lastName}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Badge badgeContent={listing.views} color="primary" max={999}>
              <Typography variant="caption" color="text.secondary">
                views
              </Typography>
            </Badge>
          </Box>
        </Box>
      </CardActions>
    </Card>
  );
};

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    condition: searchParams.get('condition') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page')) || 1,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value.toString());
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Fetch listings
  const { data: listingsData, isLoading, error } = useQuery(
    ['listings', filters],
    () => listingsAPI.getListings(filters),
    {
      keepPreviousData: true,
      staleTime: 30000, // 30 seconds
    }
  );

  // Fetch trending listings for the hero section
  const { data: trendingData } = useQuery(
    'trending-listings',
    listingsAPI.getTrendingListings,
    {
      staleTime: 300000, // 5 minutes
    }
  );

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation(
    listingsAPI.toggleFavorite,
    {
      onSuccess: (data, listingId) => {
        // Update the listings cache
        queryClient.setQueryData(['listings', filters], (oldData) => {
          if (!oldData) return oldData;
          
          return {
            ...oldData,
            data: {
              ...oldData.data,
              listings: oldData.data.listings.map((listing) =>
                listing._id === listingId
                  ? { ...listing, isFavorited: data.data.isFavorited }
                  : listing
              ),
            },
          };
        });
        
        enqueueSnackbar(data.data.message, { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to update favorite',
          { variant: 'error' }
        );
      },
    }
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (listingId) => {
    toggleFavoriteMutation.mutate(listingId);
  };

  const listings = listingsData?.data?.listings || [];
  const pagination = listingsData?.data?.pagination || {};
  const trendingListings = trendingData?.data?.listings?.slice(0, 3) || [];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
                Campus Marketplace
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Buy and sell textbooks, electronics, and more with fellow students
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                  }}
                  component={Link}
                  to="/search"
                >
                  Browse Items
                </Button>
                {isAuthenticated && (
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                    component={Link}
                    to="/create-listing"
                  >
                    Sell an Item
                  </Button>
                )}
              </Box>
            </Grid>
            
            {trendingListings.length > 0 && (
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                  <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-end' } }}>
                    <TrendingIcon sx={{ mr: 1 }} />
                    Trending Now
                  </Typography>
                  <Grid container spacing={1} justifyContent={{ xs: 'center', md: 'flex-end' }}>
                    {trendingListings.map((listing) => (
                      <Grid item xs={6} sm={4} md={4} key={listing._id}>
                        <Card 
                          component={Link}
                          to={`/listing/${listing._id}`}
                          sx={{
                            textDecoration: 'none',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.05)' },
                          }}
                        >
                          <CardMedia
                            component="img"
                            height={100}
                            image={listing.mainImage?.url || '/placeholder-image.jpg'}
                            alt={listing.title}
                          />
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="caption" noWrap>
                              {listing.title}
                            </Typography>
                            <Typography variant="body2" color="primary" fontWeight="bold">
                              ${listing.price}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Search and Filters */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                placeholder="Search listings..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Category"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                {categories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="Condition"
                value={filters.condition}
                onChange={(e) => handleFilterChange('condition', e.target.value)}
              >
                {conditions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={1}>
              <TextField
                select
                fullWidth
                label="Sort"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Results */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            Failed to load listings. Please try again.
          </Alert>
        )}

        {!isLoading && listings.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No listings found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search criteria or browse all categories.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => setFilters({
                search: '',
                category: 'all',
                condition: 'all',
                minPrice: '',
                maxPrice: '',
                sortBy: 'newest',
                page: 1,
              })}
            >
              Clear Filters
            </Button>
          </Box>
        )}

        {/* Listings Grid */}
        <Grid container spacing={3}>
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => (
                <Grid item key={index} xs={12} sm={6} md={4} lg={3}>
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={20} />
                      <Skeleton variant="text" height={20} width="60%" />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            : listings.map((listing) => (
                <Grid item key={listing._id} xs={12} sm={6} md={4} lg={3}>
                  <ListingCard listing={listing} onToggleFavorite={handleToggleFavorite} />
                </Grid>
              ))}
        </Grid>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Home;