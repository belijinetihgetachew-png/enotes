import {
  StudentProfile,
  Material,
  PaymentRequest,
  Purchase,
  PointTransaction,
  ReferralRecord,
  UploadedMaterialRequest,
  AppNotification,
  AdminSettings,
} from '../types.ts';

const getHeaders = (studentId?: string): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (studentId) {
    headers['x-student-id'] = studentId;
  }
  return headers;
};

export const api = {
  // Auth
  async login(credentials: string | { email: string; password?: string }): Promise<{ student: StudentProfile }> {
    const email = typeof credentials === 'string' ? credentials : credentials.email;
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login');
    }
    return res.json();
  },

  async signup(data: {
    fullName: string;
    email: string;
    phone: string;
    grade: string;
    password?: string;
    referralCode?: string;
    referredBy?: string;
  }): Promise<{ student: StudentProfile }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        ...data,
        referralCode: data.referralCode || data.referredBy,
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sign up');
    }
    return res.json();
  },

  async getProfile(studentId: string): Promise<StudentProfile> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(studentId),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user profile');
    }
    const data = await res.json();
    return data.student;
  },

  async updateProfile(
    studentId: string,
    updates: Partial<StudentProfile>
  ): Promise<{ student: StudentProfile }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: getHeaders(studentId),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to process request');
    }
    return res.json();
  },

  // Materials
  async getMaterials(
    studentId?: string,
    filters?: { grade?: string; subject?: string; type?: string; search?: string }
  ): Promise<{ materials: Material[] }> {
    const params = new URLSearchParams();
    if (filters?.grade) params.append('grade', filters.grade);
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`/api/materials?${params.toString()}`, {
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },

  async getMaterialById(studentId: string, id: string): Promise<{ material: Material }> {
    const res = await fetch(`/api/materials/${id}`, {
      headers: getHeaders(studentId),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to fetch material');
    }
    return res.json();
  },

  async downloadMaterial(studentId: string, materialId: string): Promise<{ title: string; content: string }> {
    const res = await fetch(`/api/materials/${materialId}/download`, {
      headers: getHeaders(studentId),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Download failed' }));
      throw new Error(err.error || 'Failed to download material');
    }
    const content = await res.text();
    return {
      title: `eNotes_Material_${materialId}`,
      content,
    };
  },

  async toggleSaveMaterial(
    studentId: string,
    id: string
  ): Promise<{ savedMaterialIds: string[]; isSaved: boolean }> {
    const res = await fetch(`/api/materials/${id}/save`, {
      method: 'POST',
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Failed to toggle save');
    const data = await res.json();
    const isSaved = (data.savedMaterialIds || []).includes(id);
    return { savedMaterialIds: data.savedMaterialIds, isSaved };
  },

  // Telebirr Payments
  async submitPayment(
    studentId: string,
    data: {
      materialId: string;
      fullName: string;
      phone: string;
      transactionNumber: string;
    }
  ): Promise<{ success: boolean; paymentRequest: PaymentRequest; message: string }> {
    const res = await fetch('/api/payments/submit', {
      method: 'POST',
      headers: getHeaders(studentId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit payment');
    }
    return res.json();
  },

  async getMyPayments(
    studentId: string
  ): Promise<{ payments: PaymentRequest[]; purchases: Purchase[] }> {
    const res = await fetch('/api/payments/my', {
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch payment history');
    return res.json();
  },

  async getMyDownloads(studentId: string): Promise<{ downloads: any[] }> {
    const res = await fetch('/api/downloads/my', {
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch download history');
    return res.json();
  },

  // Points & Rewards
  async getMyPoints(studentId: string): Promise<{
    currentPoints: number;
    transactions: PointTransaction[];
    pointsPerFreeChapter: number;
  }> {
    const res = await fetch('/api/points/my', {
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch points');
    return res.json();
  },

  async redeemChapter(
    studentId: string,
    materialId: string
  ): Promise<{ success: boolean; message: string; remainingPoints: number }> {
    const res = await fetch('/api/points/redeem', {
      method: 'POST',
      headers: getHeaders(studentId),
      body: JSON.stringify({ materialId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to redeem chapter');
    }
    return res.json();
  },

  // Referrals
  async getMyReferrals(studentId: string): Promise<{
    referralCode: string;
    referralLink: string;
    referrals: ReferralRecord[];
    totalEarned: number;
    rewardPerReferral: number;
  }> {
    const res = await fetch('/api/referrals/my', {
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch referrals');
    return res.json();
  },

  // Student Upload
  async submitUpload(
    studentId: string,
    data: {
      title: string;
      description?: string;
      grade: string;
      subject: string;
      unit: string;
      type?: string;
      suggestedPrice: number;
      content: string;
    }
  ): Promise<{ success: boolean; message: string; upload: UploadedMaterialRequest }> {
    const res = await fetch('/api/materials/student-upload', {
      method: 'POST',
      headers: getHeaders(studentId),
      body: JSON.stringify({
        ...data,
        type: data.type || 'Notes',
      }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit study material');
    }
    return res.json();
  },

  async submitStudentMaterial(
    studentId: string,
    data: {
      title: string;
      description?: string;
      grade: string;
      subject: string;
      unit: string;
      type: string;
      suggestedPrice: number;
      content: string;
    }
  ) {
    return this.submitUpload(studentId, data);
  },

  // Notifications
  async getNotifications(
    studentId: string
  ): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
    const res = await fetch('/api/notifications', {
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markAllNotificationsRead(studentId: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: getHeaders(studentId),
    });
    return res.json();
  },

  async markNotificationsRead(studentId: string): Promise<{ success: boolean }> {
    return this.markAllNotificationsRead(studentId);
  },

  // Global Search
  async search(query: string, studentId?: string): Promise<{ results: Material[] }> {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders(studentId),
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },

  // Admin APIs
  admin: {
    async getOverview(adminId: string) {
      const res = await fetch('/api/admin/overview', {
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async getPayments(adminId: string): Promise<{ payments: PaymentRequest[] }> {
      const res = await fetch('/api/admin/payments', {
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async approvePayment(adminId: string, paymentId: string) {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: getHeaders(adminId),
      });
      if (!res.ok) throw new Error('Failed to approve payment');
      return res.json();
    },

    async rejectPayment(adminId: string, paymentId: string, reason?: string) {
      const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
        method: 'POST',
        headers: getHeaders(adminId),
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error('Failed to reject payment');
      return res.json();
    },

    async getMaterials(adminId: string): Promise<{ materials: Material[] }> {
      const res = await fetch('/api/admin/materials', {
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async addMaterial(adminId: string, data: Partial<Material>) {
      const res = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: getHeaders(adminId),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to add material');
      return res.json();
    },

    async updateMaterialPrice(adminId: string, materialId: string, price: number) {
      const res = await fetch(`/api/admin/materials/${materialId}/price`, {
        method: 'PUT',
        headers: getHeaders(adminId),
        body: JSON.stringify({ price }),
      });
      if (!res.ok) throw new Error('Failed to update price');
      return res.json();
    },

    async togglePublish(adminId: string, materialId: string) {
      const res = await fetch(`/api/admin/materials/${materialId}/toggle-publish`, {
        method: 'PUT',
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async deleteMaterial(adminId: string, materialId: string) {
      const res = await fetch(`/api/admin/materials/${materialId}`, {
        method: 'DELETE',
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async getUploads(adminId: string): Promise<{ uploads: UploadedMaterialRequest[] }> {
      const res = await fetch('/api/admin/uploaded-materials', {
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async approveUpload(adminId: string, uploadId: string) {
      const res = await fetch(`/api/admin/uploaded-materials/${uploadId}/approve`, {
        method: 'POST',
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async rejectUpload(adminId: string, uploadId: string) {
      const res = await fetch(`/api/admin/uploaded-materials/${uploadId}/reject`, {
        method: 'POST',
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async getSettings(): Promise<{ settings: AdminSettings }> {
      const res = await fetch('/api/admin/settings');
      return res.json();
    },

    async updateSettings(adminId: string, settings: Partial<AdminSettings>) {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getHeaders(adminId),
        body: JSON.stringify(settings),
      });
      return res.json();
    },

    async getStudents(adminId: string): Promise<{ students: StudentProfile[] }> {
      const res = await fetch('/api/admin/students', {
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async getPoints(adminId: string): Promise<{ transactions: PointTransaction[]; totalCirculating: number }> {
      const res = await fetch('/api/admin/points', {
        headers: getHeaders(adminId),
      });
      return res.json();
    },

    async adjustPoints(adminId: string, studentId: string, amount: number, description: string) {
      const res = await fetch('/api/admin/points/adjust', {
        method: 'POST',
        headers: getHeaders(adminId),
        body: JSON.stringify({ studentId, amount, description }),
      });
      if (!res.ok) throw new Error('Failed to adjust points');
      return res.json();
    },

    async getReferrals(adminId: string): Promise<{ referrals: ReferralRecord[] }> {
      const res = await fetch('/api/admin/referrals', {
        headers: getHeaders(adminId),
      });
      return res.json();
    },
  },
};
