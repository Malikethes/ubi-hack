import React from 'react';
import { Box, Card, CardActionArea, Typography } from '@mui/material';
// Notice: No more 'Grid' import. We don't need it.
import FlashOnIcon from '@mui/icons-material/FlashOn';
import WorkIcon from '@mui/icons-material/Work';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import { useTheme } from '@mui/material/styles';

interface Persona {
  id: string;
  name: string;
  icon: React.ReactElement;
  color: string; // To match Figma's icon colors
}

const PERSONAS: Persona[] = [
  { id: 'Athlete', name: 'Athlete', icon: <FlashOnIcon />, color: '#007AFF' },
  { id: 'Professional', name: 'Professional', icon: <WorkIcon />, color: '#8E24AA' },
  { id: 'Senior', name: 'Senior', icon: <FavoriteBorderIcon />, color: '#4CAF50' },
  { id: 'General', name: 'General', icon: <PersonIcon />, color: '#FFA726' },
];

interface PersonaSelectionProps {
  selectedPersona: string;
  onSelectPersona: (personaId: string) => void;
}

const PersonaSelection: React.FC<PersonaSelectionProps> = ({
  selectedPersona,
  onSelectPersona,
}) => {
  const theme = useTheme();

  return (
    // We replace the <Grid container> with a <Box>
    <Box
      sx={{
        mb: 4,
        display: 'grid', // Use CSS Grid
        gap: 2, // This replaces the <Grid spacing={2}>
        // This defines our responsive columns.
        // 1 column on 'xs' (mobile)
        // 2 columns on 'sm' (tablet)
        // 4 columns on 'md' (desktop)
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
      }}
    >
      {/* We no longer need the <Grid item> wrapper at all. */}
      {PERSONAS.map((persona) => (
        <Card
          key={persona.id} // Put the key on the Card now
          sx={{
            border: 2,
            borderColor:
              selectedPersona === persona.id
                ? persona.color // Highlight selected
                : 'transparent',
            boxShadow:
              selectedPersona === persona.id
                ? `0px 0px 0px 4px ${persona.color}40` // Subtle glow for selected
                : undefined,
          }}
        >
          <CardActionArea
            onClick={() => onSelectPersona(persona.id)}
            sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <Box
              sx={{
                backgroundColor: theme.palette.action.hover, // Light grey circle background
                borderRadius: '50%',
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                '& .MuiSvgIcon-root': {
                  fontSize: '2.5rem',
                  color: persona.color,
                },
              }}
            >
              {persona.icon}
            </Box>
            <Typography variant="body1" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
              {persona.name}
            </Typography>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
};

export default PersonaSelection;