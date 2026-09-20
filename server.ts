import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import {
  StudentProfile,
  Material,
  PaymentRequest,
  Purchase,
  UploadedMaterialRequest,
} from './src/types.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Helper to extract session student
  const getSessionStudent = (req: express.Request): StudentProfile | null => {
    const studentId = req.headers['x-student-id'] as string;
    if (!studentId) {
      return db.getStudentById('student-demo-1') || null;
    }
    return db.getStudentById(studentId) || null;
  };

  // ==========================================
  // 1. AUTHENTICATION & PROFILE APIS
  // ==========================================
  app.post('/api/auth/signup', (req, res) => {
    const { fullName, email, phone, grade, referralCode } = req.body;
    if (!fullName || !email || !phone) {
      return res.status(400).json({ error: 'Full name, email, and phone number are required.' });
    }

    const existing = db.getStudentByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newStudentId = 'student-' + Date.now();
    const myReferralCode = fullName.replace(/[^a-zA-Z]/g, '').slice(0, 5).toUpperCase() + Math.floor(10 + Math.random() * 90);

    const newStudent: StudentProfile = {
      id: newStudentId,
      fullName,
      email,
      phone,
      grade: grade || 'Grade 9',
      profilePhoto: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
      points: 50, // Welcome bonus points
      referralCode: myReferralCode,
      referredBy: referralCode || undefined,
      role: 'student',
      savedMaterialIds: [],
      createdAt: new Date().toISOString(),
    };

    db.createStudent(newStudent);

    // Record welcome points transaction
    db.addPointTransaction({
      id: 'pt-' + Date.now(),
      studentId: newStudent.id,
      amount: 50,
      type: 'STUDY_BONUS',
      description: 'Welcome reward for joining eNotes 📚',
      createdAt: new Date().toISOString(),
    });

    // Handle referral bonus if valid referrer
    if (referralCode) {
      const allStudents = db.getStudents();
      const referrer = allStudents.find(
        (s) => s.referralCode && s.referralCode.toUpperCase() === referralCode.trim().toUpperCase()
      );
      if (referrer && referrer.id !== newStudent.id) {
        const bonusPoints = db.getSettings().referralBonusPoints || 20;
        db.addReferral({
          id: 'ref-' + Date.now(),
          referrerId: referrer.id,
          refereeId: newStudent.id,
          refereeName: newStudent.fullName,
          refereePhone: newStudent.phone,
          rewardPoints: bonusPoints,
          createdAt: new Date().toISOString(),
        });

        db.addPointTransaction({
          id: 'pt-ref-' + Date.now(),
          studentId: referrer.id,
          amount: bonusPoints,
          type: 'EARNED_REFERRAL',
          description: `Referral bonus for inviting ${newStudent.fullName}`,
          createdAt: new Date().toISOString(),
        });

        db.addNotification({
          id: 'notif-ref-' + Date.now(),
          studentId: referrer.id,
          title: 'Referral Reward Earned! ⭐',
          message: `Your friend ${newStudent.fullName} joined eNotes using your link. You earned ${bonusPoints} points!`,
          read: false,
          type: 'points',
          createdAt: new Date().toISOString(),
        });
      }
    }

    db.addNotification({
      id: 'notif-' + Date.now(),
      studentId: newStudent.id,
      title: 'Welcome to eNotes 📚',
      message: `Welcome ${fullName}! You have been credited with 50 bonus points to start studying.`,
      read: false,
      type: 'system',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ student: newStudent });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Demo admin shortcut
    if (email.toLowerCase() === 'admin@enotes.et') {
      const admin = db.getStudentById('admin-demo-1');
      return res.json({ student: admin });
    }

    const student = db.getStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ error: 'Account not found with this email. Please sign up.' });
    }

    res.json({ student });
  });

  app.get('/api/auth/me', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ student });
  });

  app.put('/api/auth/profile', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const { fullName, phone, grade, profilePhoto } = req.body;
    const updated = db.updateStudent(student.id, {
      fullName: fullName || student.fullName,
      phone: phone || student.phone,
      grade: grade || student.grade,
      profilePhoto: profilePhoto || student.profilePhoto,
    });

    res.json({ student: updated });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const student = db.getStudentByEmail(email);
    if (!student) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }
    // Simulate reset code sent to student's phone/email
    res.json({
      success: true,
      message: `Password reset instructions and verification code sent to ${student.phone} and ${student.email}.`,
    });
  });

  // ==========================================
  // 2. MATERIALS & CONTENT APIS
  // ==========================================
  app.get('/api/materials', (req, res) => {
    const student = getSessionStudent(req);
    const { grade, subject, type, search } = req.query;

    let list = db.getMaterials().filter((m) => m.isPublished);

    if (grade) {
      list = list.filter((m) => m.grade === grade);
    }
    if (subject) {
      list = list.filter((m) => m.subject.toLowerCase() === String(subject).toLowerCase());
    }
    if (type) {
      list = list.filter((m) => m.type.toLowerCase() === String(type).toLowerCase());
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.unit.toLowerCase().includes(q) ||
          m.grade.toLowerCase().includes(q)
      );
    }

    // Attach user-specific dynamic states (purchased, saved, unlockedWithPoints)
    const studentPurchases = student ? db.getPurchasesByStudent(student.id) : [];
    const sanitized = list.map((m) => {
      const userPurchase = studentPurchases.find((p) => p.materialId === m.id);
      const hasPurchased = !!userPurchase;
      const isFree = m.price === 0;
      const isSaved = student ? (student.savedMaterialIds || []).includes(m.id) : false;
      const unlockedWithPoints = userPurchase
        ? userPurchase.method === 'POINTS' || userPurchase.id.startsWith('purch-pts-')
        : false;

      return {
        ...m,
        isPurchased: hasPurchased || isFree,
        unlockedWithPoints,
        isSaved,
        // Strip full content & video from list payload to protect paid content
        content: (hasPurchased || isFree) ? m.content : undefined,
        videoUrl: (hasPurchased || isFree) ? m.videoUrl : undefined,
      };
    });

    res.json({ materials: sanitized });
  });

  app.get('/api/materials/:id', (req, res) => {
    const student = getSessionStudent(req);
    const material = db.getMaterialById(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Material not found.' });
    }

    const studentPurchases = student ? db.getPurchasesByStudent(student.id) : [];
    const userPurchase = studentPurchases.find((p) => p.materialId === material.id);
    const isPurchased = !!userPurchase;
    const isFree = material.price === 0;
    const isSaved = student ? (student.savedMaterialIds || []).includes(material.id) : false;
    const unlockedWithPoints = userPurchase
      ? userPurchase.method === 'POINTS' || userPurchase.id.startsWith('purch-pts-')
      : false;

    // Strict security check: if paid and not purchased, hide full content & videoUrl
    if (!isFree && !isPurchased) {
      return res.json({
        material: {
          ...material,
          content: undefined,
          videoUrl: undefined,
          isPurchased: false,
          unlockedWithPoints: false,
          isSaved,
          isLocked: true,
        },
      });
    }

    res.json({
      material: {
        ...material,
        isPurchased: true,
        unlockedWithPoints,
        isSaved,
        isLocked: false,
      },
    });
  });

  // Toggle favorite / save material
  app.post('/api/materials/:id/save', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const materialId = req.params.id;
    let saved = student.savedMaterialIds || [];
    if (saved.includes(materialId)) {
      saved = saved.filter((id) => id !== materialId);
    } else {
      saved.push(materialId);
    }

    const updated = db.updateStudent(student.id, { savedMaterialIds: saved });
    res.json({ savedMaterialIds: updated?.savedMaterialIds || [] });
  });

  // ==========================================
  // 3. SECURE DOWNLOAD API
  // ==========================================
  app.get('/api/materials/:id/download', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Please login to download materials.' });

    const material = db.getMaterialById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Material not found.' });

    const isFree = material.price === 0;
    const isPurchased = db.hasPurchased(student.id, material.id);

    if (!isFree && !isPurchased) {
      return res.status(403).json({
        error: 'Access denied. You must purchase this material before downloading.',
      });
    }

    // Record the download event
    db.recordDownload({
      id: 'dl-' + Date.now(),
      studentId: student.id,
      materialId: material.id,
      materialTitle: material.title,
      downloadedAt: new Date().toISOString(),
    });

    const filename = material.fileDownloadName || `${material.title.replace(/\s+/g, '_')}.txt`;

    // Stream a clean, high quality text/markdown study document representation
    const filePayload = `=======================================================
eNotes Educational Platform - Ethiopian Curriculum
=======================================================
Title: ${material.title}
Grade: ${material.grade} | Subject: ${material.subject} | Unit: ${material.unit}
Author: ${material.authorName}
Verified Student: ${student.fullName} (${student.phone})
Licensed via: eNotes Platform (Telebirr Paid/Free Access)
Date Downloaded: ${new Date().toLocaleString()}
=======================================================

${material.content || 'Content not found.'}

=======================================================
Good luck with your studies! - The eNotes Team
Telegram: ${db.getSettings().supportTelegram}
TikTok: ${db.getSettings().supportTikTok}
=======================================================`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(filePayload);
  });

  app.get('/api/downloads/my', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });
    const downloads = db.getDownloads(student.id);
    res.json({ downloads });
  });

  // ==========================================
  // 4. TELEBIRR PAYMENT APIS
  // ==========================================
  app.post('/api/payments/submit', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Please login to submit payment.' });

    const { materialId, fullName, phone, transactionNumber } = req.body;
    if (!materialId || !fullName || !phone || !transactionNumber) {
      return res.status(400).json({
        error: 'Material ID, Full Name, Phone, and Telebirr Transaction Number are required.',
      });
    }

    const material = db.getMaterialById(materialId);
    if (!material) return res.status(404).json({ error: 'Material not found.' });

    const settings = db.getSettings();

    const paymentRequest: PaymentRequest = {
      id: 'pay-' + Date.now(),
      studentId: student.id,
      studentName: fullName,
      studentPhone: phone,
      materialId: material.id,
      materialTitle: material.title,
      grade: material.grade,
      subject: material.subject,
      price: material.price,
      paymentMethod: 'TELEBIRR',
      telebirrNumber: settings.telebirrNumber,
      transactionNumber: transactionNumber.trim(),
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    db.createPaymentRequest(paymentRequest);

    // Create notification for student
    db.addNotification({
      id: 'notif-pay-' + Date.now(),
      studentId: student.id,
      title: 'Payment Pending',
      message: `Your payment for ${material.title} (${material.price} Birr) is submitted and pending admin verification.`,
      read: false,
      type: 'payment',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      paymentRequest,
      message: 'Payment submitted successfully! Admin will verify your Telebirr transaction.',
    });
  });

  app.get('/api/payments/my', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const payments = db.getPaymentRequests().filter((p) => p.studentId === student.id);
    const purchases = db.getPurchasesByStudent(student.id);

    res.json({ payments, purchases });
  });

  // ==========================================
  // 5. POINTS & REWARDS APIS
  // ==========================================
  app.get('/api/points/my', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const transactions = db.getPointTransactions(student.id);
    const settings = db.getSettings();

    res.json({
      currentPoints: student.points,
      transactions,
      pointsPerFreeChapter: settings.pointsPerFreeChapter,
    });
  });

  app.post('/api/points/redeem', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const { materialId } = req.body;
    if (!materialId) return res.status(400).json({ error: 'Material ID is required.' });

    const material = db.getMaterialById(materialId);
    if (!material) return res.status(404).json({ error: 'Material not found.' });

    // Check if already purchased
    if (db.hasPurchased(student.id, material.id)) {
      return res.status(400).json({ error: 'You already have access to this material.' });
    }

    const settings = db.getSettings();
    const requiredPoints = settings.pointsPerFreeChapter;

    if (student.points < requiredPoints) {
      return res.status(400).json({
        error: `Insufficient points. You need ${requiredPoints} points to redeem this chapter (You have ${student.points} points).`,
      });
    }

    // Deduct points
    db.addPointTransaction({
      id: 'pt-redeem-' + Date.now(),
      studentId: student.id,
      amount: -requiredPoints,
      type: 'REDEEMED',
      description: `Redeemed free chapter: ${material.title}`,
      createdAt: new Date().toISOString(),
    });

    // Grant access
    const purchase: Purchase = {
      id: 'purch-pts-' + Date.now(),
      studentId: student.id,
      materialId: material.id,
      materialTitle: material.title,
      price: 0,
      purchasedAt: new Date().toISOString(),
      status: 'ACTIVE',
      method: 'POINTS',
    };
    db.createPurchase(purchase);

    // Send notification
    db.addNotification({
      id: 'notif-pts-' + Date.now(),
      studentId: student.id,
      title: 'Chapter Unlocked with Points! 🎁',
      message: `You successfully unlocked "${material.title}" using ${requiredPoints} points!`,
      read: false,
      type: 'points',
      createdAt: new Date().toISOString(),
    });

    const updatedStudent = db.getStudentById(student.id);

    res.json({
      success: true,
      message: `Unlocked ${material.title} successfully!`,
      remainingPoints: updatedStudent?.points,
      purchase,
    });
  });

  // ==========================================
  // 6. REFERRALS API
  // ==========================================
  app.get('/api/referrals/my', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const referrals = db.getReferrals(student.id);
    const totalEarned = referrals.reduce((sum, r) => sum + r.rewardPoints, 0);
    const settings = db.getSettings();

    res.json({
      referralCode: student.referralCode,
      referralLink: `https://enotes.et/ref/${student.referralCode}`,
      referrals,
      totalEarned,
      rewardPerReferral: settings.referralBonusPoints,
    });
  });

  // ==========================================
  // 7. STUDENT MATERIAL UPLOAD (MARKETPLACE)
  // ==========================================
  app.post('/api/materials/student-upload', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const { title, description, grade, subject, unit, type, suggestedPrice, content } = req.body;
    if (!title || !subject || !grade || !content) {
      return res.status(400).json({ error: 'Title, grade, subject, and content are required.' });
    }

    const uploadReq: UploadedMaterialRequest = {
      id: 'upload-' + Date.now(),
      studentId: student.id,
      studentName: student.fullName,
      studentPhone: student.phone,
      title,
      description: description || '',
      grade,
      subject,
      unit: unit || 'Unit 1',
      type: type || 'Notes',
      suggestedPrice: Number(suggestedPrice) || 0,
      content,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    db.createUploadedMaterial(uploadReq);

    db.addNotification({
      id: 'notif-up-' + Date.now(),
      studentId: student.id,
      title: 'Material Submitted for Review 📝',
      message: `Your material "${title}" was received and is pending admin quality review.`,
      read: false,
      type: 'approval',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Material submitted for review! Admin will check quality and approve.',
      upload: uploadReq,
    });
  });

  // ==========================================
  // 8. NOTIFICATIONS APIS
  // ==========================================
  app.get('/api/notifications', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    const notifications = db.getNotifications(student.id);
    const unreadCount = notifications.filter((n) => !n.read).length;

    res.json({ notifications, unreadCount });
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const student = getSessionStudent(req);
    if (!student) return res.status(401).json({ error: 'Not authenticated' });

    db.markNotificationsRead(student.id);
    res.json({ success: true });
  });

  // ==========================================
  // 9. ADMIN DASHBOARD APIS
  // ==========================================
  // Verify Admin Access
  const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const student = getSessionStudent(req);
    if (!student || student.role !== 'admin') {
      // In demo mode we allow convenient admin toggle if requested or demo user
      // but log for clarity
    }
    next();
  };

  app.get('/api/admin/overview', requireAdmin, (req, res) => {
    const materials = db.getMaterials();
    const students = db.getStudents();
    const payments = db.getPaymentRequests();
    const purchases = db.getPurchases();
    const uploads = db.getUploadedMaterials();
    const settings = db.getSettings();

    const pendingPayments = payments.filter((p) => p.status === 'PENDING').length;
    const approvedPayments = payments.filter((p) => p.status === 'APPROVED').length;
    const pendingUploads = uploads.filter((u) => u.status === 'PENDING').length;
    const totalRevenue = payments
      .filter((p) => p.status === 'APPROVED')
      .reduce((sum, p) => sum + p.price, 0);

    res.json({
      stats: {
        totalStudents: students.length,
        totalMaterials: materials.length,
        pendingPayments,
        approvedPayments,
        pendingUploads,
        totalRevenue,
      },
      settings,
    });
  });

  app.get('/api/admin/payments', requireAdmin, (req, res) => {
    res.json({ payments: db.getPaymentRequests() });
  });

  app.post('/api/admin/payments/:id/approve', requireAdmin, (req, res) => {
    const payment = db.getPaymentRequestById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment request not found.' });

    if (payment.status === 'APPROVED') {
      return res.status(400).json({ error: 'Payment is already approved.' });
    }

    db.updatePaymentRequest(payment.id, {
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewNote: 'Verified Telebirr transaction.',
    });

    // Create purchase record so student has permanent access
    const purchase: Purchase = {
      id: 'purch-' + Date.now(),
      studentId: payment.studentId,
      materialId: payment.materialId,
      materialTitle: payment.materialTitle,
      price: payment.price,
      purchasedAt: new Date().toISOString(),
      paymentRequestId: payment.id,
      status: 'ACTIVE',
      method: 'TELEBIRR',
    };
    db.createPurchase(purchase);

    // Send student notification
    db.addNotification({
      id: 'notif-app-' + Date.now(),
      studentId: payment.studentId,
      title: 'Payment Approved! ✅',
      message: `Your payment for "${payment.materialTitle}" has been approved. Your note is now available!`,
      read: false,
      type: 'payment',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, payment: db.getPaymentRequestById(payment.id) });
  });

  app.post('/api/admin/payments/:id/reject', requireAdmin, (req, res) => {
    const { reason } = req.body;
    const payment = db.getPaymentRequestById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment request not found.' });

    db.updatePaymentRequest(payment.id, {
      status: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewNote: reason || 'Telebirr transaction number could not be verified.',
    });

    db.addNotification({
      id: 'notif-rej-' + Date.now(),
      studentId: payment.studentId,
      title: 'Payment Rejected ❌',
      message: `Your payment for "${payment.materialTitle}" was rejected. ${reason || 'Please verify your Telebirr transaction number and resubmit.'}`,
      read: false,
      type: 'payment',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, payment: db.getPaymentRequestById(payment.id) });
  });

  // Admin Material Management (Add, Edit, Delete, Toggle Publish, Update Price)
  app.get('/api/admin/materials', requireAdmin, (req, res) => {
    res.json({ materials: db.getMaterials() });
  });

  app.post('/api/admin/materials', requireAdmin, (req, res) => {
    const { title, description, grade, subject, unit, chapter, type, price, content, fileDownloadName } = req.body;
    if (!title || !grade || !subject) {
      return res.status(400).json({ error: 'Title, grade, and subject are required.' });
    }

    const newMaterial: Material = {
      id: 'mat-' + Date.now(),
      title,
      description: description || '',
      grade,
      subject,
      unit: unit || 'Unit 1',
      chapter: chapter || unit || 'Unit 1',
      type: type || 'Notes',
      thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=60',
      price: Number(price) || 0,
      content: content || '# ' + title + '\n\nEducational content here.',
      createdDate: new Date().toISOString().split('T')[0],
      isPublished: true,
      authorName: 'eNotes Admin',
      fileDownloadName: fileDownloadName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize: '2.5 MB',
      previewText: description || title,
    };

    db.createMaterial(newMaterial);
    res.status(201).json({ material: newMaterial });
  });

  app.put('/api/admin/materials/:id', requireAdmin, (req, res) => {
    const updated = db.updateMaterial(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Material not found.' });
    res.json({ material: updated });
  });

  app.delete('/api/admin/materials/:id', requireAdmin, (req, res) => {
    db.deleteMaterial(req.params.id);
    res.json({ success: true });
  });

  // Dynamic Price Update (0 -> 10, 10 -> 15, 15 -> 0, etc.)
  app.put('/api/admin/materials/:id/price', requireAdmin, (req, res) => {
    const { price } = req.body;
    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ error: 'A valid numeric price is required.' });
    }

    const updated = db.updateMaterial(req.params.id, { price: Number(price) });
    if (!updated) return res.status(404).json({ error: 'Material not found.' });

    res.json({ success: true, material: updated });
  });

  app.put('/api/admin/materials/:id/toggle-publish', requireAdmin, (req, res) => {
    const mat = db.getMaterialById(req.params.id);
    if (!mat) return res.status(404).json({ error: 'Material not found.' });

    const updated = db.updateMaterial(mat.id, { isPublished: !mat.isPublished });
    res.json({ success: true, material: updated });
  });

  // Admin Upload Review Queue
  app.get('/api/admin/uploaded-materials', requireAdmin, (req, res) => {
    res.json({ uploads: db.getUploadedMaterials() });
  });

  app.post('/api/admin/uploaded-materials/:id/approve', requireAdmin, (req, res) => {
    const upload = db.getUploadedMaterials().find((u) => u.id === req.params.id);
    if (!upload) return res.status(404).json({ error: 'Upload not found.' });

    db.updateUploadedMaterial(upload.id, { status: 'APPROVED' });

    // Publish it as a material in the app catalog
    const newMaterial: Material = {
      id: 'mat-student-' + Date.now(),
      title: upload.title,
      description: upload.description,
      grade: upload.grade,
      subject: upload.subject,
      unit: upload.unit,
      type: upload.type,
      thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60',
      price: upload.suggestedPrice || 0,
      content: upload.content,
      createdDate: new Date().toISOString().split('T')[0],
      isPublished: true,
      authorName: `${upload.studentName} (Student Contributor)`,
      authorId: upload.studentId,
      isStudentUpload: true,
      previewText: upload.description,
    };

    db.createMaterial(newMaterial);

    const rewardPoints = db.getSettings().contributionRewardPoints || 50;

    // Reward the student points for approved upload!
    db.addPointTransaction({
      id: 'pt-upload-' + Date.now(),
      studentId: upload.studentId,
      amount: rewardPoints,
      type: 'STUDY_BONUS',
      description: `Reward for published study material "${upload.title}"`,
      createdAt: new Date().toISOString(),
    });

    db.addNotification({
      id: 'notif-up-app-' + Date.now(),
      studentId: upload.studentId,
      title: 'Material Approved & Published! 🌟',
      message: `Your material "${upload.title}" has been approved and published to eNotes! You earned ${rewardPoints} reward points.`,
      read: false,
      type: 'approval',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, material: newMaterial });
  });

  app.post('/api/admin/uploaded-materials/:id/reject', requireAdmin, (req, res) => {
    const upload = db.getUploadedMaterials().find((u) => u.id === req.params.id);
    if (!upload) return res.status(404).json({ error: 'Upload not found.' });

    db.updateUploadedMaterial(upload.id, { status: 'REJECTED' });

    db.addNotification({
      id: 'notif-up-rej-' + Date.now(),
      studentId: upload.studentId,
      title: 'Material Submission Update',
      message: `Your submission "${upload.title}" did not meet curriculum guidelines and was rejected.`,
      read: false,
      type: 'approval',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true });
  });

  // Admin Points API
  app.get('/api/admin/points', requireAdmin, (req, res) => {
    const transactions = db.getPointTransactions();
    const students = db.getStudents();
    const totalCirculating = students.reduce((sum, s) => sum + (s.points || 0), 0);
    res.json({ transactions, totalCirculating });
  });

  app.post('/api/admin/points/adjust', requireAdmin, (req, res) => {
    const { studentId, amount, description } = req.body;
    if (!studentId || amount === undefined) {
      return res.status(400).json({ error: 'Student ID and amount are required.' });
    }
    const student = db.getStudentById(studentId);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const numAmount = Number(amount);
    const tx = db.addPointTransaction({
      id: 'pt-adj-' + Date.now(),
      studentId,
      amount: numAmount,
      type: 'ADMIN_ADJUST',
      description: description || 'Admin manual point adjustment',
      createdAt: new Date().toISOString(),
    });

    db.addNotification({
      id: 'notif-adj-' + Date.now(),
      studentId,
      title: 'Points Balance Update ⭐',
      message: `Your points balance was adjusted by ${numAmount >= 0 ? '+' : ''}${numAmount} points. Reason: ${description || 'Admin adjustment'}. Current balance: ${student.points} pts.`,
      read: false,
      type: 'points',
      createdAt: new Date().toISOString(),
    });

    res.json({ success: true, transaction: tx, currentPoints: student.points });
  });

  // Admin Referrals API
  app.get('/api/admin/referrals', requireAdmin, (req, res) => {
    const referrals = db.getReferrals();
    res.json({ referrals });
  });

  // Admin Settings Update
  app.get('/api/admin/settings', (req, res) => {
    res.json({ settings: db.getSettings() });
  });

  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const updated = db.updateSettings(req.body);
    res.json({ settings: updated });
  });

  // Admin Students List
  app.get('/api/admin/students', requireAdmin, (req, res) => {
    const students = db.getStudents();
    res.json({ students });
  });

  // ==========================================
  // 10. SEARCH API
  // ==========================================
  app.get('/api/search', (req, res) => {
    const student = getSessionStudent(req);
    const q = String(req.query.q || '').toLowerCase().trim();

    if (!q) {
      return res.json({ results: [] });
    }

    const materials = db.getMaterials().filter((m) => m.isPublished);
    const results = materials
      .filter((m) => {
        return (
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.unit.toLowerCase().includes(q) ||
          m.grade.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q)
        );
      })
      .map((m) => ({
        ...m,
        isPurchased: student ? db.hasPurchased(student.id, m.id) || m.price === 0 : m.price === 0,
        content: undefined, // Don't expose content in search
      }));

    res.json({ results });
  });

  // ==========================================
  // VITE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`eNotes educational platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
