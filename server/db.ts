import fs from 'fs';
import path from 'path';
import {
  StudentProfile,
  Material,
  PaymentRequest,
  Purchase,
  PointTransaction,
  ReferralRecord,
  DownloadRecord,
  UploadedMaterialRequest,
  AppNotification,
  AdminSettings,
} from '../src/types.ts';

interface DatabaseSchema {
  students: StudentProfile[];
  materials: Material[];
  paymentRequests: PaymentRequest[];
  purchases: Purchase[];
  pointTransactions: PointTransaction[];
  referrals: ReferralRecord[];
  downloads: DownloadRecord[];
  uploadedMaterials: UploadedMaterialRequest[];
  notifications: AppNotification[];
  adminSettings: AdminSettings;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'enotes-db.json');

const INITIAL_SETTINGS: AdminSettings = {
  telebirrNumber: '0908170534',
  telebirrAccountName: 'eNotes Educational Services',
  referralBonusPoints: 20,
  pointsPerFreeChapter: 100,
  supportTelegram: 'https://t.me/Ethio_note0',
  supportTikTok: 'https://www.tiktok.com/@ethio.s_note',
  supportPhone: '0908170534',
  contactEmail: 'support@enotes.et',
};

const INITIAL_MATERIALS: Material[] = [
  {
    id: 'mat-sets-gr9-math',
    title: 'Further on Sets – Short Note',
    description: 'Comprehensive curriculum summary of Grade 9 Mathematics Unit 1 covering set notation, operations, Venn diagrams, subsets, Cartesian product, and review questions.',
    grade: 'Grade 9',
    subject: 'Mathematics',
    unit: 'Unit 1',
    chapter: 'Unit 1: Further on Sets',
    type: 'Notes',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60',
    price: 10,
    createdDate: '2026-09-15',
    isPublished: true,
    authorName: 'eNotes Curriculum Team',
    fileDownloadName: 'Grade9_Math_Unit1_Sets_ShortNote.pdf',
    fileSize: '2.4 MB',
    previewText: 'A complete mastery note on Sets and Elements, Set Notation (Roster & Set-builder), Subsets, Cartesian Products, and De Morgan’s Laws.',
    content: `# Grade 9 Mathematics
## Unit 1: Further on Sets – Short Note

### 1. Sets and Elements
* **Definition:** A set is a well-defined collection of distinct objects called **elements** or **members** of the set.
* **Notation:** Sets are commonly denoted by capital letters ($A, B, C, \\dots, S$). Elements are denoted by lowercase letters ($a, b, c, \\dots$) or numbers.

### 2. Set Notation & Membership
* **Membership symbol ($\\in$):** If $x$ is an element of set $A$, we write $x \\in A$ (read "$x$ belongs to $A$").
* **Non-membership symbol ($\\notin$):** If $y$ is not an element of set $A$, we write $y \\notin A$.

### 3. Methods of Describing Sets
1. **Roster (Tabular / Listing) Method:**
   Listing all elements inside curly braces separated by commas.
   *Example:* $V = \\{a, e, i, o, u\\}$
2. **Set-Builder (Rule / Property) Notation:**
   Stating the common characterizing property of elements.
   *Example:* $A = \\{x \\mid x \\in \\mathbb{N} \\text{ and } 1 \\le x \\le 5\\}$

### 4. Standard Number Sets
* **Natural numbers ($\\mathbb{N}$):** $\\mathbb{N} = \\{1, 2, 3, 4, 5, \\dots\\}$
* **Whole numbers ($\\mathbb{W}$):** $\\mathbb{W} = \\{0, 1, 2, 3, 4, \\dots\\}$
* **Integers ($\\mathbb{Z}$):** $\\mathbb{Z} = \\{\\dots, -3, -2, -1, 0, 1, 2, 3, \\dots\\}$
* **Rational numbers ($\\mathbb{Q}$):** $\\{p/q \\mid p, q \\in \\mathbb{Z}, q \\neq 0\\}$

### 5. Types of Sets
* **Empty Set (Null Set $\\emptyset$ or $\\{\\}$):** A set containing no elements. Note: $\\{\\emptyset\\}$ is NOT empty (it contains 1 element).
* **Finite Set:** A set with countable number of elements (cardinality $n(A)$ is a non-negative integer).
* **Infinite Set:** A set whose elements cannot be counted to a finish (e.g. set of primes).
* **Equal Sets ($A = B$):** Two sets containing exactly the same elements.
* **Equivalent Sets ($A \\sim B$):** Sets with the same cardinality: $n(A) = n(B)$.
* **Universal Set ($U$):** The set containing all possible elements under consideration.

### 6. Subsets and Proper Subsets
* **Subset ($A \\subseteq B$):** Every element of $A$ is also an element of $B$.
* **Proper Subset ($A \\subset B$):** $A \\subseteq B$ and $A \\neq B$ (there is at least one element in $B$ not in $A$).
* **Key Formulas:**
  * Number of all subsets of a finite set with $n$ elements = **$2^n$**
  * Number of proper subsets = **$2^n - 1$**
  * Empty set is a subset of every set: $\\emptyset \\subseteq A$.

### 7. Set Operations
1. **Union ($A \\cup B$):** Elements in $A$, or in $B$, or in both.
   $A \\cup B = \\{x \\mid x \\in A \\text{ or } x \\in B\\}$
2. **Intersection ($A \\cap B$):** Elements in BOTH $A$ and $B$.
   $A \\cap B = \\{x \\mid x \\in A \\text{ and } x \\in B\\}$
   *If $A \\cap B = \\emptyset$, $A$ and $B$ are disjoint sets.*
3. **Difference ($A \\setminus B$ or $A - B$):** Elements in $A$ that are NOT in $B$.
   $A - B = \\{x \\mid x \\in A \\text{ and } x \\notin B\\}$
4. **Complement ($A'$ or $A^c$):** Elements in Universal set $U$ that are not in $A$.
   $A' = U - A = \\{x \\in U \\mid x \\notin A\\}$
5. **Symmetric Difference ($A \\Delta B$):**
   $A \\Delta B = (A - B) \\cup (B - A) = (A \\cup B) - (A \\cap B)$
6. **Cartesian Product ($A \\times B$):** Set of ordered pairs:
   $A \\times B = \\{(a, b) \\mid a \\in A \\text{ and } b \\in B\\}$
   *Formula:* $n(A \\times B) = n(A) \\times n(B)$

### 8. Principle of Inclusion-Exclusion
For any two finite sets $A$ and $B$:
**$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$**

For three finite sets $A, B, C$:
$n(A \\cup B \\cup C) = n(A) + n(B) + n(C) - n(A \\cap B) - n(A \\cap C) - n(B \\cap C) + n(A \\cap B \\cap C)$

### 9. De Morgan's Laws
1. **$(A \\cup B)' = A' \\cap B'$**
2. **$(A \\cap B)' = A' \\cup B'$**

### 10. Worked Examples
* **Example 1:** Let $U = \\{1, 2, 3, 4, 5, 6, 7, 8, 9\\}$, $A = \\{1, 3, 5, 7, 9\\}$, $B = \\{2, 3, 5, 7\\}$.
  * $A \\cup B = \\{1, 2, 3, 5, 7, 9\\}$
  * $A \\cap B = \\{3, 5, 7\\}$
  * $A - B = \\{1, 9\\}$
  * $A' = \\{2, 4, 6, 8\\}$
  * Subsets of $B$: $n(B) = 4 \\implies 2^4 = 16$ subsets, $16 - 1 = 15$ proper subsets.

* **Example 2:** In a Grade 9 class of 50 students, 30 take French and 25 take German. If 12 take both languages:
  * $n(F) = 30$, $n(G) = 25$, $n(F \\cap G) = 12$
  * $n(F \\cup G) = 30 + 25 - 12 = 43$ students study at least one.
  * Number studying neither = $50 - 43 = 7$ students.

### 11. Review & Self-Check Questions
1. If set $S$ has 6 elements, find the total number of non-empty proper subsets.
2. Given $P = \\{x \\mid x^2 - 9 = 0\\}$ and $Q = \\{3, -3\\}$, are $P$ and $Q$ equal sets?
3. Verify De Morgan's first law using Venn diagrams for sets $A$ and $B$.
4. True or False: $\\emptyset \\in \\{\\emptyset\\}$ and $\\emptyset \\subset \\{\\emptyset\\}$. Explain.`
  },
  {
    id: 'mat-sets-worksheet-gr9',
    title: 'Sets & Venn Diagrams Practice Worksheet',
    description: '40 exam-standard practice problems with full step-by-step solutions for Grade 9 Mathematics Unit 1.',
    grade: 'Grade 9',
    subject: 'Mathematics',
    unit: 'Unit 1',
    chapter: 'Unit 1: Further on Sets',
    type: 'Worksheets',
    thumbnail: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=60',
    price: 0, // FREE!
    createdDate: '2026-09-16',
    isPublished: true,
    authorName: 'eNotes Mathematics Department',
    fileDownloadName: 'Grade9_Math_Unit1_Worksheet_Free.pdf',
    fileSize: '1.8 MB',
    previewText: 'Free practice worksheet covering all set operations and national exam model problems.',
    content: `# Grade 9 Mathematics Worksheet
## Unit 1: Further on Sets (Free Practice with Solutions)

### Part I: Multiple Choice Questions
1. If $A = \\{x \\in \\mathbb{W} \\mid x < 4\\}$, which of the following is correct?
   A) $n(A) = 3$
   B) $-1 \\in A$
   C) $\\{0, 1, 2, 3\\} = A$
   D) $4 \\in A$
   **Answer: C** (Since whole numbers start from 0: $\\{0, 1, 2, 3\\}$).

2. What is the number of proper subsets of a set with 5 elements?
   A) 32
   B) 31
   C) 25
   D) 10
   **Answer: B** ($2^5 - 1 = 32 - 1 = 31$).

3. If $n(A) = 15$, $n(B) = 20$, and $n(A \\cap B) = 7$, what is $n(A \\cup B)$?
   A) 35
   B) 28
   C) 21
   D) 42
   **Answer: B** ($15 + 20 - 7 = 28$).

### Part II: Detailed Work-Out Problems
[Full solutions attached with Venn diagrams and step-by-step marking rubrics.]`
  },
  {
    id: 'mat-phys-gr9-unit1',
    title: 'Physics and Human Society & Measurement Summary',
    description: 'Grade 9 Physics Unit 1 and Unit 2 foundational note: physical quantities, SI units, scalar vs vector, and precision.',
    grade: 'Grade 9',
    subject: 'Physics',
    unit: 'Unit 1',
    chapter: 'Unit 1: Physics and Human Society',
    type: 'Notes',
    thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=60',
    price: 0, // FREE!
    createdDate: '2026-09-17',
    isPublished: true,
    authorName: 'eNotes Science Faculty',
    fileDownloadName: 'Grade9_Physics_Unit1_Free.pdf',
    fileSize: '3.1 MB',
    previewText: 'Free study note on scientific methods, branches of physics, and fundamental SI units in Ethiopian curriculum.',
    content: `# Grade 9 Physics
## Unit 1: Physics and Human Society

### 1. Definition and Branches of Physics
Physics is the fundamental branch of natural science that studies matter, energy, and their mutual interactions.
* **Classical Mechanics:** Study of motion and forces (Newtonian mechanics).
* **Thermodynamics:** Heat, work, and temperature.
* **Electromagnetism:** Electricity, magnetism, and electromagnetic waves.
* **Optics:** Behavior and properties of light.
* **Modern Physics:** Atomic, nuclear, and quantum mechanics.

### 2. Physical Quantities and SI Units
Ethiopian curriculum strictly emphasizes the International System of Units (SI):
1. Length - Meter (m)
2. Mass - Kilogram (kg)
3. Time - Second (s)
4. Electric Current - Ampere (A)
5. Temperature - Kelvin (K)
6. Amount of Substance - Mole (mol)
7. Luminous Intensity - Candela (cd)`
  },
  {
    id: 'mat-bio-gr10-genetics',
    title: 'Sub-Cellular Biology & Genetics Master Note',
    description: 'Ethiopian Grade 10 Biology Unit 2: DNA replication, Mendelian inheritance, monohybrid and dihybrid crosses, and genetic disorders.',
    grade: 'Grade 10',
    subject: 'Biology',
    unit: 'Unit 2',
    chapter: 'Unit 2: Heredity and Genetics',
    type: 'Notes',
    thumbnail: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=600&auto=format&fit=crop&q=60',
    price: 15,
    createdDate: '2026-09-18',
    isPublished: true,
    authorName: 'Dr. Tadesse Mengistu',
    fileDownloadName: 'Grade10_Biology_Unit2_Genetics.pdf',
    fileSize: '4.2 MB',
    previewText: 'Complete heredity summary with Punnett squares, phenotype-genotype ratios, and exam questions.',
    content: `# Grade 10 Biology
## Unit 2: Heredity & Genetics

### 1. Mendel's Laws of Inheritance
1. **Law of Segregation:** During gamete formation, alleles for each gene segregate so each gamete carries only one allele.
2. **Law of Independent Assortment:** Genes for different traits sort independently during gamete formation.

### 2. Monohybrid Cross Analysis
* Parental generation: $TT \\times tt$ (Pure tall $\\times$ Pure dwarf)
* $F_1$ generation: All $Tt$ (Heterozygous tall)
* $F_2$ generation: $1 TT : 2 Tt : 1 tt$
  * Genotypic ratio: $1:2:1$
  * Phenotypic ratio: $3 \\text{ Tall} : 1 \\text{ Dwarf}$`
  },
  {
    id: 'mat-chem-gr11-solutions',
    title: 'Solutions and Colligative Properties Full Guide',
    description: 'Grade 11 Chemistry Unit 2: Types of solutions, solubility factors, molarity, molality, Raoult’s law, boiling point elevation, and osmotic pressure.',
    grade: 'Grade 11',
    subject: 'Chemistry',
    unit: 'Unit 2',
    chapter: 'Unit 2: Solutions',
    type: 'Exam Papers',
    thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&auto=format&fit=crop&q=60',
    price: 20,
    createdDate: '2026-09-18',
    isPublished: true,
    authorName: 'eNotes Chemistry Team',
    fileDownloadName: 'Grade11_Chemistry_Unit2_Solutions.pdf',
    fileSize: '5.1 MB',
    previewText: 'High-yield note and 50 entrance exam questions on molarity, normality, molality, and colligative properties.',
    content: `# Grade 11 Chemistry
## Unit 2: Solutions & Colligative Properties

### 1. Concentrations of Solutions
* **Molarity ($M$):** $M = \\frac{\\text{moles of solute}}{\\text{liters of solution}}$
* **Molality ($m$):** $m = \\frac{\\text{moles of solute}}{\\text{mass of solvent in kg}}$
* **Mole Fraction ($X_A$):** $X_A = \\frac{n_A}{n_A + n_B}$

### 2. Colligative Properties
1. Vapor pressure lowering (Raoult's Law)
2. Boiling point elevation: $\\Delta T_b = K_b \\cdot m$
3. Freezing point depression: $\\Delta T_f = K_f \\cdot m$
4. Osmotic Pressure: $\\Pi = M R T$`
  },
  {
    id: 'mat-it-gr11-python',
    title: 'Introduction to Algorithms and Python Programming',
    description: 'Grade 11 IT Unit 3: Flowcharts, pseudocode, control structures, loops, functions, and practical programming exercises.',
    grade: 'Grade 11',
    subject: 'IT',
    unit: 'Unit 3',
    chapter: 'Unit 3: Computer Programming',
    type: 'Textbooks',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60',
    price: 10,
    createdDate: '2026-09-17',
    isPublished: true,
    authorName: 'Selamawit Kebede (IT Specialist)',
    fileDownloadName: 'Grade11_IT_Python_Algorithms.pdf',
    fileSize: '3.8 MB',
    previewText: 'Textbook supplement for the new Ethiopian Grade 11 IT curriculum on algorithm design.',
    content: `# Grade 11 Information Technology
## Unit 3: Algorithm Design and Programming

### 1. Algorithm Essentials
An algorithm is a finite sequence of well-defined, unambiguous instructions to solve a computational problem.
* Characteristics: Finiteness, Definiteness, Input, Output, Effectiveness.
* Tools: Flowcharts (oval for start/stop, parallelogram for I/O, rectangle for process, diamond for decision).`
  },
  {
    id: 'mat-econ-gr12-macro',
    title: 'National Income Accounting & Ethiopian Macroeconomy',
    description: 'Grade 12 Economics Unit 1: GDP vs GNP, measurement approaches (Expenditure, Income, Value-Added), inflation, and unemployment.',
    grade: 'Grade 12',
    subject: 'Economics',
    unit: 'Unit 1',
    chapter: 'Unit 1: Macroeconomic Aggregates',
    type: 'Notes',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60',
    price: 15,
    createdDate: '2026-09-16',
    isPublished: true,
    authorName: 'Yonas Haile (Economics Dept)',
    fileDownloadName: 'Grade12_Economics_Unit1.pdf',
    fileSize: '3.5 MB',
    previewText: 'Key formula sheet for GDP = C + I + G + (X - M), Nominal vs Real GDP, and GDP deflator.',
    content: `# Grade 12 Economics
## Unit 1: National Income Accounting

### 1. Gross Domestic Product (GDP)
The total market value of all final goods and services produced within the geographic borders of a country in a given period.
* **Expenditure Approach:** $GDP = C + I + G + (X - M)$
  * $C$: Household consumption
  * $I$: Gross private domestic investment
  * $G$: Government spending
  * $X - M$: Net exports (Exports minus Imports)`
  },
  {
    id: 'mat-eng-gr12-entrance',
    title: 'National Entrance Exam Preparation – English Grammar & Vocabulary',
    description: 'Comprehensive entrance examination compilation for Grade 12: conditionals, reported speech, reading strategies, and vocabulary lists.',
    grade: 'Grade 12',
    subject: 'English',
    unit: 'Unit 1',
    chapter: 'Grammar and Entrance Skills',
    type: 'Exam Papers',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=60',
    price: 0, // FREE!
    createdDate: '2026-09-19',
    isPublished: true,
    authorName: 'eNotes Language Institute',
    fileDownloadName: 'Grade12_English_Entrance_Exam_Free.pdf',
    fileSize: '2.9 MB',
    previewText: 'Free entrance test package containing 100 actual Ethiopian national exam questions with explanations.',
    content: `# Grade 12 English
## University Entrance Examination Preparation

### Section 1: Grammar Mastery
* **Conditionals:**
  * Zero Conditional: General truth ($If + Present \\to Present$)
  * First Conditional: Real possibility ($If + Present \\to will + verb$)
  * Second Conditional: Hypothetical present ($If + Past \\to would + verb$)
  * Third Conditional: Regret past ($If + Past Perfect \\to would have + V3$)`
  },
  {
    id: 'mat-chem-gr10-video',
    title: 'Chemical Reactions and Stoichiometry Video Masterclass',
    description: 'High-definition video lesson explaining balancing chemical equations, molar ratios, and limiting reactants for Grade 10 Chemistry.',
    grade: 'Grade 10',
    subject: 'Chemistry',
    unit: 'Unit 2',
    chapter: 'Unit 2: Chemical Reactions',
    type: 'Videos',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=60',
    price: 15,
    createdDate: '2026-09-18',
    isPublished: true,
    authorName: 'Abebe Mengistu (Chemistry Specialist)',
    videoUrl: 'https://www.youtube-nocookie.com/embed/1B6FmDqIq8g',
    fileDownloadName: 'Grade10_Chemistry_Video_Guide.pdf',
    fileSize: '4.5 MB',
    previewText: 'Full video walkthrough with animated molecular equations, stoichiometric calculations, and exam questions.',
    content: `# Grade 10 Chemistry Video Guide
## Chemical Reactions and Stoichiometry

### 1. Types of Chemical Reactions
* Direct Combination (Synthesis): $A + B \\to AB$
* Decomposition: $AB \\to A + B$
* Single Displacement: $A + BC \\to AC + B$
* Double Displacement: $AB + CD \\to AD + CB$

### 2. Video Outline & Key Highlights
- **00:00 - 05:00:** Fundamentals of Chemical Equations
- **05:01 - 12:30:** Law of Conservation of Mass
- **12:31 - 20:00:** Limiting Reactant Calculations
- **20:01 - 28:00:** Ethiopian National Exam Model Problems`
  },
  {
    id: 'mat-phys-gr10-exercises',
    title: 'Kinematics & Motion In One Dimension – Solved Exercises',
    description: 'Ethiopian Grade 10 Physics Unit 2: 50 conceptual and numerical exercises on velocity, acceleration, free fall, and motion graphs.',
    grade: 'Grade 10',
    subject: 'Physics',
    unit: 'Unit 2',
    chapter: 'Unit 2: Motion in One Dimension',
    type: 'Exercises',
    thumbnail: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=600&auto=format&fit=crop&q=60',
    price: 10,
    createdDate: '2026-09-17',
    isPublished: true,
    authorName: 'Dawit Yohannes (Physics Teacher)',
    fileDownloadName: 'Grade10_Physics_Kinematics_Exercises.pdf',
    fileSize: '3.2 MB',
    previewText: 'Comprehensive exercises with step-by-step mathematical proofs and graph interpretation.',
    content: `# Grade 10 Physics Exercises
## Motion in One Dimension

### Exercise Set A: Uniform Accelerated Motion
1. A car accelerates from rest at $2.5 \\text{ m/s}^2$ for 8 seconds. Calculate its final velocity and displacement.
   * *Solution:* $v = u + at = 0 + (2.5)(8) = 20 \\text{ m/s}$.
   * $s = ut + \\frac{1}{2}at^2 = 0 + \\frac{1}{2}(2.5)(64) = 80 \\text{ m}$.

2. A stone is dropped from a cliff 45 meters high. Taking $g = 9.8 \\text{ m/s}^2$, find the time it takes to strike the ground.
   * *Solution:* $h = \\frac{1}{2}gt^2 \\implies 45 = 4.9 t^2 \\implies t \\approx 3.03 \\text{ seconds}$.`
  }
];

const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-demo-1',
    fullName: 'Abebe Bekele',
    email: 'student@enotes.et',
    phone: '0911223344',
    grade: 'Grade 9',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    points: 120,
    referralCode: 'ABEBE9',
    role: 'student',
    savedMaterialIds: ['mat-sets-gr9-math', 'mat-phys-gr9-unit1'],
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'admin-demo-1',
    fullName: 'eNotes Admin Team',
    email: 'admin@enotes.et',
    phone: '0908170534',
    grade: 'Grade 12',
    profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    points: 500,
    referralCode: 'ADMIN01',
    role: 'admin',
    savedMaterialIds: [],
    createdAt: '2026-08-01T08:00:00Z',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading database file, initializing defaults:', e);
    }

    const defaultData: DatabaseSchema = {
      students: INITIAL_STUDENTS,
      materials: INITIAL_MATERIALS,
      paymentRequests: [
        {
          id: 'pay-sample-1',
          studentId: 'student-demo-1',
          studentName: 'Abebe Bekele',
          studentPhone: '0911223344',
          materialId: 'mat-sets-gr9-math',
          materialTitle: 'Further on Sets – Short Note',
          grade: 'Grade 9',
          subject: 'Mathematics',
          price: 10,
          paymentMethod: 'TELEBIRR',
          telebirrNumber: '0908170534',
          transactionNumber: 'TBR982348123',
          status: 'PENDING',
          submittedAt: new Date(Date.now() - 3600000).toISOString(),
        }
      ],
      purchases: [],
      pointTransactions: [
        {
          id: 'pt-1',
          studentId: 'student-demo-1',
          amount: 100,
          type: 'STUDY_BONUS',
          description: 'Welcome bonus for joining eNotes',
          createdAt: '2026-09-01T10:05:00Z',
        },
        {
          id: 'pt-2',
          studentId: 'student-demo-1',
          amount: 20,
          type: 'EARNED_REFERRAL',
          description: 'Referral reward for inviting Dawit',
          createdAt: '2026-09-05T14:20:00Z',
        },
      ],
      referrals: [
        {
          id: 'ref-1',
          referrerId: 'student-demo-1',
          refereeId: 'student-dawit-2',
          refereeName: 'Dawit Alemayehu',
          refereePhone: '0922334455',
          rewardPoints: 20,
          createdAt: '2026-09-05T14:20:00Z',
        }
      ],
      downloads: [],
      uploadedMaterials: [],
      notifications: [
        {
          id: 'notif-1',
          studentId: 'student-demo-1',
          title: 'Welcome to eNotes 📚',
          message: 'Welcome Abebe! Explore Grade 9 curriculum notes, worksheets and prepare for your exams.',
          read: false,
          type: 'system',
          createdAt: '2026-09-01T10:00:00Z',
        },
        {
          id: 'notif-2',
          studentId: 'student-demo-1',
          title: 'Payment Pending',
          message: 'Your Telebirr payment for Further on Sets – Short Note (10 Birr) is pending admin verification.',
          read: false,
          type: 'payment',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'notif-3',
          studentId: 'student-demo-1',
          title: 'You earned 20 points! ⭐',
          message: 'Congratulations! You earned 20 points from your referral.',
          read: false,
          type: 'points',
          createdAt: '2026-09-05T14:20:00Z',
        }
      ],
      adminSettings: INITIAL_SETTINGS,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  public save() {
    this.saveData(this.data);
  }

  // --- Students ---
  getStudents() {
    return this.data.students;
  }

  getStudentById(id: string) {
    return this.data.students.find((s) => s.id === id);
  }

  getStudentByEmail(email: string) {
    return this.data.students.find(
      (s) => s.email.toLowerCase() === email.toLowerCase()
    );
  }

  createStudent(student: StudentProfile) {
    this.data.students.push(student);
    this.save();
    return student;
  }

  updateStudent(id: string, updates: Partial<StudentProfile>) {
    const idx = this.data.students.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.students[idx] = { ...this.data.students[idx], ...updates };
      this.save();
      return this.data.students[idx];
    }
    return null;
  }

  // --- Materials ---
  getMaterials() {
    return this.data.materials;
  }

  getMaterialById(id: string) {
    return this.data.materials.find((m) => m.id === id);
  }

  createMaterial(material: Material) {
    this.data.materials.push(material);
    this.save();
    return material;
  }

  updateMaterial(id: string, updates: Partial<Material>) {
    const idx = this.data.materials.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.data.materials[idx] = { ...this.data.materials[idx], ...updates };
      this.save();
      return this.data.materials[idx];
    }
    return null;
  }

  deleteMaterial(id: string) {
    this.data.materials = this.data.materials.filter((m) => m.id !== id);
    this.save();
    return true;
  }

  // --- Payments & Purchases ---
  getPaymentRequests() {
    return this.data.paymentRequests;
  }

  getPaymentRequestById(id: string) {
    return this.data.paymentRequests.find((p) => p.id === id);
  }

  createPaymentRequest(req: PaymentRequest) {
    this.data.paymentRequests.unshift(req);
    this.save();
    return req;
  }

  updatePaymentRequest(id: string, updates: Partial<PaymentRequest>) {
    const idx = this.data.paymentRequests.findIndex((p) => p.id === id);
    if (idx !== -1) {
      this.data.paymentRequests[idx] = {
        ...this.data.paymentRequests[idx],
        ...updates,
      };
      this.save();
      return this.data.paymentRequests[idx];
    }
    return null;
  }

  getPurchases() {
    return this.data.purchases;
  }

  getPurchasesByStudent(studentId: string) {
    return this.data.purchases.filter((p) => p.studentId === studentId);
  }

  hasPurchased(studentId: string, materialId: string): boolean {
    return this.data.purchases.some(
      (p) => p.studentId === studentId && p.materialId === materialId
    );
  }

  createPurchase(purchase: Purchase) {
    this.data.purchases.push(purchase);
    this.save();
    return purchase;
  }

  // --- Points ---
  getPointTransactions(studentId?: string) {
    if (studentId) {
      return this.data.pointTransactions.filter((pt) => pt.studentId === studentId);
    }
    return this.data.pointTransactions;
  }

  addPointTransaction(tx: PointTransaction) {
    this.data.pointTransactions.unshift(tx);
    const student = this.getStudentById(tx.studentId);
    if (student) {
      student.points = Math.max(0, student.points + tx.amount);
    }
    this.save();
    return tx;
  }

  // --- Referrals ---
  getReferrals(referrerId?: string) {
    if (referrerId) {
      return this.data.referrals.filter((r) => r.referrerId === referrerId);
    }
    return this.data.referrals;
  }

  addReferral(ref: ReferralRecord) {
    this.data.referrals.unshift(ref);
    this.save();
    return ref;
  }

  // --- Downloads ---
  getDownloads(studentId?: string) {
    if (studentId) {
      return this.data.downloads.filter((d) => d.studentId === studentId);
    }
    return this.data.downloads;
  }

  recordDownload(record: DownloadRecord) {
    this.data.downloads.unshift(record);
    this.save();
    return record;
  }

  // --- Uploaded Materials ---
  getUploadedMaterials() {
    return this.data.uploadedMaterials;
  }

  createUploadedMaterial(req: UploadedMaterialRequest) {
    this.data.uploadedMaterials.unshift(req);
    this.save();
    return req;
  }

  updateUploadedMaterial(id: string, updates: Partial<UploadedMaterialRequest>) {
    const idx = this.data.uploadedMaterials.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.uploadedMaterials[idx] = {
        ...this.data.uploadedMaterials[idx],
        ...updates,
      };
      this.save();
      return this.data.uploadedMaterials[idx];
    }
    return null;
  }

  // --- Notifications ---
  getNotifications(studentId: string) {
    return this.data.notifications.filter((n) => n.studentId === studentId);
  }

  addNotification(notif: AppNotification) {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  markNotificationsRead(studentId: string) {
    this.data.notifications.forEach((n) => {
      if (n.studentId === studentId) n.read = true;
    });
    this.save();
  }

  // --- Settings ---
  getSettings() {
    return this.data.adminSettings;
  }

  updateSettings(updates: Partial<AdminSettings>) {
    this.data.adminSettings = { ...this.data.adminSettings, ...updates };
    this.save();
    return this.data.adminSettings;
  }
}

export const db = new Database();
