// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-teaching-experience",
          title: "Teaching Experience",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "nav-beyond-research",
          title: "beyond research",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/beyond/";
          },
        },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-thrilled-that-lamp-was-selected-as-a-spotlight-at-aistats-2026-a-lightweight-way-to-audit-whether-a-model-s-explanations-behave-like-they-matter",
          title: 'Thrilled that LAMP was selected as a Spotlight at AISTATS 2026—a lightweight way...',
          description: "",
          section: "News",},{id: "news-tempo-is-out-a-training-approach-that-teaches-llms-temporal-discipline-for-trustworthy-backtesting-code-released",
          title: 'TEMPO is out: a training approach that teaches LLMs temporal discipline for trustworthy...',
          description: "",
          section: "News",},{id: "news-our-new-preprint-on-catching-models-that-peek-at-the-future-is-live-on-arxiv-with-code-to-reproduce-the-claim-level-leakage-audit-and-timespec-mitigation",
          title: 'Our new preprint on catching models that “peek” at the future is live...',
          description: "",
          section: "News",},{id: "news-the-capstone-of-our-backtesting-line-is-live-on-arxiv-temporal-leakage-in-llm-backtesting-measurement-validation-and-adjusted-scores-proves-the-standard-contamination-check-is-uninformative-and-shows-one-defensible-reference-restores-a-leakage-adjusted-score-in-submission-to-tmlr-with-code-and-data-released",
          title: 'The capstone of our backtesting line is live on arXiv: Temporal Leakage in...',
          description: "",
          section: "News",},{id: "projects-project-1",
          title: 'project 1',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/1_project/";
            },},{id: "projects-project-2",
          title: 'project 2',
          description: "a project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/2_project/";
            },},{id: "projects-project-3-with-very-long-name",
          title: 'project 3 with very long name',
          description: "a project that redirects to another website",
          section: "Projects",handler: () => {
              window.location.href = "/projects/3_project/";
            },},{id: "projects-project-4",
          title: 'project 4',
          description: "another without an image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/4_project/";
            },},{id: "projects-project-5",
          title: 'project 5',
          description: "a project with a background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/5_project/";
            },},{id: "projects-project-6",
          title: 'project 6',
          description: "a project with no image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/6_project/";
            },},{id: "projects-project-7",
          title: 'project 7',
          description: "with background image",
          section: "Projects",handler: () => {
              window.location.href = "/projects/7_project/";
            },},{id: "projects-project-8",
          title: 'project 8',
          description: "an other project with a background image and giscus comments",
          section: "Projects",handler: () => {
              window.location.href = "/projects/8_project/";
            },},{id: "projects-project-9",
          title: 'project 9',
          description: "another project with an image 🎉",
          section: "Projects",handler: () => {
              window.location.href = "/projects/9_project/";
            },},{id: "projects-signal-distortion-measurement-device-design",
          title: 'Signal Distortion Measurement Device Design',
          description: "High-precision device achieving 0.5% error with 1kHz-100kHz bandwidth",
          section: "Projects",handler: () => {
              window.location.href = "/projects/signal_distortion/";
            },},{id: "teachings-introduction-to-probability-and-statistics-stat-210-0-20",
          title: 'Introduction to Probability and Statistics (STAT 210-0-20)',
          description: "",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/24fall-probability-statistics/";
            },},{id: "teachings-applied-multivariate-analysis-stat-348",
          title: 'Applied Multivariate Analysis (STAT 348)',
          description: "",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/25fall-multivariate-analysis/";
            },},{id: "teachings-data-science-3-with-python-stat-303-3-21",
          title: 'Data Science 3 with Python (STAT 303-3-21)',
          description: "",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/25spring-data-science-3/";
            },},{id: "teachings-data-science-2-with-python-stat-303-2-22",
          title: 'Data Science 2 with Python (STAT 303-2-22)',
          description: "",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/25winter-data-science-2/";
            },},{id: "teachings-applied-multivariate-analysis-stat-348",
          title: 'Applied Multivariate Analysis (STAT 348)',
          description: "",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/26fall-multivariate-analysis/";
            },},{id: "teachings-data-science-3-with-python-stat-303-3",
          title: 'Data Science 3 with Python (STAT 303-3)',
          description: "",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/26spring-data-science-3/";
            },},{id: "teachings-data-science-2-with-python-stat-303-2-22",
          title: 'Data Science 2 with Python (STAT 303-2-22)',
          description: "",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/26winter-data-science-2/";
            },},{id: "tools-academic-research-image-generator",
          title: 'Academic Research Image Generator',
          description: "Generate publication-quality architecture diagrams and figures using AI collaboration between LLMs and image generation models. Iteratively refine images with professional feedback.",
          section: "Tools",handler: () => {
              window.location.href = "/tools/academic-image-generator/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/CV.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%7A%65%79%75%7A%68%61%6E%67%32%30%32%38@%75.%6E%6F%72%74%68%77%65%73%74%65%72%6E.%65%64%75", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/ZeyuZhang1901", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/zeyu-zhang-42813a271", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=dr-xetEAAAAJ", "_blank");
        },
      },];
