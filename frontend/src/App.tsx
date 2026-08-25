import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { AppLayout } from './layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { PublicCampusPage } from './pages/public/PublicCampusPage'
import { TrainingPage } from './pages/training/TrainingPage'
import { DashboardPage } from './pages/DashboardPage'
import { AdmissionsListPage } from './pages/admissions/AdmissionsListPage'
import { AdmissionFormPage } from './pages/admissions/AdmissionFormPage'
import { StudentsListPage } from './pages/students/StudentsListPage'
import { StudentFormPage } from './pages/students/StudentFormPage'
import { AcademicPage } from './pages/academic/AcademicPage'
import { AttendancePage } from './pages/attendance/AttendancePage'
import { HostelPage } from './pages/hostel/HostelPage'
import { FeesPage } from './pages/fees/FeesPage'
import { LibraryPage } from './pages/library/LibraryPage'
import { TransportPage } from './pages/transport/TransportPage'
import { ExamsPage } from './pages/exams/ExamsPage'
import { CertificatesPage } from './pages/certificates/CertificatesPage'
import { HRPage } from './pages/hr/HRPage'
import { SiteContentPage } from './pages/settings/SiteContentPage'
import { DemoDataPage } from './pages/settings/DemoDataPage'
import { UsersPage } from './pages/settings/UsersPage'
import { RolesPage } from './pages/settings/RolesPage'
import { ImportDataPage } from './pages/settings/ImportDataPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicCampusPage />} />
        <Route path="/about" element={<Navigate to="/" replace />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admissions" element={<AdmissionsListPage />} />
          <Route path="/admissions/new" element={<AdmissionFormPage />} />
          <Route path="/admissions/:id/edit" element={<AdmissionFormPage />} />
          <Route path="/students" element={<StudentsListPage />} />
          <Route path="/students/new" element={<StudentFormPage />} />
          <Route path="/students/:id/edit" element={<StudentFormPage />} />
          <Route path="/academic" element={<AcademicPage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/hostel" element={<HostelPage />} />
          <Route path="/fees" element={<FeesPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/transport" element={<TransportPage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/certificates" element={<CertificatesPage />} />
          <Route path="/hr" element={<HRPage />} />
          <Route path="/settings/site-content" element={<SiteContentPage />} />
          <Route path="/settings/demo-data" element={<DemoDataPage />} />
          <Route path="/settings/users" element={<UsersPage />} />
          <Route path="/settings/roles" element={<RolesPage />} />
          <Route path="/settings/import" element={<ImportDataPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
