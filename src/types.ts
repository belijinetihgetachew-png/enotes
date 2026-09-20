export type GradeLevel = 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12';

export type SubjectName =
  | 'Mathematics'
  | 'Physics'
  | 'Biology'
  | 'Chemistry'
  | 'Economics'
  | 'Citizenship'
  | 'HPE'
  | 'Amharic'
  | 'IT'
  | 'English'
  | 'History'
  | 'Geography';

export type MaterialType =
  | 'Notes'
  | 'Worksheets'
  | 'Videos'
  | 'Textbooks'
  | 'Exercises'
  | 'Exam Papers'
  | 'PDFs';

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  grade: GradeLevel;
  profilePhoto?: string;
  points: number;
  referralCode: string;
  referredBy?: string;
  role: 'student' | 'admin';
  savedMaterialIds: string[];
  createdAt: string;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  grade: GradeLevel;
  subject: SubjectName;
  unit: string;
  chapter?: string;
  type: MaterialType;
  thumbnail: string;
  price: number; // 0 = Free, 10 = 10 Birr, etc.
  content?: string; // Rich educational content (hidden on server for locked paid items)
  previewText?: string;
  videoUrl?: string;
  fileDownloadName?: string;
  fileSize?: string;
  createdDate: string;
  isPublished: boolean;
  authorName: string;
  authorId?: string;
  isStudentUpload?: boolean;
  isPurchased?: boolean; // dynamic property for current user
  unlockedWithPoints?: boolean; // dynamic property: unlocked via reward points
  isSaved?: boolean;
}

export interface PaymentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  materialId: string;
  materialTitle: string;
  grade: GradeLevel;
  subject: SubjectName;
  price: number;
  paymentMethod: 'TELEBIRR';
  telebirrNumber: string;
  transactionNumber: string;
  status: PaymentStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface Purchase {
  id: string;
  studentId: string;
  materialId: string;
  materialTitle: string;
  price: number;
  purchasedAt: string;
  paymentRequestId?: string;
  status: 'ACTIVE';
  method?: 'TELEBIRR' | 'POINTS' | 'FREE';
}

export interface PointTransaction {
  id: string;
  studentId: string;
  amount: number; // positive = earned, negative = spent
  type: 'EARNED_REFERRAL' | 'REDEEMED' | 'STUDY_BONUS' | 'ADMIN_ADJUST';
  description: string;
  createdAt: string;
}

export interface ReferralRecord {
  id: string;
  referrerId: string;
  refereeId: string;
  refereeName: string;
  refereePhone: string;
  rewardPoints: number;
  createdAt: string;
}

export interface DownloadRecord {
  id: string;
  studentId: string;
  materialId: string;
  materialTitle: string;
  downloadedAt: string;
}

export interface UploadedMaterialRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  title: string;
  description: string;
  grade: GradeLevel;
  subject: SubjectName;
  unit: string;
  type: MaterialType;
  suggestedPrice: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface AppNotification {
  id: string;
  studentId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'payment' | 'points' | 'approval' | 'system';
  createdAt: string;
  link?: string;
}

export interface AdminSettings {
  telebirrNumber: string;
  telebirrAccountName: string;
  referralBonusPoints: number;
  pointsPerFreeChapter: number;
  contributionRewardPoints?: number;
  supportTelegram: string;
  supportTikTok: string;
  supportPhone: string;
  contactEmail: string;
}
