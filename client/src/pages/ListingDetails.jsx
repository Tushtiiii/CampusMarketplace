import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const ListingDetails = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <InfoIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Listing Details
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Detailed listing view will be implemented here.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default ListingDetails;