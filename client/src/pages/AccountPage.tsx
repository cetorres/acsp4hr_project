import { VisibilityOff, Visibility } from "@mui/icons-material";
import { Alert, Box, Button, Card, CardContent, Container, Grid, IconButton, InputAdornment, Stack, TextField, Typography } from "@mui/material"
import { useEffect, useState } from "react";
import Auth from "../api/auth/auth";
import MainPageContainer from "../components/MainPageContainer"
import { useAuth } from "../contexts/AuthContext";

export const AccountPage = () => {
  const { authState, authLoadedMe } = useAuth();
  const [errorMsgs, setErrorMsgs] = useState([] as string[]);
  const [errorMsgsPassword, setErrorMsgsPassword] = useState([] as string[]);
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
  });

  const [formDataPassword, setFormDataPassword] = useState({
    oldPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    setFormData({
      firstName: authState.user?.firstName ?? '',
      lastName: authState.user?.lastName ?? '',
      bio: authState.user?.bio ?? '',
    })
  }, [authState]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const [result, message] = await Auth.updateMe(formData);
    
    if (result) {
      setErrorMsgs([]);
      setSuccessMsg('Saved successfully.');
      const user = {
        ...authState.user!,
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      }
      authLoadedMe(user);
    }
    else {
      // Show error
      setErrorMsgs([message]);
    }
  };

  const handleSubmitPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const [result, message] = await Auth.changePassword(formDataPassword);
    
    if (result) {
      setErrorMsgsPassword([]);
      setPasswordSuccessMsg('Password changed.');
      setFormDataPassword({
        oldPassword: '',
        newPassword: '',
      })
    }
    else {
      // Show error
      if (message?.toString().toLowerCase().includes('forbidden')) setErrorMsgsPassword(['Wrong password.'])
      else setErrorMsgsPassword([message]);
    }
  };

  const handleClickShowPassword = (which: 'old' | 'new') => {
    if (which == 'old') setShowOldPassword(!showOldPassword);
    if (which == 'new') setShowNewPassword(!showNewPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  
  return (
    <MainPageContainer title='My account'>
      <Grid container spacing={{ xs: 2, sm: 0 }} direction="row" justifyContent="center" alignItems="flex-start">
        <Grid item xs={12} sm='auto'>
          <Container component="main" maxWidth="sm" sx={{ p: 0 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6">
                    Profile information
                  </Typography>
                  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="firstName"
                          required
                          fullWidth
                          variant="standard"
                          id="firstName"
                          label="First Name"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.currentTarget.value })}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="lastName"
                          variant="standard"
                          label="Last Name"
                          name="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.currentTarget.value })}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          required
                          type='text'
                          id="email"
                          variant="standard"
                          label="Email"
                          name="email"
                          InputProps={{readOnly: true, disabled: true}}
                          value={authState.user?.email}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          id="bio"
                          variant="standard"
                          label="Bio"
                          name="bio"
                          multiline
                          maxRows={4}
                          inputProps={{maxLength:'200'}}
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.currentTarget.value })}
                        />
                      </Grid>
                    </Grid>
                    {errorMsgs?.length ?
                      <Stack sx={{ width: "100%", mt: 3 }} spacing={2}>
                        {errorMsgs.map((errorMsg, i) => (<Alert key={i} severity="error"><span className='error-message'>{errorMsg}</span></Alert>))}
                      </Stack>
                      : ''}
                    {successMsg?.length ?
                      <Stack sx={{ width: "100%", mt: 3 }} spacing={2}>
                        <Alert severity="success"><span className='error-message'>{successMsg}</span></Alert>
                      </Stack>
                      : ''}
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          sx={{ mt: 3 }}
                        >
                          Save
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Grid>
        <Grid item xs={12} sm='auto'>
          <Container component="main" maxWidth="sm" sx={{ p: 0 }}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h6">
                    Change Password
                  </Typography>
                  <Box component="form" onSubmit={handleSubmitPassword} sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="password"
                          required
                          fullWidth
                          variant="standard"
                          id="password"
                          type={showOldPassword ? 'text' : 'password'}
                          label="Current Password"
                          value={formDataPassword.oldPassword}
                          onChange={(e) => setFormDataPassword({ ...formDataPassword, oldPassword: e.currentTarget.value })}
                          InputProps={{
                            endAdornment:
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => handleClickShowPassword('old')}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {showOldPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          name="newPassword"
                          required
                          fullWidth
                          variant="standard"
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          label="New Password"
                          value={formDataPassword.newPassword}
                          onChange={(e) => setFormDataPassword({ ...formDataPassword, newPassword: e.currentTarget.value })}
                          InputProps={{
                            endAdornment:
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => handleClickShowPassword('new')}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          }}
                        />
                      </Grid>
                    </Grid>
                    {errorMsgsPassword?.length ?
                      <Stack sx={{ width: "100%", mt: 3 }} spacing={2}>
                        {errorMsgsPassword.map((errorMsg, i) => (<Alert key={i} severity="error"><span className='error-message'>{errorMsg}</span></Alert>))}
                      </Stack>
                      : ''}
                    {passwordSuccessMsg?.length ?
                      <Stack sx={{ width: "100%", mt: 3 }} spacing={2}>
                        <Alert severity="success"><span className='error-message'>{passwordSuccessMsg}</span></Alert>
                      </Stack>
                      : ''}
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          fullWidth
                          color="warning"
                          variant="contained"
                          sx={{ mt: 3 }}
                        >
                          Change
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Grid>
      </Grid>
    </MainPageContainer>
  );
}
