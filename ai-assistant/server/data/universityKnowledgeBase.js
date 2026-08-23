/**
 * Configurable Knowledge Base for Apex University Portal (Third-Party Demo)
 * Proves that the same AI Assistant engine works for universities and external organizations.
 */
const universityKnowledgeBase = {
  productName: "Apex University Student & Admissions Portal",
  tagline: "Official AI Admissions, Course Registration & Campus Life Assistant",
  description:
    "Apex University is a premier higher education institution providing undergraduate and postgraduate programs in Computer Science, Engineering, Business, and Design.",

  modules: [
    {
      name: "Admissions & Applications",
      description: "Information regarding undergraduate/graduate applications, application deadlines, SAT/ACT requirements, and scholarship eligibility.",
    },
    {
      name: "Course Enrollment & Academics",
      description: "Academic calendar, prerequisite verification, credit transfers, and add/drop deadlines.",
    },
    {
      name: "Campus Housing & Financial Aid",
      description: "Dormitory selection, financial aid calculators, FAFSA submission, and student work-study opportunities.",
    },
  ],

  faqs: [
    {
      question: "What are the application deadlines for fall admission?",
      answer: "Early Action applications are due November 1st, while Regular Decision applications close on January 15th. International applicants should apply before December 1st.",
    },
    {
      question: "How do I apply for academic scholarships?",
      answer: "All admitted students are automatically evaluated for merit-based scholarships. Need-based aid requires submitting the FAFSA and CSS Profile by February 15th.",
    },
    {
      question: "When does course registration open for the next semester?",
      answer: "Priority registration for seniors begins on April 5th, juniors on April 8th, sophomores on April 12th, and freshmen on April 15th through the Student Portal.",
    },
    {
      question: "How do I request an official academic transcript?",
      answer: "Log into the Student Portal, navigate to 'Academics' > 'Transcripts', and submit an electronic transcript request via the Registrar office.",
    },
  ],
};

module.exports = universityKnowledgeBase;
