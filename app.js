/*
 * RuangUTBK â€” App Logic
 * Data materi: Supabase
 * UI: index.html + learning.html
 */

const subjects = [
  {
    id: "pu",
    name: "Penalaran Umum",
    short: "PU",
    description: "Menilai pola, argumen, dan cara menarik kesimpulan."
  },
  {
    id: "pk",
    name: "Pengetahuan Kuantitatif",
    short: "PK",
    description: "Angka, aljabar, geometri, dan hubungan kuantitatif."
  },
  {
    id: "ppu",
    name: "Pengetahuan & Pemahaman Umum",
    short: "PPU",
    description: "Memahami makna, hubungan, dan penggunaan informasi."
  },
  {
    id: "pbm",
    name: "Pemahaman Bacaan & Menulis",
    short: "PBM",
    description: "Membaca, memahami, dan menyusun gagasan dengan tepat."
  },
  {
    id: "bi",
    name: "Literasi Bahasa Indonesia",
    short: "LBI",
    description: "Menalar informasi dari berbagai teks berbahasa Indonesia."
  },
  {
    id: "inggris",
    name: "Literasi Bahasa Inggris",
    short: "LBE",
    description: "Memahami teks dan informasi dalam bahasa Inggris."
  },
  {
    id: "pm",
    name: "Penalaran Matematika",
    short: "PM",
    description: "Menggunakan matematika untuk memahami situasi dan masalah."
  }
];

let lessons = [];

const faqs = [
  {
    q: "Apakah RuangUTBK berbayar?",
    a: "Tidak. Konsep awal RuangUTBK adalah menyediakan materi belajar secara gratis dan terbuka."
  },
  {
    q: "Apakah materi dibuat hanya untuk menghafal rumus?",
    a: "Tidak. Struktur materi mengutamakan pemahaman konsep, analogi, studi kasus, lalu latihan."
  },
  {
    q: "Apakah semua materi sudah lengkap?",
    a: "Belum. RuangUTBK akan dibangun bertahap. Materi yang tersedia akan terus ditambahkan dan diperbaiki."
  },
  {
    q: "Apakah saya harus membuat akun?",
    a: "Untuk versi awal, tidak perlu. Fokusnya adalah membuat materi bisa langsung diakses tanpa hambatan."
  }
];


/* =====================================================
   HELPER
   ===================================================== */

function $(selector) {
  return document.querySelector(selector);
}


/* =====================================================
   SUPABASE
   ===================================================== */

let supabaseClient = null;

function createSupabaseClient() {
  if (!APP_CONFIG.useSupabase) return null;

  if (!window.supabase) {
    console.error("Supabase JS belum dimuat.");
    return null;
  }

  return window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.anonKey
  );
}

async function loadLessonsFromSupabase() {
  supabaseClient = createSupabaseClient();

  if (!supabaseClient) return false;

  const { data, error } = await supabaseClient
    .from("lessons")
    .select("id, subject_id, package, number, title, quote, video_url, document_url")
    .order("number", { ascending: true });

  if (error) {
    console.error("Gagal mengambil data lessons dari Supabase:", error);
    return false;
  }

  lessons = data || [];
  console.log(`RuangUTBK: ${lessons.length} materi berhasil dimuat.`);
  return true;
}


/* =====================================================
   HOME PAGE
   ===================================================== */

function renderSubjects() {
  const grid = $("#subjects-grid");

  if (!grid) return;

  grid.innerHTML = subjects.map((subject, index) => `
    <a
      class="subject-card"
      href="learning.html?subject=${subject.id}"
    >
      <div>
        <div class="subject-card-index">
          ${String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div>
        <h3>${subject.name}</h3>
        <p>${subject.description}</p>
      </div>
    </a>
  `).join("");
}

function renderFaq() {
  const list = $("#faq-list");

  if (!list) return;

  list.innerHTML = faqs.map(faq => `
    <div class="faq-item">
      <button
        class="faq-question"
        type="button"
        aria-expanded="false"
      >
        <span>${faq.q}</span>
        <span class="faq-plus" aria-hidden="true">+</span>
      </button>

      <div class="faq-answer">
        ${faq.a}
      </div>
    </div>
  `).join("");

  list.querySelectorAll(".faq-question").forEach(button => {
    button.addEventListener("click", () => {
      const item = button.parentElement;
      const isOpen = item.classList.toggle("open");

      button.setAttribute("aria-expanded", isOpen);
    });
  });
}


/* =====================================================
   LEARNING DATA
   ===================================================== */

function getLessonsForSubject(subjectId) {
  return lessons.filter(
    lesson => lesson.subject_id === subjectId
  );
}

function getSubject(subjectId) {
  return subjects.find(
    subject => subject.id === subjectId
  );
}


/* =====================================================
   LEARNING SIDEBAR
   ===================================================== */

function renderSubjectSelect() {
  const select = $("#subject-select");

  if (!select) return;

  select.innerHTML = subjects.map(subject => `
    <option value="${subject.id}">
      ${subject.name}
    </option>
  `).join("");
}

function renderToc(subjectId) {
  const toc = $("#sidebar-toc");

  if (!toc) return;

  const subjectLessons = getLessonsForSubject(subjectId);

  if (!subjectLessons.length) {
    toc.innerHTML = `
      <p class="muted">
        Materi untuk sub-bidang ini sedang disiapkan.
      </p>
    `;

    return;
  }

  const grouped = {};

  subjectLessons.forEach(lesson => {
    if (!grouped[lesson.package]) {
      grouped[lesson.package] = [];
    }

    grouped[lesson.package].push(lesson);
  });

  toc.innerHTML = Object.entries(grouped)
    .map(([packageName, packageLessons]) => `
      <div class="toc-package">

        <div class="toc-package-title">
          ${packageName}
        </div>

        ${packageLessons.map(lesson => `
          <button
            class="toc-item"
            type="button"
            data-lesson-id="${lesson.id}"
          >
            <span class="toc-number">
              ${lesson.number}
            </span>

            <span>
              ${lesson.title}
            </span>
          </button>
        `).join("")}

      </div>
    `)
    .join("");

  toc.querySelectorAll(".toc-item").forEach(item => {
    item.addEventListener("click", () => {
      selectLesson(item.dataset.lessonId);
    });
  });
}


/* =====================================================
   LESSON
   ===================================================== */

function selectLesson(lessonId) {
  const lesson = lessons.find(
    item => String(item.id) === String(lessonId)
  );

  if (!lesson) {
    console.warn("Materi tidak ditemukan:", lessonId);
    return;
  }

  const subject = getSubject(lesson.subject_id);

  const subjectTag = $("#read-subject-tag");
  const packageTag = $("#read-paket-tag");
  const number = $("#read-number");
  const title = $("#read-title");
  const quote = $("#read-quote");
  const video = $("#read-video");
  const documentLink = $("#read-document");

  if (subjectTag) {
    subjectTag.textContent = subject?.name || "Materi";
  }

  if (packageTag) {
    packageTag.textContent = lesson.package || "";
  }

  if (number) {
    number.textContent = lesson.number || "";
  }

  if (title) {
    title.textContent = lesson.title || "";
  }

  if (quote) {
    quote.textContent = lesson.quote
      ? `â€œ${lesson.quote}â€`
      : "Belajar dimulai dari memahami.";
  }

  /* -------------------------
     VIDEO
     ------------------------- */

  if (video) {
    const videoUrl = lesson.video_url?.trim() || "";

    video.href = videoUrl || "#";
    video.style.pointerEvents = videoUrl ? "auto" : "none";
    video.style.opacity = videoUrl ? "1" : ".5";
    video.setAttribute(
      "aria-disabled",
      videoUrl ? "false" : "true"
    );
  }

  /* -------------------------
     PDF / DOCUMENT
     ------------------------- */

  if (documentLink) {
    const documentUrl = lesson.document_url?.trim() || "";

    documentLink.href = documentUrl || "#";
    documentLink.style.pointerEvents = documentUrl ? "auto" : "none";
    documentLink.style.opacity = documentUrl ? "1" : ".5";
    documentLink.setAttribute(
      "aria-disabled",
      documentUrl ? "false" : "true"
    );
  }

  /* -------------------------
     ACTIVE SIDEBAR ITEM
     ------------------------- */

  document
    .querySelectorAll(".toc-item")
    .forEach(item => {
      item.classList.toggle(
        "active",
        String(item.dataset.lessonId) === String(lesson.id)
      );
    });

  /* -------------------------
     URL
     ------------------------- */

  const params = new URLSearchParams();

  params.set("subject", lesson.subject_id);
  params.set("lesson", lesson.id);

  window.history.replaceState(
    {},
    "",
    `learning.html?${params.toString()}`
  );

  /* -------------------------
     SCROLL
     ------------------------- */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =====================================================
   LEARNING PAGE
   ===================================================== */

async function initLearning() {
  const loaded = await loadLessonsFromSupabase();

  if (!loaded) {
    showLearningError(
      "Materi belum dapat dimuat. Periksa koneksi atau konfigurasi Supabase."
    );

    return;
  }

  renderSubjectSelect();

  const params = new URLSearchParams(
    window.location.search
  );

  const subjectParam = params.get("subject");
  const lessonParam = params.get("lesson");

  const initialSubject = subjects.some(
    subject => subject.id === subjectParam
  )
    ? subjectParam
    : "pu";

  const subjectSelect = $("#subject-select");

  if (subjectSelect) {
    subjectSelect.value = initialSubject;
  }

  renderToc(initialSubject);

  const availableLessons =
    getLessonsForSubject(initialSubject);

  const initialLesson =
    availableLessons.find(
      lesson => String(lesson.id) === String(lessonParam)
    ) || availableLessons[0];

  if (initialLesson) {
    selectLesson(initialLesson.id);
  }

  /* -------------------------
     SUBJECT CHANGE
     ------------------------- */

  if (subjectSelect) {
    subjectSelect.addEventListener(
      "change",
      event => {
        const subjectId = event.target.value;

        renderToc(subjectId);

        const firstLesson =
          getLessonsForSubject(subjectId)[0];

        if (firstLesson) {
          selectLesson(firstLesson.id);
        } else {
          clearLesson();
        }
      }
    );
  }

  /* -------------------------
     MOBILE SIDEBAR
     ------------------------- */

  const toggle = $("#sidebar-toggle");
  const sidebar = $("#learning-sidebar");

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      const isOpen =
        sidebar.classList.toggle("open");

      toggle.setAttribute(
        "aria-expanded",
        isOpen
      );
    });
  }
}


/* =====================================================
   LEARNING STATES
   ===================================================== */

function clearLesson() {
  const number = $("#read-number");
  const title = $("#read-title");
  const quote = $("#read-quote");

  if (number) number.textContent = "";
  if (title) title.textContent = "Materi belum tersedia";

  if (quote) {
    quote.textContent =
      "Materi untuk sub-bidang ini sedang disiapkan.";
  }

  disableResource("#read-video");
  disableResource("#read-document");
}

function disableResource(selector) {
  const element = $(selector);

  if (!element) return;

  element.href = "#";
  element.style.pointerEvents = "none";
  element.style.opacity = ".5";
  element.setAttribute("aria-disabled", "true");
}

function showLearningError(message) {
  const toc = $("#sidebar-toc");

  if (toc) {
    toc.innerHTML = `
      <p class="muted">
        ${message}
      </p>
    `;
  }

  const title = $("#read-title");

  if (title) {
    title.textContent = "Materi belum dapat dimuat";
  }

  const quote = $("#read-quote");

  if (quote) {
    quote.textContent =
      "Periksa koneksi atau konfigurasi Supabase.";
  }

  disableResource("#read-video");
  disableResource("#read-document");
}


/* =====================================================
   APP INIT
   ===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    const page =
      document.body.dataset.page;

    /* HOME */

    if (page === "home") {
      renderSubjects();
      renderFaq();
    }

    /* LEARNING */

    if (page === "learning") {
      await initLearning();
    }
  }
);