import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Favorites = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <FavoriteIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Favorite Listings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your favorite listings will be displayed here.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Favorites;