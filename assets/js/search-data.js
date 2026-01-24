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
        },{id: "nav-projects",
          title: "Projects",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-teaching",
          title: "Teaching",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/teaching/";
          },
        },{id: "nav-repositories",
          title: "Repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-how-i-generate-paper-figures-with-claude-and-gemini",
        
          title: "How I Generate Paper Figures with Claude and Gemini",
        
        description: "A real story of creating publication-quality architecture diagrams using AI — showing every prompt, every iteration, and every mistake along the way",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/generating-paper-figures-with-gemini/";
          
        },
      },{id: "books-the-godfather",
          title: 'The Godfather',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/the_godfather/";
            },},{id: "news-thrilled-to-announce-that-our-paper-lamp-extracting-locally-linear-decision-surfaces-from-llm-world-models-has-been-accepted-as-a-spotlight-at-aistats-2026-grateful-to-all-co-authors-for-the-amazing-collaboration",
          title: '🎉 Thrilled to announce that our paper LAMP: Extracting Locally Linear Decision Surfaces...',
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
            },},{id: "teachings-introduction-to-probability-and-statistics-210-0-20",
          title: 'Introduction to Probability and Statistics (210-0-20)',
          description: "Foundational course in probability and statistical methods.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/24fall-probability-statistics/";
            },},{id: "teachings-applied-multivariate-analysis-stat-348",
          title: 'Applied Multivariate Analysis (STAT 348)',
          description: "Statistical methods for multivariate data analysis.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/25fall-multivariate-analysis/";
            },},{id: "teachings-data-science-3-with-python-303-3-21",
          title: 'Data Science 3 with Python (303-3-21)',
          description: "Non-linear statistical models and tree-based methods in data science.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/25spring-data-science-3/";
            },},{id: "teachings-data-science-2-with-python-303-2-22",
          title: 'Data Science 2 with Python (303-2-22)',
          description: "Supervised machine learning in Python with focus on linear and logistic regression.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/25winter-data-science-2/";
            },},{id: "teachings-data-science-2-with-python-303-2-22",
          title: 'Data Science 2 with Python (303-2-22)',
          description: "Supervised machine learning in Python with focus on linear and logistic regression.",
          section: "Teachings",handler: () => {
              window.location.href = "/teachings/26winter-data-science-2/";
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
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
