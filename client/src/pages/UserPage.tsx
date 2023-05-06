import { Alert, Box, Button, Card, CardContent, Container, Grid, Stack, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User } from '../api/users/user';
import Users from '../api/users/users';
import MainPageContainer from '../components/MainPageContainer';

export const UserPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [errorMsgs, setErrorMsgs] = useState([] as string[]);
  const [user, setUser] = useState(null as User | null);

  if (!params.id) {
    navigate('/');
  }

  const initialFormData = {
    firstName: '',
    lastName: '',
    bio: '',
    isActive: false,
    isAdmin: false
  };

  const [formData, setFormData] = useState(initialFormData);

  const loadUser = async () => {
    const userData = await Users.getUser(Number(params?.id));
    setUser(userData);
    setFormData({
      firstName: userData?.firstName ?? '',
      lastName: userData?.lastName ?? '',
      bio: userData?.bio ?? '',
      isActive: userData?.isActive ?? false,
      isAdmin: userData?.isAdmin ?? false
    });
  }

  useEffect(() => {
    loadUser();
  }, []);
  
  return (
    <>
      <MainPageContainer title='User'>
        <Container component="main" maxWidth="sm" sx={{ p: 0 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box component="form" sx={{ mt: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="firstName"
                        focused
                        fullWidth
                        id="firstName"
                        label="First Name"
                        value={formData.firstName}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        focused
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        value={formData.lastName}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        id="bio"
                        label="Bio"
                        name="bio"
                        focused
                        multiline
                        minRows={2}
                        value={formData.bio}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        focused
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={user?.email ?? '-'}
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        focused
                        fullWidth
                        name="lastLogin"
                        label="Last login"
                        type="text"
                        id="lastLogin"
                        InputProps={{
                          readOnly: true,
                        }}
                        value={user?.lastLogin ? new Date(user.lastLogin)?.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long' }) : '-'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        focused
                        fullWidth
                        name="createdAt"
                        label="Created at"
                        type="text"
                        id="createdAt"
                        InputProps={{
                          readOnly: true,
                        }}
                        value={user?.createdAt ? new Date(user.createdAt)?.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long' }) : '-'}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        focused
                        fullWidth
                        name="updatedAt"
                        label="Updated at"
                        type="text"
                        id="updatedAt"
                        InputProps={{
                          readOnly: true,
                        }}
                        value={user?.updatedAt ? new Date(user.updatedAt)?.toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'long' }) : '-'}
                      />
                    </Grid>
                  </Grid>
                  {errorMsgs?.length ?
                    <Stack sx={{ width: "100%", mt: 2 }} spacing={2}>
                      {errorMsgs.map((errorMsg, i) => (<Alert key={i} severity="error"><span className='error-message'>{errorMsg}</span></Alert>))}
                    </Stack>
                    : ''}
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Button
                        type="button"
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 3 }}
                        onClick={() => navigate(-1)}
                      >
                        Back
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </MainPageContainer>
    </>
  );
};
