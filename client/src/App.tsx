import { Route, Routes } from 'react-router';
import { LandingPage } from './routes/LandingPage';
import { JoinPage } from './routes/JoinPage';
import { HostGamePage } from './routes/HostGamePage';
import { PlayPage } from './routes/PlayPage';
import { ClaimPage } from './routes/ClaimPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { TopBar } from './components/shared/TopBar';

export function App() {
  return (
    <div className="min-h-screen">
      <TopBar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/join/:code?" element={<JoinPage />} />
        <Route path="/host/:gameId" element={<HostGamePage />} />
        <Route path="/play/:gameId" element={<PlayPage />} />
        <Route path="/claim/:gameId/:playerId/:sessionToken" element={<ClaimPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}
