import { Avatar, Box, Button, Card, CardActions, CardContent, Grid, InputLabel, Typography } from '@mui/material';
import MainPageContainer from '../components/MainPageContainer';
import GroupIcon from "@mui/icons-material/Group";
import Calculate from "@mui/icons-material/Calculate";
import TableChart from "@mui/icons-material/TableChart";
import { MultipleStop } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { getTotals } from '../api/dashboard/dashboard';
import { useNavigate } from 'react-router-dom';
import RequestsSummary from '../components/RequestsSummary';
import FavoritesSummary from '../components/FavoritesSummary';

const statsInit = [
  {
    name: "Datasets",
    value: "0",
    icon: <TableChart />,
  },
  {
    name: "Users",
    value: "0",
    icon: <GroupIcon />,
  },
  {
    name: "Requests",
    value: "0",
    icon: <MultipleStop />,
  },
  {
    name: "Computations Runs",
    value: "0",
    icon: <Calculate />,
  },
];

export const DashboardPage = () => {
  const [stats, setStats] = useState(statsInit);
  const navigate = useNavigate();

  const getDashboardTotals = async () => {
    const totals = await getTotals();
    setStats([
      {
        name: "Datasets",
        value: totals.datasets,
        icon: <TableChart />,
      },
      {
        name: "Users",
        value: totals.users,
        icon: <GroupIcon />,
      },
      {
        name: "Requests",
        value: totals.requests,
        icon: <MultipleStop />,
      },
      {
        name: "Computations Runs",
        value: totals.computations,
        icon: <Calculate />,
      }
    ]);
  };

  useEffect(() => {
    getDashboardTotals();
  }, []);

  const handleGoToRequests = () => {
    navigate('/requests');
  };

  const handleGoToFavorites = () => {
    navigate('/favorite-datasets');
  };

  return (
    <MainPageContainer title='Home'>
      <Box
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "background.default" : "grey.50",
        }}
      >
        <InputLabel sx={{mb: 1}}>Totals</InputLabel>
        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid item key={stat.name} xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ display: "flex", flexDirection: "row" }}>
                  <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography color="text.secondary" component="div">
                      {stat.name}
                    </Typography>
                    <Typography variant="h5" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <InputLabel sx={{ mt: 3, mb: 1 }}>For me</InputLabel>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <RequestsSummary />
              </CardContent>
              <CardActions>
                <Button onClick={handleGoToRequests}>View more</Button>
              </CardActions>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Card>
              <CardContent>
                <FavoritesSummary />
              </CardContent>
              <CardActions>
                <Button onClick={handleGoToFavorites}>View more</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </MainPageContainer>
  );
}
