import React from 'react';
import { Container, Typography, Box, Link, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Pets, Facebook, Twitter, Instagram, Email } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            gap: 4,
            mb: 3,
          }}
        >
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, maxWidth: 300 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, mb: 2 }}>
              <Pets sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                PetFinder
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Helping lost pets find their way home. Join our community today.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              <Button 
                size="small" 
                sx={{ minWidth: 'auto', p: 1 }}
                onClick={() => window.open('https://facebook.com', '_blank')}
              >
                <Facebook fontSize="small" />
              </Button>
              <Button 
                size="small" 
                sx={{ minWidth: 'auto', p: 1 }}
                onClick={() => window.open('https://twitter.com', '_blank')}
              >
                <Twitter fontSize="small" />
              </Button>
              <Button 
                size="small" 
                sx={{ minWidth: 'auto', p: 1 }}
                onClick={() => window.open('https://instagram.com', '_blank')}
              >
                <Instagram fontSize="small" />
              </Button>
              <Button 
                size="small" 
                sx={{ minWidth: 'auto', p: 1 }}
                onClick={() => window.location.href = 'mailto:help@petfinder.com'}
              >
                <Email fontSize="small" />
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Navigation
            </Typography>
            <Link component={RouterLink} to="/" color="text.secondary" underline="hover">
              Home
            </Link>
            <Link component={RouterLink} to="/search" color="text.secondary" underline="hover">
              Find Pets
            </Link>
            <Link component={RouterLink} to="/create-ad" color="text.secondary" underline="hover">
              Create Ad
            </Link>
            <Link component={RouterLink} to="/about" color="text.secondary" underline="hover">
              About
            </Link>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Support
            </Typography>
            <Link component={RouterLink} to="/help" color="text.secondary" underline="hover">
              Help Center
            </Link>
            <Link component={RouterLink} to="/contact" color="text.secondary" underline="hover">
              Contact Us
            </Link>
            <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover">
              Terms of Service
            </Link>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Contact Info
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Email: help@petfinder.com
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Phone: +1 (555) 123-4567
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Support: 24/7 Available
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
            pt: 2,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} PetFinder. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover" variant="body2">
              Privacy
            </Link>
            <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover" variant="body2">
              Terms
            </Link>
            <Link component={RouterLink} to="/sitemap" color="text.secondary" underline="hover" variant="body2">
              Sitemap
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;