import React, { useState, useEffect } from 'react';
import {
  StudentProfile,
  Material,
  GradeLevel,
  MaterialType,
  AppNotification,
  AdminSettings,
} from './types.ts';
import { api } from './lib/api.ts';
import { Header } from './components/Header.tsx';
import { BottomNav, TabType } from './components/BottomNav.tsx';
import { HomeDashboard } from './components/HomeDashboard.tsx';
import { CurriculumView } from './components/CurriculumView.tsx';
import { SearchView } from './components/SearchView.tsx';
import { RewardsView } from './components/RewardsView.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { TelebirrPaymentModal } from './components/TelebirrPaymentModal.tsx';
import { NoteReaderModal } from './components/NoteReaderModal.tsx';
import { StudentUploadModal } from './components/StudentUploadModal.tsx';
import { MaterialDetailsModal } from './components/MaterialDetailsModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CommunitySupportModal } from './components/CommunitySupportModal.tsx';

export default function App() {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>('Grade 9');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Core Data
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected filters across views
  const [curriculumCategoryFilter, setCurriculumCategoryFilter] = useState<MaterialType | null>(null);

  // Modals
  const [selectedMaterialForDetails, setSelectedMaterialForDetails] = useState<Material | null>(null);
  const [selectedMaterialForPayment, setSelectedMaterialForPayment] = useState<Material | null>(null);
  const [activeReaderMaterial, setActiveReaderMaterial] = useState<Material | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);

  // Initial load
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    try {
      // 1. Fetch current student (or default demo student-demo-1)
      const currentStudentId = localStorage.getItem('enotes_student_id') || 'student-demo-1';
      const studentData = await api.getProfile(currentStudentId);
      setStudent(studentData);
      setCurrentGrade(studentData.grade);

      // 2. Fetch materials with authorization checks
      const matsData = await api.getMaterials(currentStudentId);
      setMaterials(matsData.materials);

      // 3. Fetch notifications
      const notifsData = await api.getNotifications(currentStudentId);
      setNotifications(notifsData.notifications);

      // 4. Fetch admin settings
      const settingsData = await api.admin.getSettings();
      setSettings(settingsData.settings);
    } catch (err) {
      console.error('Failed to initialize app', err);
    } finally {
      setLoading(false);
    }
  };

  // Reload materials when payments or approvals change
  const reloadData = async () => {
    if (!student) return;
    try {
      const [matsData, notifsData, studentData] = await Promise.all([
        api.getMaterials(student.id),
        api.getNotifications(student.id),
        api.getProfile(student.id),
      ]);
      setMaterials(matsData.materials);
      setNotifications(notifsData.notifications);
      setStudent(studentData);
    } catch (err) {
      console.error('Failed to reload data', err);
    }
  };

  // Handle Material Selection (If Paid & Not Purchased -> Payment Modal; Else -> Open Reader)
  const handleSelectMaterial = (material: Material) => {
    if (material.price > 0 && !material.isPurchased) {
      setSelectedMaterialForPayment(material);
    } else {
      handleOpenReader(material);
    }
  };

  // Open Full Note Reader
  const handleOpenReader = async (material: Material) => {
    if (!student) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Secure backend verification and full text fetch
      const fullNote = await api.getMaterialById(student.id, material.id);
      setActiveReaderMaterial(fullNote.material);
    } catch (err: any) {
      alert(err.message || 'Access restricted. Please complete Telebirr payment first.');
    }
  };

  // Download PDF Handler
  const handleDownloadMaterial = async (material: Material) => {
    if (!student) {
      setShowAuthModal(true);
      return;
    }

    try {
      const res = await api.downloadMaterial(student.id, material.id);
      const blob = new Blob([res.content], { type: 'text/markdown;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${material.title.replace(/\s+/g, '_')}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Download failed');
    }
  };

  // Toggle bookmark / save
  const handleToggleSaveMaterial = async (materialId: string) => {
    if (!student) return;
    try {
      const res = await api.toggleSaveMaterial(student.id, materialId);
      setStudent((prev) => (prev ? { ...prev, savedMaterialIds: res.savedMaterialIds } : prev));
      setMaterials((prev) =>
        prev.map((m) => (m.id === materialId ? { ...m, isSaved: res.isSaved } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications as read
  const handleMarkNotificationsRead = async () => {
    if (!student) return;
    try {
      await api.markNotificationsRead(student.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  // Switch category from quick section
  const handleSelectCategory = (type: MaterialType) => {
    setCurriculumCategoryFilter(type);
    setActiveTab('curriculum');
  };

  // Auth logout
  const handleLogout = () => {
    localStorage.removeItem('enotes_student_id');
    setShowAuthModal(true);
  };

  // Auth login/signup success
  const handleAuthSuccess = (updatedStudent: StudentProfile) => {
    localStorage.setItem('enotes_student_id', updatedStudent.id);
    setStudent(updatedStudent);
    setCurrentGrade(updatedStudent.grade);
    reloadData();
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased flex justify-center selection:bg-blue-500 selection:text-white pb-14 sm:pb-0">
      {/* Mobile Android Container Wrapper */}
      <div className="w-full max-w-2xl bg-white min-h-screen shadow-2xl flex flex-col relative border-x border-slate-200/80">
        {/* Top Header Navigation */}
        <Header
          student={student}
          currentGrade={currentGrade}
          onGradeChange={(grade) => setCurrentGrade(grade)}
          onOpenSearch={() => setActiveTab('search')}
          onOpenContact={() => setShowCommunityModal(true)}
          onOpenProfile={() => setActiveTab('profile')}
          onToggleAdmin={() => setIsAdminMode(!isAdminMode)}
          isAdminMode={isAdminMode}
          notifications={notifications}
          unreadCount={unreadNotificationsCount}
          onMarkNotificationsRead={handleMarkNotificationsRead}
          onLogout={handleLogout}
        />

        {/* Main Content View Switcher */}
        <main className="flex-1 p-3.5 sm:p-5 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs font-bold text-slate-500">Loading Ethiopian Curriculum...</p>
            </div>
          ) : isAdminMode && student?.role === 'admin' ? (
            <AdminDashboard
              adminStudent={student}
              onClose={() => setIsAdminMode(false)}
              onDataChanged={reloadData}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeDashboard
                  student={student}
                  currentGrade={currentGrade}
                  materials={materials}
                  onSelectMaterial={handleSelectMaterial}
                  onOpenMaterial={handleOpenReader}
                  onDownloadMaterial={handleDownloadMaterial}
                  onToggleSaveMaterial={handleToggleSaveMaterial}
                  onViewDetails={(m) => setSelectedMaterialForDetails(m)}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onSelectCategory={handleSelectCategory}
                  onOpenUpload={() => setShowUploadModal(true)}
                />
              )}

              {activeTab === 'curriculum' && (
                <CurriculumView
                  currentGrade={currentGrade}
                  onGradeChange={(grade) => setCurrentGrade(grade)}
                  materials={materials}
                  onSelectMaterial={handleSelectMaterial}
                  onOpenMaterial={handleOpenReader}
                  onDownloadMaterial={handleDownloadMaterial}
                  onToggleSaveMaterial={handleToggleSaveMaterial}
                  onViewDetails={(m) => setSelectedMaterialForDetails(m)}
                  selectedCategoryFilter={curriculumCategoryFilter}
                  onClearCategoryFilter={() => setCurriculumCategoryFilter(null)}
                />
              )}

              {activeTab === 'search' && (
                <SearchView
                  allMaterials={materials}
                  onSelectMaterial={handleSelectMaterial}
                  onOpenMaterial={handleOpenReader}
                  onDownloadMaterial={handleDownloadMaterial}
                  onToggleSaveMaterial={handleToggleSaveMaterial}
                  onViewDetails={(m) => setSelectedMaterialForDetails(m)}
                />
              )}

              {activeTab === 'rewards' && student && (
                <RewardsView
                  student={student}
                  materials={materials}
                  onChapterRedeemed={reloadData}
                  onOpenMaterial={handleOpenReader}
                  onDownloadMaterial={handleDownloadMaterial}
                />
              )}

              {activeTab === 'profile' && student && (
                <ProfileView
                  student={student}
                  materials={materials}
                  onOpenMaterial={handleOpenReader}
                  onDownloadMaterial={handleDownloadMaterial}
                  onProfileUpdated={(up) => setStudent(up)}
                  onLogout={handleLogout}
                  onOpenUpload={() => setShowUploadModal(true)}
                />
              )}
            </>
          )}
        </main>

        {/* Android Bottom Navigation Bar */}
        {!isAdminMode && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={(tab: TabType) => setActiveTab(tab)}
            points={student?.points}
          />
        )}

        {/* ================= MODALS ================= */}
        {/* 0. Material Details Modal with Video & Download (Requirement 6, 11, 12) */}
        {selectedMaterialForDetails && (
          <MaterialDetailsModal
            material={selectedMaterialForDetails}
            student={student}
            onClose={() => setSelectedMaterialForDetails(null)}
            onSelectPayment={(m: Material) => {
              setSelectedMaterialForDetails(null);
              setSelectedMaterialForPayment(m);
            }}
            onOpenNote={(m: Material) => {
              setSelectedMaterialForDetails(null);
              handleOpenReader(m);
            }}
            onDownload={handleDownloadMaterial}
            onToggleSave={handleToggleSaveMaterial}
            isSaved={selectedMaterialForDetails.isSaved}
          />
        )}

        {/* 1. Telebirr Payment Modal (Requirement 8 & 9) */}
        {selectedMaterialForPayment && (
          <TelebirrPaymentModal
            material={selectedMaterialForPayment}
            student={student}
            onClose={() => setSelectedMaterialForPayment(null)}
            onPaymentSubmitted={() => {
              setSelectedMaterialForPayment(null);
              reloadData();
            }}
          />
        )}

        {/* 2. Educational Note Reader & PDF Downloader (Requirement 10, 11, 19) */}
        {activeReaderMaterial && (
          <NoteReaderModal
            material={activeReaderMaterial}
            student={student}
            onClose={() => setActiveReaderMaterial(null)}
            onDownload={handleDownloadMaterial}
            onToggleSave={handleToggleSaveMaterial}
            isSaved={activeReaderMaterial.isSaved}
          />
        )}

        {/* 3. Student Marketplace Upload Modal (Requirement 17) */}
        {showUploadModal && (
          <StudentUploadModal
            student={student}
            onClose={() => setShowUploadModal(false)}
            onSubmitted={() => {
              setShowUploadModal(false);
              reloadData();
            }}
          />
        )}

        {/* 4. Student Authentication Modal (Requirement 2) */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />

        {/* 5. Community & Social Media Modal (Requirement 15) */}
        <CommunitySupportModal
          isOpen={showCommunityModal}
          onClose={() => setShowCommunityModal(false)}
          settings={settings}
        />
      </div>
    </div>
  );
}
