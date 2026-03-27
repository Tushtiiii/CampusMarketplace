import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Message as MessageIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const Messages = () => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <MessageIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your conversations will be displayed here.
        </Typography>
        <Button component={Link} to="/" variant="contained">
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

export default Messages;