import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Skills from './pages/Skills';
import Services from './pages/Services';
import Projects from './pages/Projects';
import Education from './pages/Education';
import Experience from './pages/Experience';
import Certificates from './pages/Certificates';
import Gallery from './pages/Gallery';
import Blog from './pages/Blog';
import Testimonials from './pages/Testimonials';
import Messages from './pages/Messages';
import SocialLinks from './pages/SocialLinks';
import Resume from './pages/Resume';
import CvDocuments from './pages/CvDocuments';
import Analytics from './pages/Analytics';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/profile"      element={<Profile />} />
        <Route path="/settings"     element={<Settings />} />
        <Route path="/skills"       element={<Skills />} />
        <Route path="/services"     element={<Services />} />
        <Route path="/projects"     element={<Projects />} />
        <Route path="/education"    element={<Education />} />
        <Route path="/experience"   element={<Experience />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/gallery"      element={<Gallery />} />
        <Route path="/blog"         element={<Blog />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/messages"     element={<Messages />} />
        <Route path="/social-links" element={<SocialLinks />} />
        <Route path="/resume"       element={<Resume />} />
        <Route path="/cv-documents" element={<CvDocuments />} />
        <Route path="/analytics"    element={<Analytics />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
