/**
 * Dr. Alka Chadha: Unified Data Store & Content Engine
 * Persistent LocalStorage Engine for Events, Summits, Workshops, and Blogs
 * Integrated with the Admin Management Console
 */

const AlkaDataStore = (function () {
  'use strict';

  const STORAGE_KEYS = {
    EVENTS: 'alka_portal_events_v3',
    BLOGS: 'alka_portal_blogs_v3',
    WORKSHOPS: 'alka_portal_workshops_v2'
  };

  // Default Seed Events (Grounded in her real decade of global stages from Google Drive)
  const DEFAULT_EVENTS = [
    {
      id: 'gsa-germany-2026',
      title: 'German Speakers Association (GSA) Convention 2026',
      venue: 'Congress Centrum Ingolstadt',
      city: 'Ingolstadt, Bavaria',
      country: 'Germany',
      date: 'September 2026',
      year: '2026',
      status: 'completed',
      topic: 'We Are Rivers, Not Rocks: Egoless Authority',
      description: 'Official flagship plenary address delivered before European keynote orators and corporate educators.',
      image: '../assets/images/event-gsa-germany.jpg'
    },
    {
      id: 'psai-national-2025-26',
      title: 'PSAI National Assembly & Chapter Leadership Summit',
      venue: 'Grand Hyatt Mumbai',
      city: 'Mumbai',
      country: 'India',
      date: 'Ongoing Tenure 2025-26',
      year: '2025-26',
      status: 'upcoming',
      topic: 'The Future of Professional Oratory in Asia',
      description: 'Presiding presidential address and executive masterclass series shaping the professional speaking ecosystem in India.',
      image: '../assets/images/stage-convention-speaking.jpg'
    },
    {
      id: 'pss-singapore-2025',
      title: 'PSS Annual Convention & Joint PSAI Plenary',
      venue: 'Marina Bay Sands Convention Centre',
      city: 'Singapore',
      country: 'Singapore',
      date: 'May 2025',
      year: '2025',
      status: 'completed',
      topic: 'Egoless Impact Across Southeast Asian Leadership',
      description: 'Landmark joint plenary session with the Professional Speakers Association Singapore exploring cross-cultural empathy.',
      image: '../assets/images/stage-plenary-orator.jpg'
    },
    {
      id: 'psanz-new-zealand',
      title: 'PSANZ Annual National Convention',
      venue: 'Auckland Convention Centre',
      city: 'Auckland',
      country: 'New Zealand',
      date: 'November 2024',
      year: '2024',
      status: 'completed',
      topic: 'Your Issues Get into Your Tissues',
      description: 'International keynote address on somatic resilience, capturing standing ovations from international delegates.',
      image: '../assets/images/hero-stage-portrait.webp'
    },
    {
      id: 'psa-australia',
      title: 'Professional Speakers Australia (PSA) Convention',
      venue: 'Gold Coast Convention Centre',
      city: 'Gold Coast',
      country: 'Australia',
      date: 'March 2024',
      year: '2024',
      status: 'completed',
      topic: 'Transpacific Leadership & Somatic Influence',
      description: 'Engaging Australian business leaders on non-defensive communication and corporate culture renewal.',
      image: '../assets/images/stage-australia-global.jpg'
    },
    {
      id: 'al-farabi-university',
      title: 'Al-Farabi Kazakh National University Plenary',
      venue: 'Main Academic Auditorium',
      city: 'Almaty',
      country: 'Kazakhstan',
      date: 'October 2023',
      year: '2023',
      status: 'completed',
      topic: 'Psychoneuroimmunology & Cellular Stress Biology',
      description: 'Medical keynote plenary delivered before international university faculty, physicians, and postgraduate scholars.',
      image: '../assets/images/stage-executive-address.jpg'
    },
    {
      id: 'jw-marriott-mumbai',
      title: 'ICAI National Leadership Summit',
      venue: 'JW Marriott Sahar',
      city: 'Mumbai',
      country: 'India',
      date: 'August 2023',
      year: '2023',
      status: 'completed',
      topic: 'The Water Alchemist: Leadership Through Disruption',
      description: 'Corporate plenary session for Chartered Accountants on executive cognitive preservation and stress transmutation.',
      image: '../assets/images/stage-convention-speaking.jpg'
    }
  ];

  // Default Seed Blogs
  const DEFAULT_BLOGS = [
    {
      id: 'why-rocks-erode-rivers-conquer',
      slug: 'why-rocks-erode-rivers-conquer',
      title: 'Why Rocks Erode and Rivers Conquer: The Architecture of Egoless Influence',
      category: 'Leadership & Stagecraft',
      author: 'Dr. Alka Chadha',
      date: 'October 15, 2026',
      readTime: '6 min read',
      excerpt: 'Defensive leadership creates friction and exhaustion. Fluid humility dismantles resistance and carves valleys of enduring institutional trust.',
      content: `When executives face market volatility, the instinct is almost universally to harden. Leaders brace themselves like granite boulders, resisting the current, demanding compliance, and asserting dominance. 

Yet in nature, rocks do not conquer the torrent. Over time, friction fractures them, grinding them down into sand. 

Rivers, by contrast, yield to every obstacle. When a stone appears, the river bends without losing its destination. Over centuries, water carves through solid mountain ranges and nurtures entire civilizations along its banks.

In thirty years of observing corporate boardrooms and medical patients, one rule holds true: ego creates metabolic friction. When a leader communicates from defensive self-interest, the mirror neurons of their team detect fear. When a leader communicates with fluid curiosity, psychological safety is unlocked.`,
      image: '../assets/images/keynote-rivers-rocks-stage.jpg'
    },
    {
      id: 'issues-get-into-your-tissues-biology',
      slug: 'issues-get-into-your-tissues-biology',
      title: 'Your Issues Get into Your Tissues: The Somatic Cost of Unspoken Corporate Conflict',
      category: 'Psychosomatic Science',
      youtubeId: 'IqY-Fd51sAc',
      author: 'Dr. Alka Chadha',
      date: 'September 28, 2026',
      readTime: '8 min read',
      excerpt: 'The body keeps an uncompromising physiological ledger of workplace stress, chronic resentment, and unaddressed executive anxiety.',
      content: `Executives frequently believe that mental stress can be partitioned from physical performance. They believe that sixteen-hour workdays, unexpressed boardroom resentment, and chronic sleep deprivation can be compensated for by sheer force of willpower.

Biology disagrees.

When an unresolved conflict persists, the hypothalamic-pituitary-adrenal (HPA) axis operates in continuous overdrive. Cortisol floods the bloodstream, downregulating mucosal immunity, stiffening arterial walls, and triggering connective tissue inflammation. 

Before an executive experiences burnout, their body has been signaling distress for eighteen months: subtle digestive dysbiosis, morning stiffness, shallow diaphragmatic breathing, and cognitive narrowing. Learning to listen to these somatic whispers prevents the catastrophic shout of clinical illness.`,
      image: '../assets/images/youtube-issues-tissues-thumb.jpg'
    },
    {
      id: 'care-about-your-brain-executive-endurance',
      slug: 'care-about-your-brain-executive-endurance',
      title: 'Care About Your Brain: Neuro-Nutrition and Somatic Recovery for High-Stress Orators',
      category: 'Executive Health',
      author: 'Dr. Alka Chadha',
      date: 'August 14, 2026',
      readTime: '5 min read',
      excerpt: 'Practical clinical protocols for neuro-preservation, parasympathetic resets, and cognitive vitality under high-pressure conference schedules.',
      content: `Keynote speaking and corporate steering require immense neural energy. An hour of commanding a room of two thousand delegates places high cognitive demands on the prefrontal cortex and autonomic nervous system.

To sustain this output over decades without metabolic depletion requires deliberate somatic hygiene:
1. Hydration with essential electrolyte balance to support neuronal axon potential conductivity.
2. Vagal nerve downregulation protocols between keynote sessions.
3. Diaphragmatic pacing to prevent vocal cord strain and sympathetic overdrive.

Treating the brain as an exquisite living organ rather than an abstract machine is the fundamental secret to longevity on the global stage.`,
      image: '../assets/images/blog-holding-brain.jpg'
    }
  ];

  // Default Seed Workshops
  const DEFAULT_WORKSHOPS = [
    {
      id: 'executive-somatic-masterclass',
      title: 'The Egoless Executive: Masterclass in Non-Defensive Influence',
      tag: 'Half-Day Executive Intensive',
      audience: 'C-Suite, Managing Directors, Board Members',
      duration: '4 Hours (In-Person or Hybrid)',
      description: 'An immersive workshop teaching senior teams conversational aikido, emotional de-escalation, and somatic self-regulation under boardroom pressure.'
    },
    {
      id: 'resilience-reset-summit',
      title: 'Psychosomatic Reset: Preventing Systemic Corporate Burnout',
      tag: 'Full-Day Leadership Summit',
      audience: 'Senior Leaders, People & Culture Executives, Healthcare Leaders',
      duration: 'Full Day (6 Hours)',
      description: 'A deep biological dive into workplace stress mapping, cortisol downregulation protocols, and building sustainable high-vitality teams.'
    }
  ];

  // Data Getters & Setters
  function getEvents() {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_EVENTS;
    }
  }

  function saveEvents(events) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }

  function getBlogs() {
    const raw = localStorage.getItem(STORAGE_KEYS.BLOGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(DEFAULT_BLOGS));
      return DEFAULT_BLOGS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_BLOGS;
    }
  }

  function saveBlogs(blogs) {
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(blogs));
  }

  function getWorkshops() {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKSHOPS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(DEFAULT_WORKSHOPS));
      return DEFAULT_WORKSHOPS;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_WORKSHOPS;
    }
  }

  function saveWorkshops(workshops) {
    localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(workshops));
  }

  function resetAllToDefault() {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
    localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(DEFAULT_BLOGS));
    localStorage.setItem(STORAGE_KEYS.WORKSHOPS, JSON.stringify(DEFAULT_WORKSHOPS));
  }

  function exportAllData() {
    return JSON.stringify({
      events: getEvents(),
      blogs: getBlogs(),
      workshops: getWorkshops(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  function importAllData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data.events && Array.isArray(data.events)) saveEvents(data.events);
      if (data.blogs && Array.isArray(data.blogs)) saveBlogs(data.blogs);
      if (data.workshops && Array.isArray(data.workshops)) saveWorkshops(data.workshops);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return {
    getEvents,
    saveEvents,
    getBlogs,
    saveBlogs,
    getWorkshops,
    saveWorkshops,
    resetAllToDefault,
    exportAllData,
    importAllData
  };
})();

// Attach globally
window.AlkaDataStore = AlkaDataStore;
