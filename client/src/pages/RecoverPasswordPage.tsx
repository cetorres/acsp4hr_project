import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Copyright, SignInTop } from '../components/Common';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Alert, Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Auth from '../api/auth/auth';

export default function RecoverPasswordPage() {
  const [errorMsgs, setErrorMsgs] = useState([] as string[]);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const email = data.get('email')?.toString() ?? '';
    const verificationCode = data.get('verificationCode')?.toString() ?? '';
    const password = data.get('password')?.toString() ?? '';
    const passwordConfirm = data.get('passwordConfirm')?.toString() ?? '';

    if (password !== passwordConfirm) {
      setErrorMsgs(['Password does not match password confirmation.']);
      return;
    }

    const [result, message] = await Auth.recoverPassword({ email, verificationCode, password });
    
    if (result) {
      setErrorMsgs([]);
      form.reset();

      // Redirect to home
      navigate('/auth/signin');
    }
    else {
      // Show error
      setErrorMsgs([message]);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: (theme) =>
          theme.palette.mode === "dark" ? "background.default" : "grey.50",
        pt: 6,
        height: { sm: '100vh' }
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box sx={{ display: "flex", mb: 4, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <SignInTop />
        </Box>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Stack direction='row' alignItems='center'>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                  <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                  Recover password
                </Typography>
              </Stack>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{mt:2}}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      type='email'
                      autoComplete="email"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="verificationCode"
                      label="Verification Code"
                      name="verificationCode"
                      type='text'
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      name="passwordConfirm"
                      label="Password confirmation"
                      type="password"
                      id="passwordConfirm"
                      autoComplete="new-password"
                    />
                  </Grid>
                </Grid>
                {errorMsgs?.length ?
                  <Stack sx={{ width: "100%", mt: 2 }} spacing={2}>
                    {errorMsgs.map((errorMsg, i) => (<Alert key={i} severity="error"><span className='error-message'>{errorMsg}</span></Alert>))}
                  </Stack>
                  : ''}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Send
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="/auth/signin" variant="body2">
                      Back to Sign in
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/auth/signup" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Copyright sx={{ mt: 5, mb: 4 }} />
      </Container>
    </Box>
  );
}