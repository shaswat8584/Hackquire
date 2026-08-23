/**
 * Configurable Knowledge Base for SkillBridge
 * Can be replaced or parameterized for other products (e.g. EdTech, Universities).
 */
const knowledgeBase = {
  productName: "SkillBridge",
  tagline: "Unified Student Talent, Project & Opportunity Marketplace",
  description:
    "SkillBridge is a student talent marketplace connecting students through complementary skills, project/internship opportunities, and intelligent team formation.",

  modules: [
    {
      name: "SkillMatch",
      description:
        "An intelligent student matchmaking engine that compares skill sets, interests, and weekly availability to recommend complementary peers and collaborators with transparent match percentages.",
      keyFeatures: [
        "60% Skill Compatibility + 20% Interest Match + 20% Availability Match",
        "Interactive match breakdown drawer showing why peers are recommended",
        "Direct student team invitation and connection workflow",
        "Filtering by specific technical skill, interest domain, role, or minimum weekly hours",
      ],
    },
    {
      name: "OpportunityHub",
      description:
        "A centralized portal for discovering and posting projects, internships, hackathons, and competitions across campus.",
      keyFeatures: [
        "Compatibility score badge for every listing showing candidate suitability",
        "Role-specific student application workflow with personalized notes",
        "Opportunity creator dashboard to review applications and one-click form teams",
        "Filtering by opportunity type (Project, Internship, Hackathon, Competition)",
      ],
    },
    {
      name: "TeamForge",
      description:
        "A team formation and squad builder tool that tracks role vacancies, structure hierarchy, and automatically discovers missing talent.",
      keyFeatures: [
        "Visual team cards with role tree and missing member indicators (e.g. ⚠ Backend Developer Needed)",
        "Automated Candidate Finder powered by the 60/20/20 matching algorithm",
        "Direct team invitations and application review workflow",
        "Linked opportunities or standalone student project squads",
      ],
    },
  ],

  matchingAlgorithm: {
    formula: "Match Score = (Skill Match × 60%) + (Interest Match × 20%) + (Availability Match × 20%)",
    weights: {
      skills: "60% — Jaccard overlap between student tech stack and target requirements",
      interests: "20% — Shared domain areas (e.g. AI, Web, Fintech, Mobile)",
      availability: "20% — Weekly time commitment compatibility",
    },
  },

  faqs: [
    {
      question: "How does the SkillMatch score get calculated?",
      answer:
        "The SkillBridge matching engine uses a deterministic 60/20/20 weighted model: 60% is based on complementary technical skills, 20% on shared interest domains, and 20% on weekly availability overlap.",
    },
    {
      question: "How do I create a team?",
      answer:
        "Go to the TeamForge tab from the sidebar, click 'Create Project Team', specify your team name, description, required role slots (e.g. Frontend Developer, ML Engineer), and your designated role.",
    },
    {
      question: "How do I apply for an opportunity?",
      answer:
        "Browse listings in OpportunityHub, click on any opportunity to view its full details and your compatibility score, choose 'Apply to Opportunity', pick your desired role, and submit your note to the creator.",
    },
    {
      question: "How do I find candidates for missing roles in my team?",
      answer:
        "On any team card in TeamForge with missing roles, click the 'Find Candidates' button next to the vacant role. The matching engine will rank available peers by skill fit and availability so you can send them an instant invitation.",
    },
    {
      question: "How do I invite a specific student to my team?",
      answer:
        "You can invite a student in two ways: (1) In SkillMatch, click 'Invite to Team' on any student card and choose your team and role, or (2) In TeamForge, click 'Invite Member' on your team card and select the student from the dropdown.",
    },
    {
      question: "How do I update my profile skills and availability?",
      answer:
        "Click 'My Profile' in the sidebar or navbar dropdown to edit your bio, technical skills, interests, portfolio links, and weekly available hours.",
    },
    {
      question: "Can I post my own hackathon or project opportunity?",
      answer:
        "Yes! In OpportunityHub, click the 'Post Opportunity' button in the top right to define your project title, required skills, roles, duration, and deadline.",
    },
    {
      question: "What types of opportunities are supported on OpportunityHub?",
      answer:
        "OpportunityHub supports 4 main opportunity categories: Projects (collaborative builds), Internships (startup/industry roles), Hackathons (competitions & sprint builds), and Academic Competitions.",
    },
    {
      question: "How do I track the status of my submitted applications?",
      answer:
        "Navigate to 'My Applications' from the sidebar or Dashboard tab. You can view all pending, accepted, or reviewed applications along with the applied roles and creator responses.",
    },
    {
      question: "What happens when someone applies to my posted opportunity?",
      answer:
        "As the opportunity creator, when you view your opportunity details in OpportunityHub, you will see an 'Applicants' management section where you can review candidate profiles, check compatibility scores, and click 'Create Team with Applicants'.",
    },
    {
      question: "Can I filter students by specific skills or availability in SkillMatch?",
      answer:
        "Yes! SkillMatch includes real-time filters for technical skills (e.g. React, Python), domain interests (e.g. AI, Fintech), preferred roles, and minimum weekly available hours.",
    },
    {
      question: "Can I be a member of multiple teams simultaneously?",
      answer:
        "Yes, you can create and join multiple teams across different projects and hackathons. All your active squads are organized under the TeamForge and Dashboard tabs.",
    },
    {
      question: "Can I leave a team or remove a member?",
      answer:
        "Yes. Team owners can update member roles or remove members from the TeamForge squad card. Members can also choose to leave a team at any time by clicking 'Leave Team'.",
    },
    {
      question: "What is the difference between a standalone team and a project-linked team?",
      answer:
        "A standalone team is formed directly by students for independent collaboration. A project-linked team is tied directly to a specific OpportunityHub listing, allowing seamless applicant conversion into squad members.",
    },
  ],
};

module.exports = knowledgeBase;
