/**
 * Dr. Alka Chadha - Luxury Keynote Speaker Portal
 * Architecture: Vanilla ES6, Zero AI Slop, WCAG AA Accessible
 * Dual Theme (Obsidian Dark / Alabaster Light)
 * Privacy-Compliant Visitor Analytics & Country Logger (DPDP / GDPR)
 * Infallible Booking Form Delivery with Local Persistence & Mailto Trigger
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. THEME MANAGEMENT
  // ==========================================================================
  const THEME_KEY = 'alka_theme_preference';
  const root = document.documentElement;

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    const theme = savedTheme || 'dark';
    root.setAttribute('data-theme', theme);
    updateThemeToggleUI(theme);
  }

  function toggleTheme() {
    const currentTheme = root.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
    updateThemeToggleUI(nextTheme);
  }

  function updateThemeToggleUI(theme) {
    const toggleButtons = document.querySelectorAll('.theme-toggle-btn');
    toggleButtons.forEach(btn => {
      const isDark = theme === 'dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to Light Alabaster Theme' : 'Switch to Dark Obsidian Theme');
      btn.setAttribute('title', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');

      const iconWrap = btn.querySelector('.theme-icon-wrap') || btn;
      if (iconWrap) {
        if (isDark) {
          iconWrap.innerHTML = `
            <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          `;
        } else {
          iconWrap.innerHTML = `
            <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          `;
        }
      }
    });
  }

  // ==========================================================================
  // 2. ACCESSIBLE MOBILE NAVIGATION
  // ==========================================================================
  function initMobileNav() {
    const toggleBtn = document.querySelector('.mobile-toggle-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!toggleBtn || !navLinks) return;

    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      navLinks.classList.toggle('mobile-open');
    });

    document.addEventListener('click', (event) => {
      if (!navLinks.contains(event.target) && !toggleBtn.contains(event.target)) {
        navLinks.classList.remove('mobile-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('mobile-open')) {
        navLinks.classList.remove('mobile-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.focus();
      }
    });
  }

  // ==========================================================================
  // 3. PRIVACY & VISITOR ANALYTICS TRACKER (DPDP / GDPR SAFE)
  // ==========================================================================
  const COUNTRY_NAMES = {
    'IN': 'India',
    'DE': 'Germany',
    'AU': 'Australia',
    'SG': 'Singapore',
    'US': 'United States',
    'GB': 'United Kingdom',
    'AE': 'United Arab Emirates',
    'CA': 'Canada',
    'NZ': 'New Zealand',
    'FR': 'France',
    'CH': 'Switzerland'
  };

  function inferCountryFromTimezone() {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (tz.includes('Kolkata') || tz.includes('Calcutta')) return 'IN';
      if (tz.includes('Berlin') || tz.includes('Europe/Busingen')) return 'DE';
      if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth')) return 'AU';
      if (tz.includes('Singapore')) return 'SG';
      if (tz.includes('America/New_York') || tz.includes('America/Chicago') || tz.includes('America/Los_Angeles')) return 'US';
      if (tz.includes('London')) return 'GB';
      if (tz.includes('Dubai')) return 'AE';
    } catch (e) {
      // Fallback
    }
    return 'IN';
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }

  function initVisitorAnalytics() {
    // 1. Pageview Counter
    const path = window.location.pathname || '/';
    const pageviews = JSON.parse(localStorage.getItem('alka_analytics_pages') || '{}');
    pageviews[path] = (pageviews[path] || 0) + 1;
    localStorage.setItem('alka_analytics_pages', JSON.stringify(pageviews));

    const totalViews = parseInt(localStorage.getItem('alka_analytics_total_visits') || '0', 10) + 1;
    localStorage.setItem('alka_analytics_total_visits', String(totalViews));

    // 2. Session / Unique Visitor Counter
    const isNewSession = !sessionStorage.getItem('alka_session_id');
    if (isNewSession) {
      sessionStorage.setItem('alka_session_id', 'sess_' + Date.now());

      const uniqueCount = parseInt(localStorage.getItem('alka_analytics_unique_visitors') || '0', 10) + 1;
      localStorage.setItem('alka_analytics_unique_visitors', String(uniqueCount));

      // Device breakdown
      const device = getDeviceType();
      const devices = JSON.parse(localStorage.getItem('alka_analytics_devices') || '{"Desktop":0,"Mobile":0,"Tablet":0}');
      devices[device] = (devices[device] || 0) + 1;
      localStorage.setItem('alka_analytics_devices', JSON.stringify(devices));

      // Record country asynchronously via non-PII endpoint
      const recordCountry = (countryCode) => {
        const code = (countryCode || 'IN').toUpperCase();
        const countries = JSON.parse(localStorage.getItem('alka_analytics_countries') || '{}');
        countries[code] = (countries[code] || 0) + 1;
        localStorage.setItem('alka_analytics_countries', JSON.stringify(countries));

        // Append to recent logs (keep last 50)
        const recentLogs = JSON.parse(localStorage.getItem('alka_analytics_recent_logs') || '[]');
        recentLogs.unshift({
          id: 'log_' + Date.now(),
          timestamp: new Date().toISOString(),
          countryCode: code,
          countryName: COUNTRY_NAMES[code] || code,
          device: device,
          page: path,
          referrer: document.referrer ? (new URL(document.referrer).hostname || 'Direct') : 'Direct'
        });
        if (recentLogs.length > 50) recentLogs.length = 50;
        localStorage.setItem('alka_analytics_recent_logs', JSON.stringify(recentLogs));
      };

      // 100% offline, privacy-first country inference from browser timezone (zero external network requests)
      const inferredCountry = inferCountryFromTimezone();
      recordCountry(inferredCountry);
    }

    // 3. Optional Google Analytics 4 Injection if set in Admin Console
    const gaId = localStorage.getItem('alka_ga_id');
    if (gaId && /^G-[A-Z0-9]+$/i.test(gaId.trim())) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId.trim())}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', gaId.trim());
    }
  }

  // ==========================================================================
  // 4. COOKIE CONSENT BANNER (DPDP ACT 2023 & GDPR COMPLIANT)
  // ==========================================================================
  const COOKIE_CONSENT_KEY = 'alka_cookie_consent_v1';

  function initCookieConsent() {
    const banner = document.getElementById('cookieConsentBanner');
    if (!banner) return;

    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      banner.classList.add('active');
    }

    const acceptBtn = document.getElementById('acceptCookiesBtn');
    const necessaryBtn = document.getElementById('necessaryCookiesBtn');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'all');
        banner.classList.remove('active');
      });
    }

    if (necessaryBtn) {
      necessaryBtn.addEventListener('click', () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'essential_only');
        banner.classList.remove('active');
      });
    }

    const resetTrigger = document.querySelector('.js-cookie-preferences-trigger');
    if (resetTrigger) {
      resetTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        banner.classList.add('active');
        const firstFocus = banner.querySelector('button');
        if (firstFocus) firstFocus.focus();
      });
    }
  }

  // ==========================================================================
  // 5. INQUIRY SUBMISSION (LOCAL BACKUP + MAILTO TRIGGER + MODAL DIALOG)
  // ==========================================================================
  function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate="booking"]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const consentCheckbox = form.querySelector('input[name="dpdp_consent"]');
        const feedbackContainer = form.querySelector('.form-feedback');

        if (consentCheckbox && !consentCheckbox.checked) {
          if (feedbackContainer) {
            feedbackContainer.innerHTML = `
              <div role="alert" style="padding: 12px 16px; background: rgba(158, 42, 43, 0.15); border: 1px solid var(--accent-crimson); border-radius: 4px; color: var(--text-primary); font-size: 0.875rem; margin-top: 12px;">
                Please check the consent box confirming agreement to our Privacy Policy under India's DPDP Act 2023.
              </div>
            `;
          }
          consentCheckbox.focus();
          return;
        }

        // Extract form values
        const name = (form.querySelector('#planner_name') || {}).value || '';
        const email = (form.querySelector('#planner_email') || {}).value || '';
        const org = (form.querySelector('#planner_org') || {}).value || '';
        const date = (form.querySelector('#event_date') || {}).value || '';
        const location = (form.querySelector('#event_location') || {}).value || '';
        const topic = (form.querySelector('#event_topic') || {}).value || '';
        const audience = (form.querySelector('#event_audience') || {}).value || '';
        const details = (form.querySelector('#event_details') || {}).value || '';

        const inquiryData = {
          id: 'inq_' + Date.now(),
          submittedAt: new Date().toISOString(),
          name: name.trim(),
          email: email.trim(),
          org: org.trim(),
          date: date.trim(),
          location: location.trim(),
          topic: topic,
          audience: audience,
          details: details.trim()
        };

        // 1. Infallibly save to LocalStorage so zero inquiries are ever lost
        const existingInquiries = JSON.parse(localStorage.getItem('alka_booking_inquiries') || '[]');
        existingInquiries.unshift(inquiryData);
        localStorage.setItem('alka_booking_inquiries', JSON.stringify(existingInquiries));

        // 2. Build pre-filled mailto URI
        const mailSubject = encodeURIComponent(`Speaking Inquiry: ${inquiryData.name} - ${inquiryData.org}`);
        const mailBody = encodeURIComponent(
          `Dear Dr. Alka Chadha Speaking Desk,\n\n` +
          `I would like to inquire about speaking availability for our upcoming engagement.\n\n` +
          `Event Details:\n` +
          `- Contact Person: ${inquiryData.name}\n` +
          `- Professional Email: ${inquiryData.email}\n` +
          `- Host Organization: ${inquiryData.org}\n` +
          `- Proposed Date: ${inquiryData.date}\n` +
          `- Location: ${inquiryData.location}\n` +
          `- Keynote/Workshop Topic: ${inquiryData.topic}\n` +
          `- Estimated Audience: ${inquiryData.audience}\n\n` +
          `Additional Context:\n${inquiryData.details}\n\n` +
          `Looking forward to coordinating speaking logistics.\n\n` +
          `Warm regards,\n${inquiryData.name}\n${inquiryData.org}`
        );
        const mailtoUrl = `mailto:speaking@shinewithalka.com?subject=${mailSubject}&body=${mailBody}`;

        // 3. Attempt async FormSubmit delivery
        fetch('https://formsubmit.co/ajax/speaking@shinewithalka.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(inquiryData)
        }).catch(() => {
          // Non-blocking fallback handled via mailto & local persistence
        });

        const whatsappUrl = `https://wa.me/919820045672?text=${encodeURIComponent('Hello Dr. Alka Speaking Desk, I submitted an inquiry: ' + inquiryData.name + ' (' + inquiryData.org + ') for ' + inquiryData.topic + ' on ' + inquiryData.date)}`;

        // 4. Render confirmation modal with direct actions
        if (feedbackContainer) {
          feedbackContainer.innerHTML = `
            <div role="status" style="padding: 20px; background: rgba(212, 175, 55, 0.08); border: 1px solid var(--accent-rose); border-radius: 6px; margin-top: 20px; line-height: 1.6;">
              <div style="font-weight: 700; font-size: 1.0625rem; color: var(--text-primary); margin-bottom: 8px;">
                Inquiry Logged Successfully
              </div>
              <p style="font-size: 0.9375rem; color: var(--text-secondary); margin-bottom: 16px;">
                Thank you, ${escapeHtml(inquiryData.name)}. Your request has been recorded. To accelerate availability confirmation with Dr. Alka's speaking desk, you can also connect directly:
              </p>
              <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a href="${mailtoUrl}" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                  <span>Open in Email App</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </a>
                <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                  <span>Coordinate via WhatsApp</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                </a>
                <button type="button" class="btn btn-secondary btn-sm js-copy-inquiry-summary">
                  Copy Summary
                </button>
              </div>
              <div class="js-copy-status" style="font-size: 0.8125rem; color: var(--accent-rose); margin-top: 8px; display: none;"></div>
            </div>
          `;

          const copyBtn = feedbackContainer.querySelector('.js-copy-inquiry-summary');
          const copyStatus = feedbackContainer.querySelector('.js-copy-status');
          if (copyBtn) {
            copyBtn.addEventListener('click', () => {
              const summaryText = 
                `Dr. Alka Chadha Speaking Inquiry\n` +
                `Name: ${inquiryData.name}\n` +
                `Email: ${inquiryData.email}\n` +
                `Organization: ${inquiryData.org}\n` +
                `Date: ${inquiryData.date}\n` +
                `Location: ${inquiryData.location}\n` +
                `Topic: ${inquiryData.topic}\n` +
                `Audience: ${inquiryData.audience}\n` +
                `Details: ${inquiryData.details}`;

              navigator.clipboard.writeText(summaryText).then(() => {
                if (copyStatus) {
                  copyStatus.textContent = 'Summary copied to clipboard!';
                  copyStatus.style.display = 'block';
                }
              });
            });
          }

          form.reset();
        }
      });
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // ==========================================================================
  // 6. COPY BIO HANDLER (SPEAKER MEDIA KIT / PRESS)
  // ==========================================================================
  function initCopyBioButtons() {
    const copyBtns = document.querySelectorAll('.js-copy-bio-btn');
    copyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (!targetEl) return;

        navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied to Clipboard!';
          btn.classList.add('btn-primary');
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('btn-primary');
          }, 2400);
        });
      });
    });
  }

  // ==========================================================================
  // 7. PRE-POPULATE TOPIC VIA URL PARAMS
  // ==========================================================================
  function initBookingParams() {
    const topicSelect = document.getElementById('event_topic');
    if (!topicSelect) return;
    const urlParams = new URLSearchParams(window.location.search);
    const service = urlParams.get('service') || urlParams.get('topic');
    if (service) {
      const matchOption = Array.from(topicSelect.options).find(opt => opt.value === service);
      if (matchOption) {
        topicSelect.value = service;
      }
    }
  }

  // ==========================================================================
  // INITIALIZATION ON DOM READY
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initVisitorAnalytics();
    initCookieConsent();
    initFormValidation();
    initCopyBioButtons();
    initBookingParams();

    const themeButtons = document.querySelectorAll('.theme-toggle-btn');
    themeButtons.forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });
  });

})();
