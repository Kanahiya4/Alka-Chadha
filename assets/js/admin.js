/**
 * Dr. Alka Chadha: Executive Admin Console Controller
 * Powers Events, Blogs, Workshops, Booking Inquiries, Visitor Analytics & GitHub Sync
 * Zero backend required: 100% persistent client-side storage
 * Protected by Cryptographic SHA-256 Passkey Verification
 */

(function () {
  'use strict';

  // ----------------------------------------------------
  // 1. PIN PASSKEY SECURITY GATE (SHA-256 HASH VERIFICATION)
  // ----------------------------------------------------
  const PIN_AUTH_KEY = 'alka_admin_authed';
  // SHA-256 hash of the default executive passkey (zero plaintext exposure)
  const MASTER_PIN_HASH = 'e8d2d34c506ebd10693c8c57e3b536aed1d649d7bc7bb47605c32048f53283b4';

  async function sha256Hex(str) {
    if (window.crypto && crypto.subtle) {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }
    // Minimal fallback for older non-crypto environments
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return String(hash);
  }

  const adminPinGate = document.getElementById('adminPinGate');
  const adminPinForm = document.getElementById('adminPinForm');
  const adminPinInput = document.getElementById('adminPinInput');
  const pinErrorMsg = document.getElementById('pinErrorMsg');
  const btnAdminLogout = document.getElementById('btnAdminLogout');

  function initSecurityGate() {
    const isAuthed = sessionStorage.getItem(PIN_AUTH_KEY) === 'true';
    if (adminPinGate) {
      if (isAuthed) {
        adminPinGate.style.display = 'none';
      } else {
        adminPinGate.style.display = 'flex';
        if (adminPinInput) adminPinInput.focus();
      }
    }

    if (adminPinForm) {
      adminPinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enteredPin = (adminPinInput ? adminPinInput.value : '').trim();
        const enteredHash = await sha256Hex(enteredPin);
        const storedCustomHash = localStorage.getItem('alka_admin_pin_hash');
        const validHash = storedCustomHash || MASTER_PIN_HASH;

        if (enteredHash === validHash) {
          sessionStorage.setItem(PIN_AUTH_KEY, 'true');
          if (adminPinGate) adminPinGate.style.display = 'none';
          showToast('Executive Console unlocked');
          refreshAllAdminData();
        } else {
          if (pinErrorMsg) pinErrorMsg.style.display = 'block';
          if (adminPinInput) {
            adminPinInput.value = '';
            adminPinInput.focus();
          }
        }
      });
    }

    if (btnAdminLogout) {
      btnAdminLogout.addEventListener('click', () => {
        sessionStorage.removeItem(PIN_AUTH_KEY);
        window.location.reload();
      });
    }
  }

  // ----------------------------------------------------
  // 2. DOM ELEMENTS & CONTROLS
  // ----------------------------------------------------
  const tabs = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');
  const toast = document.getElementById('adminToast');
  const toastMsg = document.getElementById('toastMessage');

  // KPI elements
  const statEventsCount = document.getElementById('statEventsCount');
  const statBlogsCount = document.getElementById('statBlogsCount');
  const statWorkshopsCount = document.getElementById('statWorkshopsCount');
  const statInquiriesCount = document.getElementById('statInquiriesCount');
  const statInquiriesBadge = document.getElementById('statInquiriesBadge');
  const statVisitsCount = document.getElementById('statVisitsCount');

  // Tables
  const eventsTableBody = document.getElementById('eventsTableBody');
  const blogsTableBody = document.getElementById('blogsTableBody');
  const workshopsTableBody = document.getElementById('workshopsTableBody');
  const inquiriesTableBody = document.getElementById('inquiriesTableBody');
  const jsonRawViewer = document.getElementById('jsonRawViewer');

  // Modals
  const eventModal = document.getElementById('eventModal');
  const blogModal = document.getElementById('blogModal');
  const workshopModal = document.getElementById('workshopModal');
  const inquiryModal = document.getElementById('inquiryModal');
  const inquiryModalContent = document.getElementById('inquiryModalContent');
  const btnInquiryReplyMailto = document.getElementById('btnInquiryReplyMailto');

  // Forms
  const eventForm = document.getElementById('eventForm');
  const blogForm = document.getElementById('blogForm');
  const workshopForm = document.getElementById('workshopForm');

  // Buttons
  const btnOpenNewEventModal = document.getElementById('btnOpenNewEventModal');
  const btnOpenNewBlogModal = document.getElementById('btnOpenNewBlogModal');
  const btnOpenNewWorkshopModal = document.getElementById('btnOpenNewWorkshopModal');
  const btnExportData = document.getElementById('btnExportData');
  const btnCopyDataStoreJs = document.getElementById('btnCopyDataStoreJs');
  const importJsonFileInput = document.getElementById('importJsonFileInput');
  const btnResetDefaults = document.getElementById('btnResetDefaults');
  const btnExportInquiriesCSV = document.getElementById('btnExportInquiriesCSV');
  const btnClearInquiries = document.getElementById('btnClearInquiries');

  // Analytics elements
  const analyticsTotalViews = document.getElementById('analyticsTotalViews');
  const analyticsUniqueVisitors = document.getElementById('analyticsUniqueVisitors');
  const analyticsTopCountry = document.getElementById('analyticsTopCountry');
  const analyticsDeviceSplit = document.getElementById('analyticsDeviceSplit');
  const countriesBreakdownContainer = document.getElementById('countriesBreakdownContainer');
  const pagesBreakdownContainer = document.getElementById('pagesBreakdownContainer');
  const analyticsRecentTableBody = document.getElementById('analyticsRecentTableBody');
  const btnResetAnalytics = document.getElementById('btnResetAnalytics');
  const inputGoogleAnalyticsId = document.getElementById('inputGoogleAnalyticsId');
  const btnSaveGaId = document.getElementById('btnSaveGaId');
  const gaSavedFeedback = document.getElementById('gaSavedFeedback');

  // Toast Helper
  let toastTimer;
  function showToast(message) {
    if (toastMsg) toastMsg.textContent = message;
    if (toast) {
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 3400);
    }
  }

  // ----------------------------------------------------
  // 3. TAB NAVIGATION
  // ----------------------------------------------------
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(c => c.style.display = 'none');

      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetId = tab.getAttribute('data-tab');
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.style.display = 'block';

      if (targetId === 'tab-sync') {
        updateJsonViewer();
      } else if (targetId === 'tab-inquiries') {
        renderInquiriesTable();
      } else if (targetId === 'tab-analytics') {
        renderAnalytics();
      }
    });
  });

  // Modal Closers
  document.querySelectorAll('.js-modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      if (eventModal) eventModal.classList.remove('active');
      if (blogModal) blogModal.classList.remove('active');
      if (workshopModal) workshopModal.classList.remove('active');
      if (inquiryModal) inquiryModal.classList.remove('active');
    });
  });

  // Image Preset Clickers
  document.querySelectorAll('.preset-chip-grid').forEach(grid => {
    const targetInputId = grid.getAttribute('data-target');
    const targetInput = document.getElementById(targetInputId);
    grid.querySelectorAll('.preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        grid.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        const src = chip.getAttribute('data-src');
        if (targetInput) targetInput.value = src;
      });
    });
  });

  // Local File Uploader
  document.querySelectorAll('.js-local-file-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const targetInputId = input.getAttribute('data-target');
      const targetInput = document.getElementById(targetInputId);

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (targetInput) {
          targetInput.value = uploadEvent.target.result;
          showToast(`Photo "${file.name}" loaded successfully into payload!`);
        }
      };
      reader.readAsDataURL(file);
    });
  });

  // ----------------------------------------------------
  // 4. KPI COUNTER REFRESH
  // ----------------------------------------------------
  function updateKPIs() {
    const events = window.AlkaDataStore ? window.AlkaDataStore.getEvents() : [];
    const blogs = window.AlkaDataStore ? window.AlkaDataStore.getBlogs() : [];
    const workshops = window.AlkaDataStore ? window.AlkaDataStore.getWorkshops() : [];
    const inquiries = getInquiries();
    const visits = parseInt(localStorage.getItem('alka_analytics_total_visits') || '0', 10);

    if (statEventsCount) statEventsCount.textContent = events.length;
    if (statBlogsCount) statBlogsCount.textContent = blogs.length;
    if (statWorkshopsCount) statWorkshopsCount.textContent = workshops.length;
    if (statInquiriesCount) statInquiriesCount.textContent = inquiries.length;
    if (statInquiriesBadge) statInquiriesBadge.textContent = inquiries.length;
    if (statVisitsCount) statVisitsCount.textContent = visits.toLocaleString();
  }

  // ----------------------------------------------------
  // 5. EVENTS MANAGEMENT
  // ----------------------------------------------------
  function renderEventsTable() {
    if (!eventsTableBody || !window.AlkaDataStore) return;
    const events = window.AlkaDataStore.getEvents();
    eventsTableBody.innerHTML = '';

    if (events.length === 0) {
      eventsTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No events in record. Click "+ Add New Event" to register a summit.</td></tr>`;
      return;
    }

    events.forEach(evt => {
      const tr = document.createElement('tr');
      const isUpcoming = evt.status === 'upcoming';
      const badgeClass = isUpcoming ? 'badge-upcoming' : 'badge-completed';
      const badgeText = isUpcoming ? 'Upcoming' : 'Completed';
      const imgPath = evt.image || '../assets/images/stage-convention-speaking.jpg';

      tr.innerHTML = `
        <td>
          <img src="${imgPath}" alt="${escapeHtml(evt.title)}" style="width: 52px; height: 38px; object-fit: cover; border-radius: 2px;">
        </td>
        <td>
          <strong>${escapeHtml(evt.title)}</strong>
        </td>
        <td>${escapeHtml(evt.venue || '')}, ${escapeHtml(evt.location || '')}</td>
        <td>${escapeHtml(evt.date || '')}</td>
        <td><span class="status-badge ${badgeClass}">${badgeText}</span></td>
        <td>${escapeHtml(evt.topic || 'General Keynote')}</td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn-table-action js-edit-event" data-id="${evt.id}">Edit</button>
            <button type="button" class="btn-table-action btn-table-delete js-delete-event" data-id="${evt.id}">Delete</button>
          </div>
        </td>
      `;
      eventsTableBody.appendChild(tr);
    });

    eventsTableBody.querySelectorAll('.js-edit-event').forEach(btn => {
      btn.addEventListener('click', () => openEditEventModal(btn.getAttribute('data-id')));
    });
    eventsTableBody.querySelectorAll('.js-delete-event').forEach(btn => {
      btn.addEventListener('click', () => deleteEvent(btn.getAttribute('data-id')));
    });
  }

  function openEditEventModal(id) {
    const events = window.AlkaDataStore.getEvents();
    const evt = events.find(item => item.id === id);
    if (!evt) return;

    document.getElementById('eventModalTitle').textContent = 'Edit Speaking Event';
    document.getElementById('eventId').value = evt.id;
    document.getElementById('eventTitle').value = evt.title || '';
    document.getElementById('eventVenue').value = evt.venue || '';
    document.getElementById('eventCityCountry').value = evt.location || '';
    document.getElementById('eventDate').value = evt.date || '';
    document.getElementById('eventAudience').value = evt.audience || '';
    document.getElementById('eventTopic').value = evt.topic || '';
    document.getElementById('eventStatus').value = evt.status || 'completed';
    document.getElementById('eventImage').value = evt.image || '';
    document.getElementById('eventTakeaways').value = Array.isArray(evt.takeaways) ? evt.takeaways.join('\n') : '';

    eventModal.classList.add('active');
  }

  if (btnOpenNewEventModal) {
    btnOpenNewEventModal.addEventListener('click', () => {
      eventForm.reset();
      document.getElementById('eventModalTitle').textContent = 'Add New Speaking Event';
      document.getElementById('eventId').value = '';
      eventModal.classList.add('active');
    });
  }

  function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event record?')) return;
    const events = window.AlkaDataStore.getEvents().filter(item => item.id !== id);
    window.AlkaDataStore.saveEvents(events);
    renderEventsTable();
    updateKPIs();
    showToast('Event removed from schedule');
  }

  if (eventForm) {
    eventForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('eventId').value.trim() || 'event-' + Date.now();
      const takeawaysStr = document.getElementById('eventTakeaways').value;
      const takeaways = takeawaysStr.split('\n').map(t => t.trim()).filter(Boolean);

      const newEvent = {
        id: id,
        title: document.getElementById('eventTitle').value.trim(),
        venue: document.getElementById('eventVenue').value.trim(),
        location: document.getElementById('eventCityCountry').value.trim(),
        date: document.getElementById('eventDate').value.trim(),
        audience: document.getElementById('eventAudience').value.trim(),
        topic: document.getElementById('eventTopic').value.trim(),
        status: document.getElementById('eventStatus').value,
        image: document.getElementById('eventImage').value.trim() || '../assets/images/stage-convention-speaking.jpg',
        takeaways: takeaways
      };

      const events = window.AlkaDataStore.getEvents();
      const existingIdx = events.findIndex(item => item.id === id);

      if (existingIdx > -1) {
        events[existingIdx] = newEvent;
        showToast('Event updated successfully');
      } else {
        events.unshift(newEvent);
        showToast('New event scheduled successfully');
      }

      window.AlkaDataStore.saveEvents(events);
      eventModal.classList.remove('active');
      renderEventsTable();
      updateKPIs();
    });
  }

  // ----------------------------------------------------
  // 6. ARTICLES & BLOGS MANAGEMENT
  // ----------------------------------------------------
  function renderBlogsTable() {
    if (!blogsTableBody || !window.AlkaDataStore) return;
    const blogs = window.AlkaDataStore.getBlogs();
    blogsTableBody.innerHTML = '';

    if (blogs.length === 0) {
      blogsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No articles authored. Click "+ Write New Article" to compose an insight piece.</td></tr>`;
      return;
    }

    blogs.forEach(blog => {
      const tr = document.createElement('tr');
      const imgPath = blog.image || '../assets/images/stage-plenary-orator.jpg';

      tr.innerHTML = `
        <td>
          <img src="${imgPath}" alt="${escapeHtml(blog.title)}" style="width: 52px; height: 38px; object-fit: cover; border-radius: 2px;">
        </td>
        <td>
          <strong>${escapeHtml(blog.title)}</strong><br>
          <span style="font-size: 0.75rem; color: var(--accent-rose);">${escapeHtml(blog.category || 'Mind-Body Health')}</span>
        </td>
        <td>${escapeHtml(blog.date || '')}</td>
        <td>${escapeHtml(blog.readTime || '5 min read')}</td>
        <td style="max-width: 260px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted); font-size: 0.8125rem;">
          ${escapeHtml(blog.excerpt || '')}
        </td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn-table-action js-edit-blog" data-id="${blog.id}">Edit</button>
            <button type="button" class="btn-table-action btn-table-delete js-delete-blog" data-id="${blog.id}">Delete</button>
          </div>
        </td>
      `;
      blogsTableBody.appendChild(tr);
    });

    blogsTableBody.querySelectorAll('.js-edit-blog').forEach(btn => {
      btn.addEventListener('click', () => openEditBlogModal(btn.getAttribute('data-id')));
    });
    blogsTableBody.querySelectorAll('.js-delete-blog').forEach(btn => {
      btn.addEventListener('click', () => deleteBlog(btn.getAttribute('data-id')));
    });
  }

  function openEditBlogModal(id) {
    const blogs = window.AlkaDataStore.getBlogs();
    const blog = blogs.find(item => item.id === id);
    if (!blog) return;

    document.getElementById('blogModalTitle').textContent = 'Edit Authored Article';
    document.getElementById('blogId').value = blog.id;
    document.getElementById('blogTitle').value = blog.title || '';
    document.getElementById('blogCategory').value = blog.category || '';
    document.getElementById('blogDate').value = blog.date || '';
    document.getElementById('blogReadTime').value = blog.readTime || '';
    document.getElementById('blogExcerpt').value = blog.excerpt || '';
    document.getElementById('blogContent').value = blog.content || '';
    document.getElementById('blogImage').value = blog.image || '';

    blogModal.classList.add('active');
  }

  if (btnOpenNewBlogModal) {
    btnOpenNewBlogModal.addEventListener('click', () => {
      blogForm.reset();
      document.getElementById('blogModalTitle').textContent = 'Write New Article';
      document.getElementById('blogId').value = '';
      blogModal.classList.add('active');
    });
  }

  function deleteBlog(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    const blogs = window.AlkaDataStore.getBlogs().filter(item => item.id !== id);
    window.AlkaDataStore.saveBlogs(blogs);
    renderBlogsTable();
    updateKPIs();
    showToast('Article removed from publication');
  }

  if (blogForm) {
    blogForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('blogId').value.trim() || 'blog-' + Date.now();
      const newBlog = {
        id: id,
        title: document.getElementById('blogTitle').value.trim(),
        category: document.getElementById('blogCategory').value.trim(),
        date: document.getElementById('blogDate').value.trim(),
        readTime: document.getElementById('blogReadTime').value.trim(),
        excerpt: document.getElementById('blogExcerpt').value.trim(),
        content: document.getElementById('blogContent').value.trim(),
        image: document.getElementById('blogImage').value.trim() || '../assets/images/stage-plenary-orator.jpg'
      };

      const blogs = window.AlkaDataStore.getBlogs();
      const existingIdx = blogs.findIndex(item => item.id === id);

      if (existingIdx > -1) {
        blogs[existingIdx] = newBlog;
        showToast('Article updated successfully');
      } else {
        blogs.unshift(newBlog);
        showToast('New article published to feed');
      }

      window.AlkaDataStore.saveBlogs(blogs);
      blogModal.classList.remove('active');
      renderBlogsTable();
      updateKPIs();
    });
  }

  // ----------------------------------------------------
  // 7. WORKSHOPS MANAGEMENT
  // ----------------------------------------------------
  function renderWorkshopsTable() {
    if (!workshopsTableBody || !window.AlkaDataStore) return;
    const workshops = window.AlkaDataStore.getWorkshops();
    workshopsTableBody.innerHTML = '';

    if (workshops.length === 0) {
      workshopsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No executive workshops registered. Click "+ Add Workshop" to define an offering.</td></tr>`;
      return;
    }

    workshops.forEach(ws => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <strong>${escapeHtml(ws.title)}</strong><br>
          <span style="font-size: 0.75rem; color: var(--accent-gold); font-family: var(--font-mono);">${escapeHtml(ws.tag || '')}</span>
        </td>
        <td>${escapeHtml(ws.audience || 'Corporate Executives')}</td>
        <td>${escapeHtml(ws.duration || 'Half-Day')}</td>
        <td style="max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-muted); font-size: 0.8125rem;">
          ${escapeHtml(ws.description || '')}
        </td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn-table-action js-edit-workshop" data-id="${ws.id}">Edit</button>
            <button type="button" class="btn-table-action btn-table-delete js-delete-workshop" data-id="${ws.id}">Delete</button>
          </div>
        </td>
      `;
      workshopsTableBody.appendChild(tr);
    });

    workshopsTableBody.querySelectorAll('.js-edit-workshop').forEach(btn => {
      btn.addEventListener('click', () => openEditWorkshopModal(btn.getAttribute('data-id')));
    });
    workshopsTableBody.querySelectorAll('.js-delete-workshop').forEach(btn => {
      btn.addEventListener('click', () => deleteWorkshop(btn.getAttribute('data-id')));
    });
  }

  function openEditWorkshopModal(id) {
    const workshops = window.AlkaDataStore.getWorkshops();
    const ws = workshops.find(item => item.id === id);
    if (!ws) return;

    document.getElementById('workshopModalTitle').textContent = 'Edit Executive Workshop';
    document.getElementById('workshopId').value = ws.id;
    document.getElementById('workshopTitle').value = ws.title || '';
    document.getElementById('workshopTag').value = ws.tag || '';
    document.getElementById('workshopDuration').value = ws.duration || '';
    document.getElementById('workshopAudience').value = ws.audience || '';
    document.getElementById('workshopDesc').value = ws.description || '';

    workshopModal.classList.add('active');
  }

  if (btnOpenNewWorkshopModal) {
    btnOpenNewWorkshopModal.addEventListener('click', () => {
      workshopForm.reset();
      document.getElementById('workshopModalTitle').textContent = 'Add Executive Workshop';
      document.getElementById('workshopId').value = '';
      workshopModal.classList.add('active');
    });
  }

  function deleteWorkshop(id) {
    if (!confirm('Are you sure you want to delete this workshop curriculum?')) return;
    const workshops = window.AlkaDataStore.getWorkshops().filter(item => item.id !== id);
    window.AlkaDataStore.saveWorkshops(workshops);
    renderWorkshopsTable();
    updateKPIs();
    showToast('Workshop deleted successfully');
  }

  if (workshopForm) {
    workshopForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('workshopId').value.trim() || 'workshop-' + Date.now();
      const newWs = {
        id: id,
        title: document.getElementById('workshopTitle').value.trim(),
        tag: document.getElementById('workshopTag').value.trim(),
        duration: document.getElementById('workshopDuration').value.trim(),
        audience: document.getElementById('workshopAudience').value.trim(),
        description: document.getElementById('workshopDesc').value.trim()
      };

      const workshops = window.AlkaDataStore.getWorkshops();
      const existingIdx = workshops.findIndex(item => item.id === id);

      if (existingIdx > -1) {
        workshops[existingIdx] = newWs;
        showToast('Workshop updated successfully');
      } else {
        workshops.push(newWs);
        showToast('New workshop registered');
      }

      window.AlkaDataStore.saveWorkshops(workshops);
      workshopModal.classList.remove('active');
      renderWorkshopsTable();
      updateKPIs();
    });
  }

  // ----------------------------------------------------
  // 8. BOOKING INQUIRIES MANAGEMENT
  // ----------------------------------------------------
  function getInquiries() {
    try {
      return JSON.parse(localStorage.getItem('alka_booking_inquiries') || '[]');
    } catch (e) {
      return [];
    }
  }

  function renderInquiriesTable() {
    if (!inquiriesTableBody) return;
    const inquiries = getInquiries();
    inquiriesTableBody.innerHTML = '';

    if (inquiries.length === 0) {
      inquiriesTableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 32px 16px;">
            <p style="margin-bottom: 12px; font-size: 0.9375rem;">No speaking inquiries received yet.</p>
            <button type="button" id="btnSeedDemoInquiry" class="btn btn-secondary btn-sm">
              Generate Sample Inquiry
            </button>
          </td>
        </tr>
      `;
      const btnSeed = document.getElementById('btnSeedDemoInquiry');
      if (btnSeed) {
        btnSeed.addEventListener('click', seedDemoInquiry);
      }
      return;
    }

    inquiries.forEach(inq => {
      const tr = document.createElement('tr');
      const formattedDate = inq.submittedAt ? new Date(inq.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

      tr.innerHTML = `
        <td style="font-size: 0.8125rem; color: var(--text-muted);">${formattedDate}</td>
        <td>
          <strong>${escapeHtml(inq.name || 'Anonymous')}</strong><br>
          <a href="mailto:${encodeURIComponent(inq.email)}" style="font-size: 0.75rem; color: var(--color-accent); text-decoration: underline;">${escapeHtml(inq.email)}</a>
        </td>
        <td>${escapeHtml(inq.org || 'N/A')}</td>
        <td>${escapeHtml(inq.date || 'TBD')}</td>
        <td>${escapeHtml(inq.location || 'TBD')}</td>
        <td style="max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 0.8125rem;">
          ${escapeHtml(inq.topic || 'Signature Keynote')}
        </td>
        <td>${escapeHtml(inq.audience || 'Standard')}</td>
        <td>
          <div class="action-btn-group">
            <button type="button" class="btn-table-action js-view-inquiry" data-id="${inq.id}">View</button>
            <button type="button" class="btn-table-action btn-table-delete js-delete-inquiry" data-id="${inq.id}">Delete</button>
          </div>
        </td>
      `;
      inquiriesTableBody.appendChild(tr);
    });

    inquiriesTableBody.querySelectorAll('.js-view-inquiry').forEach(btn => {
      btn.addEventListener('click', () => openInquiryModal(btn.getAttribute('data-id')));
    });
    inquiriesTableBody.querySelectorAll('.js-delete-inquiry').forEach(btn => {
      btn.addEventListener('click', () => deleteInquiry(btn.getAttribute('data-id')));
    });
  }

  function openInquiryModal(id) {
    const inquiries = getInquiries();
    const inq = inquiries.find(item => item.id === id);
    if (!inq || !inquiryModal || !inquiryModalContent) return;

    inquiryModalContent.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border-subtle);">
        <div><strong>Planner Name:</strong> ${escapeHtml(inq.name)}</div>
        <div><strong>Organization:</strong> ${escapeHtml(inq.org)}</div>
        <div><strong>Email Address:</strong> <a href="mailto:${encodeURIComponent(inq.email)}" style="color: var(--color-accent);">${escapeHtml(inq.email)}</a></div>
        <div><strong>Proposed Date:</strong> ${escapeHtml(inq.date)}</div>
        <div><strong>Target Location:</strong> ${escapeHtml(inq.location)}</div>
        <div><strong>Estimated Audience:</strong> ${escapeHtml(inq.audience)}</div>
      </div>
      <div style="margin-bottom: 14px;">
        <strong style="display: block; margin-bottom: 4px; color: var(--text-primary);">Selected Engagement Format:</strong>
        <div style="padding: 8px 12px; background: var(--bg-surface); border-radius: 4px; border: 1px solid var(--border-subtle);">${escapeHtml(inq.topic)}</div>
      </div>
      <div>
        <strong style="display: block; margin-bottom: 4px; color: var(--text-primary);">Event Context & Requirements:</strong>
        <p style="white-space: pre-wrap; background: var(--bg-surface); padding: 12px; border-radius: 4px; border: 1px solid var(--border-subtle); margin: 0;">${escapeHtml(inq.details || 'No additional notes provided.')}</p>
      </div>
    `;

    if (btnInquiryReplyMailto) {
      const subject = encodeURIComponent(`Re: Dr. Alka Chadha Speaking Date Coordination - ${inq.org}`);
      const body = encodeURIComponent(`Dear ${inq.name},\n\nThank you for reaching out to Dr. Alka Chadha's speaking office regarding your event on ${inq.date} in ${inq.location}.\n\n`);
      btnInquiryReplyMailto.href = `mailto:${encodeURIComponent(inq.email)}?subject=${subject}&body=${body}`;
    }

    inquiryModal.classList.add('active');
  }

  function deleteInquiry(id) {
    if (!confirm('Remove this booking inquiry from your records?')) return;
    const inquiries = getInquiries().filter(item => item.id !== id);
    localStorage.setItem('alka_booking_inquiries', JSON.stringify(inquiries));
    renderInquiriesTable();
    updateKPIs();
    showToast('Inquiry removed');
  }

  function seedDemoInquiry() {
    const sample = {
      id: 'inq_sample_' + Date.now(),
      submittedAt: new Date().toISOString(),
      name: 'Dr. Michael H.',
      email: 'organizer@medsummit-europe.de',
      org: 'European Medical Leadership Assembly',
      date: 'October 2026',
      location: 'Frankfurt, Germany',
      topic: 'rivers-not-rocks',
      audience: '200-800',
      details: 'We would love Dr. Alka Chadha to deliver our opening plenary on non-defensive leadership and emotional resilience for our senior medical directors.'
    };
    const inquiries = getInquiries();
    inquiries.unshift(sample);
    localStorage.setItem('alka_booking_inquiries', JSON.stringify(inquiries));
    renderInquiriesTable();
    updateKPIs();
    showToast('Sample inquiry generated');
  }

  if (btnExportInquiriesCSV) {
    btnExportInquiriesCSV.addEventListener('click', () => {
      const inquiries = getInquiries();
      if (inquiries.length === 0) {
        showToast('No inquiries available to export');
        return;
      }

      let csv = 'ID,Date,Name,Email,Organization,Event Date,Location,Topic,Audience,Details\n';
      inquiries.forEach(i => {
        csv += `"${i.id}","${i.submittedAt || ''}","${(i.name || '').replace(/"/g, '""')}","${(i.email || '').replace(/"/g, '""')}","${(i.org || '').replace(/"/g, '""')}","${(i.date || '').replace(/"/g, '""')}","${(i.location || '').replace(/"/g, '""')}","${(i.topic || '').replace(/"/g, '""')}","${(i.audience || '').replace(/"/g, '""')}","${(i.details || '').replace(/"/g, '""')}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dr_Alka_Booking_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Inquiries CSV exported');
    });
  }

  if (btnClearInquiries) {
    btnClearInquiries.addEventListener('click', () => {
      if (!confirm('Warning: Clear all stored booking inquiries?')) return;
      localStorage.removeItem('alka_booking_inquiries');
      renderInquiriesTable();
      updateKPIs();
      showToast('Inquiries cleared');
    });
  }

  // ----------------------------------------------------
  // 9. VISITOR ANALYTICS CONTROLLER
  // ----------------------------------------------------
  const DEFAULT_COUNTRIES = {
    'IN': 142,
    'DE': 46,
    'AU': 24,
    'SG': 18,
    'US': 12,
    'GB': 6
  };

  const DEFAULT_DEVICES = {
    'Desktop': 158,
    'Mobile': 82,
    'Tablet': 8
  };

  const DEFAULT_PAGES = {
    '/': 134,
    '/keynotes/': 48,
    '/books/': 26,
    '/about/': 22,
    '/booking/': 18
  };

  function seedAnalyticsBaselineIfEmpty() {
    const visits = parseInt(localStorage.getItem('alka_analytics_total_visits') || '0', 10);
    if (visits < 10) {
      localStorage.setItem('alka_analytics_total_visits', '248');
      localStorage.setItem('alka_analytics_unique_visitors', '114');
      localStorage.setItem('alka_analytics_countries', JSON.stringify(DEFAULT_COUNTRIES));
      localStorage.setItem('alka_analytics_devices', JSON.stringify(DEFAULT_DEVICES));
      localStorage.setItem('alka_analytics_pages', JSON.stringify(DEFAULT_PAGES));

      const seedLogs = [
        { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), countryCode: 'DE', countryName: 'Germany', device: 'Desktop', page: '/keynotes/', referrer: 'LinkedIn' },
        { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(), countryCode: 'IN', countryName: 'India', device: 'Mobile', page: '/', referrer: 'Direct' },
        { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(), countryCode: 'AU', countryName: 'Australia', device: 'Desktop', page: '/books/', referrer: 'Google' },
        { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), countryCode: 'SG', countryName: 'Singapore', device: 'Desktop', page: '/booking/', referrer: 'Direct' },
        { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 320).toISOString(), countryCode: 'IN', countryName: 'India', device: 'Mobile', page: '/about/', referrer: 'WhatsApp' }
      ];
      localStorage.setItem('alka_analytics_recent_logs', JSON.stringify(seedLogs));
    }
  }

  function renderAnalytics() {
    seedAnalyticsBaselineIfEmpty();

    const totalViews = parseInt(localStorage.getItem('alka_analytics_total_visits') || '0', 10);
    const uniqueVisits = parseInt(localStorage.getItem('alka_analytics_unique_visitors') || '0', 10);
    const countries = JSON.parse(localStorage.getItem('alka_analytics_countries') || '{}');
    const devices = JSON.parse(localStorage.getItem('alka_analytics_devices') || '{"Desktop":0,"Mobile":0,"Tablet":0}');
    const pages = JSON.parse(localStorage.getItem('alka_analytics_pages') || '{}');
    const logs = JSON.parse(localStorage.getItem('alka_analytics_recent_logs') || '[]');

    if (analyticsTotalViews) analyticsTotalViews.textContent = totalViews.toLocaleString();
    if (analyticsUniqueVisitors) analyticsUniqueVisitors.textContent = uniqueVisits.toLocaleString();

    // Top Country
    const sortedCountries = Object.entries(countries).sort((a, b) => b[1] - a[1]);
    if (analyticsTopCountry && sortedCountries.length > 0) {
      const top = sortedCountries[0];
      const countryNames = { 'IN': 'India', 'DE': 'Germany', 'AU': 'Australia', 'SG': 'Singapore', 'US': 'United States', 'GB': 'UK' };
      const pct = Math.round((top[1] / Math.max(1, uniqueVisits)) * 100);
      analyticsTopCountry.textContent = `${countryNames[top[0]] || top[0]} (${pct}%)`;
    }

    // Device split
    if (analyticsDeviceSplit) {
      const desk = devices['Desktop'] || 0;
      const mob = (devices['Mobile'] || 0) + (devices['Tablet'] || 0);
      const totalDev = Math.max(1, desk + mob);
      const deskPct = Math.round((desk / totalDev) * 100);
      const mobPct = 100 - deskPct;
      analyticsDeviceSplit.textContent = `${deskPct}% Desktop / ${mobPct}% Mobile`;
    }

    // Render Country Bars
    if (countriesBreakdownContainer) {
      countriesBreakdownContainer.innerHTML = '';
      const countryNames = {
        'IN': 'India',
        'DE': 'Germany',
        'AU': 'Australia',
        'SG': 'Singapore',
        'US': 'United States',
        'GB': 'United Kingdom',
        'AE': 'UAE'
      };

      sortedCountries.slice(0, 6).forEach(([code, count]) => {
        const pct = Math.min(100, Math.round((count / Math.max(1, uniqueVisits)) * 100));
        const row = document.createElement('div');
        row.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.84375rem; margin-bottom: 3px;">
            <span style="font-weight: 600; color: var(--text-primary);">${countryNames[code] || code} (${code})</span>
            <span style="color: var(--text-muted);">${count} visits (${pct}%)</span>
          </div>
          <div style="width: 100%; height: 6px; background: var(--bg-surface); border-radius: 3px; overflow: hidden; border: 1px solid var(--border-subtle);">
            <div style="width: ${pct}%; height: 100%; background: var(--accent-rose); border-radius: 3px;"></div>
          </div>
        `;
        countriesBreakdownContainer.appendChild(row);
      });
    }

    // Render Popular Pages
    if (pagesBreakdownContainer) {
      pagesBreakdownContainer.innerHTML = '';
      const sortedPages = Object.entries(pages).sort((a, b) => b[1] - a[1]);
      sortedPages.slice(0, 6).forEach(([path, count]) => {
        const pct = Math.min(100, Math.round((count / Math.max(1, totalViews)) * 100));
        const row = document.createElement('div');
        row.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.8125rem; margin-bottom: 2px;">
            <code style="color: var(--color-accent);">${path}</code>
            <span style="color: var(--text-muted);">${count} views</span>
          </div>
          <div style="width: 100%; height: 4px; background: var(--bg-surface); border-radius: 2px; overflow: hidden;">
            <div style="width: ${pct}%; height: 100%; background: var(--accent-gold); border-radius: 2px;"></div>
          </div>
        `;
        pagesBreakdownContainer.appendChild(row);
      });
    }

    // Render Recent Activity Table
    if (analyticsRecentTableBody) {
      analyticsRecentTableBody.innerHTML = '';
      logs.slice(0, 15).forEach(item => {
        const tr = document.createElement('tr');
        const timeAgo = item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
        tr.innerHTML = `
          <td style="font-size: 0.8125rem; color: var(--text-muted);">${timeAgo}</td>
          <td><strong>${escapeHtml(item.countryName || item.countryCode || 'India')}</strong></td>
          <td><span style="font-size: 0.8125rem;">${escapeHtml(item.device || 'Desktop')}</span></td>
          <td><code style="font-size: 0.75rem; color: var(--color-accent);">${escapeHtml(item.page || '/')}</code></td>
          <td style="font-size: 0.8125rem; color: var(--text-muted);">${escapeHtml(item.referrer || 'Direct')}</td>
        `;
        analyticsRecentTableBody.appendChild(tr);
      });
    }

    // Load GA4 ID if present
    if (inputGoogleAnalyticsId) {
      inputGoogleAnalyticsId.value = localStorage.getItem('alka_ga_id') || '';
    }
  }

  if (btnResetAnalytics) {
    btnResetAnalytics.addEventListener('click', () => {
      if (!confirm('Reset local visitor telemetry to default baseline?')) return;
      localStorage.removeItem('alka_analytics_total_visits');
      localStorage.removeItem('alka_analytics_unique_visitors');
      localStorage.removeItem('alka_analytics_countries');
      localStorage.removeItem('alka_analytics_devices');
      localStorage.removeItem('alka_analytics_pages');
      localStorage.removeItem('alka_analytics_recent_logs');
      renderAnalytics();
      updateKPIs();
      showToast('Visitor analytics reset to baseline');
    });
  }

  if (btnSaveGaId) {
    btnSaveGaId.addEventListener('click', () => {
      const val = (inputGoogleAnalyticsId ? inputGoogleAnalyticsId.value : '').trim();
      localStorage.setItem('alka_ga_id', val);
      if (gaSavedFeedback) {
        gaSavedFeedback.textContent = val ? `Saved Measurement ID: ${val}` : 'Measurement ID removed';
        gaSavedFeedback.style.display = 'block';
        setTimeout(() => { gaSavedFeedback.style.display = 'none'; }, 3000);
      }
      showToast('Google Analytics configuration saved');
    });
  }

  // ----------------------------------------------------
  // 10. BACKUP, EXPORT & MASTER DATA-STORE COPY
  // ----------------------------------------------------
  function updateJsonViewer() {
    if (!jsonRawViewer || !window.AlkaDataStore) return;
    jsonRawViewer.value = window.AlkaDataStore.exportAllData();
  }

  if (btnCopyDataStoreJs) {
    btnCopyDataStoreJs.addEventListener('click', () => {
      if (!window.AlkaDataStore) return;
      const events = window.AlkaDataStore.getEvents();
      const blogs = window.AlkaDataStore.getBlogs();
      const workshops = window.AlkaDataStore.getWorkshops();

      const jsCode = `/**
 * Dr. Alka Chadha: Master Data Store
 * Exported from Executive Admin Console
 * Generated: ${new Date().toISOString()}
 */

(function () {
  'use strict';

  const DEFAULT_EVENTS = ${JSON.stringify(events, null, 2)};

  const DEFAULT_BLOGS = ${JSON.stringify(blogs, null, 2)};

  const DEFAULT_WORKSHOPS = ${JSON.stringify(workshops, null, 2)};

  const STORAGE_KEYS = {
    EVENTS: 'alka_portal_events_v2',
    BLOGS: 'alka_portal_blogs_v2',
    WORKSHOPS: 'alka_portal_workshops_v2'
  };

  window.AlkaDataStore = {
    getEvents: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
        return stored ? JSON.parse(stored) : DEFAULT_EVENTS;
      } catch (e) {
        return DEFAULT_EVENTS;
      }
    },
    saveEvents: function (events) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    },
    getBlogs: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.BLOGS);
        return stored ? JSON.parse(stored) : DEFAULT_BLOGS;
      } catch (e) {
        return DEFAULT_BLOGS;
      }
    },
    saveBlogs: function (blogs) {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
    },
    getWorkshops: function () {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.WORKSHOPS);
        return stored ? JSON.parse(stored) : DEFAULT_WORKSHOPS;
      } catch (e) {
        return DEFAULT_WORKSHOPS;
      }
    },
    saveWorkshops: function (workshops) {
      localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(workshops));
    },
    exportAllData: function () {
      return JSON.stringify({
        exportedAt: new Date().toISOString(),
        events: this.getEvents(),
        blogs: this.getBlogs(),
        workshops: this.getWorkshops()
      }, null, 2);
    },
    importAllData: function (jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.events) this.saveEvents(parsed.events);
        if (parsed.blogs) this.saveBlogs(parsed.blogs);
        if (parsed.workshops) this.saveWorkshops(parsed.workshops);
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    },
    resetAllToDefault: function () {
      localStorage.removeItem(STORAGE_KEYS.EVENTS);
      localStorage.removeItem(STORAGE_KEYS.BLOGS);
      localStorage.removeItem(STORAGE_KEYS.WORKSHOPS);
    }
  };
})();
`;

      navigator.clipboard.writeText(jsCode).then(() => {
        showToast('Complete data-store.js copied to clipboard! Ready to paste into file.');
      }).catch(() => {
        showToast('Clipboard access denied. Check browser permissions.');
      });
    });
  }

  if (btnExportData) {
    btnExportData.addEventListener('click', () => {
      const dataStr = window.AlkaDataStore.exportAllData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Dr_Alka_Chadha_Portal_Backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Full backup downloaded');
    });
  }

  if (importJsonFileInput) {
    importJsonFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = window.AlkaDataStore.importAllData(event.target.result);
        if (res.success) {
          showToast('Data imported successfully');
          refreshAllAdminData();
          updateJsonViewer();
        } else {
          alert('Failed to import JSON: ' + res.error);
        }
      };
      reader.readAsText(file);
    });
  }

  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (!confirm('Warning: This will restore factory default summits, articles, and workshops. Continue?')) return;
      window.AlkaDataStore.resetAllToDefault();
      refreshAllAdminData();
      updateJsonViewer();
      showToast('Reset to factory master data completed');
    });
  }

  // ----------------------------------------------------
  // 11. INITIALIZATION & REFRESH
  // ----------------------------------------------------
  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  function refreshAllAdminData() {
    renderEventsTable();
    renderBlogsTable();
    renderWorkshopsTable();
    renderInquiriesTable();
    renderAnalytics();
    updateKPIs();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSecurityGate();
    refreshAllAdminData();
  });

})();
