import { render } from 'solid-js/web';
import { Router, Route } from '@solidjs/router';
import { AuthProvider } from './stores/auth';
import { UIProvider } from './stores/ui';
import Layout from './components/Layout';
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Forum from './pages/Forum';
import Employer from './pages/Employer';
import Candidate from './pages/Candidate';
import Recursos from './pages/Recursos';
import Admin from './pages/Admin';
import './index.css';

function AppRoot(props) {
  return (
    <AuthProvider>
      <UIProvider>
        <Layout>{props.children}</Layout>
      </UIProvider>
    </AuthProvider>
  );
}

render(
  () => (
    <Router root={AppRoot}>
      <Route path="/" component={Home} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/jobs/:id" component={JobDetail} />
      <Route path="/forum" component={Forum} />
      <Route path="/employer" component={Employer} />
      <Route path="/candidate" component={Candidate} />
      <Route path="/recursos" component={Recursos} />
      <Route path="/admin" component={Admin} />
    </Router>
  ),
  document.getElementById('root')
);
