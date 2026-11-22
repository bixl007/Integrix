import cors from 'cors';
import express from 'express';
import { PORT, WEB_URL } from './config';
import { errorHandler } from './middleware/error';
import { actionRouter } from './routes/action';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { triggerRouter } from './routes/trigger';
import { userRouter } from './routes/user';
import { zapRouter } from './routes/zap';

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
// Credentialed CORS so the web app can send the session cookie.
app.use(cors({ origin: WEB_URL, credentials: true }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/zap', zapRouter);
app.use('/api/v1/trigger', triggerRouter);
app.use('/api/v1/action', actionRouter);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
