export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: "program" | "database";
}

export const faqItems: FAQItem[] = [
    {
        id: "what-is-epic",
        question: "What is the Electric Program Investment Charge?",
        answer:
            "The Electric Program Investment Charge (EPIC) is a California ratepayer funded program that drives efficient, coordinated investment in new and emerging clean energy solutions. Its mandatory guiding principle is to provide ratepayer benefits, with a mission of investment in innovation to ensure equitable access to safe, affordable, reliable, and environmentally sustainable energy for electricity ratepayers. EPIC invests in a wide range of critical innovation, including building decarbonization, cybersecurity, demand reduction, distributed energy resource integration, energy storage, entrepreneurial ecosystems, grid decarbonization, grid decentralization, grid modernization, grid optimization, grid resiliency and safety, high penetration renewable energy grid integration, industrial and agricultural innovation, smart grid technology, transportation electrification, and wildfire mitigation. From 2012 through 2030, EPIC will have invested nearly $3.2 billion in clean energy technology innovation.",
        category: "program",
    },
    {
        id: "how-does-epic-work",
        question: "How does EPIC work?",
        answer:
            "The EPIC program is administered by the CEC, SDG&E, PG&E, and SCE and overseen by the CPUC's Energy Division staff. In its annual reports, each EPIC administrator provides updates on project status, administrator coordination, public engagement, and budget. The EPIC program administrators also hold public workshops to maintain public transparency and gain stakeholder input throughout the EPIC funding process.",
        category: "program",
    },
    {
        id: "epic-accomplishments",
        question: "What has EPIC accomplished?",
        answer:
            "To date, more than 45 EPIC-funded technologies and related services have been successfully commercialized, including smarter electric vehicle chargers, better battery chemistries, more intuitive energy and water management software, and others. An additional 60 EPIC-funded utility projects have been successfully commercialized or transitioned to the CPUC's General Rate Case for follow-on funding, including technologies for wildfire mitigation, energy storage, distributed resources, big data, and others. EPIC is advancing energy equity by investing over 40 percent of technology demonstration and deployment funds in disadvantaged vulnerable communities. The CPUC is working to expand outreach and engagement in these communities to better understand needs, challenges, and ways that EPIC funds can be best invested for all Californians.",
        category: "program",
    },
    {
        id: "picg",
        question: "What is the Policy + Innovation Coordination Group?",
        answer:
            "The Policy + Innovation Coordination Group (PICG) was formed to provide a new, dedicated process to ensure that meaningful coordination and feedback among and between the EPIC administrators and the CPUC occurs, in alignment with state policy needs and research developments, without overly burdening the program administrators with new administrative tasks. The PICG's overarching goal is to ensure that EPIC investments are optimally aligned with and informed by key Commission and California energy innovation needs and goals. To date the PICG has facilitated four workstreams and two fora on critical California energy issues, the recordings and reports for which are available on this PICG website.",
        category: "program",
    },
    {
        id: "what-is-database",
        question: "What is the EPIC database?",
        answer:
            "The EPIC database is a comprehensive resource providing publicly searchable information for all EPIC projects since inception of the program, increasing both EPIC program transparency and oversight. The database compiles project lessons learned, data, and results from all project administrators and all EPIC projects into a central online location, containing more than 60 searchable data fields for hundreds of EPIC research, development, and deployment projects.",
        category: "database",
    },
    {
        id: "projects-included",
        question: "What projects are included in the database?",
        answer:
            "The database includes EPIC RD&D projects from all program administrators (CEC, PG&E, SDG&E, and SCE) in a single location for the first time, allowing for the easy search and comparison of projects and results across the program as a whole.",
        category: "database",
    },
    {
        id: "narrow-projects",
        question: "How can I narrow the projects list?",
        answer:
            "The database includes an easy-to-navigate filtering of EPIC projects that can be narrowed based on filters or search functions, including topics such as investment area, funding amount, project status, technology development stage, or results.",
        category: "database",
    },
    {
        id: "find-nearby",
        question: "How do I find projects near me?",
        answer:
            "Users can browse an interactive map of all projects, or projects in which they are interested, to find RD&D investments in their community. On the main project listing, click on the tab that says \"Map\" in the middle of the page to view a map of the search or filtered results.",
        category: "database",
    },
    {
        id: "final-reports",
        question: "Where do I find project Final Reports?",
        answer:
            "Final reports for all completed projects are located on their project profile page. You can get to the project profile by clicking on a project in the project listing page. You will find a button on the right-hand side of the screen to download the final report as a PDF file.",
        category: "database",
    },
    {
        id: "project-info",
        question: "What information is included for each EPIC project?",
        answer:
            "Users can view full project profiles of each EPIC project by clicking on the project listing, or on the icon on the map. Each project profile includes up to 65 different data fields, including data never previously reported. Users can view financial data for each project, descriptions on key innovations and lessons learned for the project, and metrics on how the project could lead to lower pollution and ratepayer costs, community benefits, and improved reliability.",
        category: "database",
    },
    {
        id: "update-frequency",
        question: "How often will project data be updated?",
        answer:
            "Financial data for each project will be updated on a quarterly basis. Each year, additional project information will be updated for projects that are active, providing an update on project progress and other data. When a project is complete, projects will be updated with key learnings, innovations, metrics, and results for the project, as well as a final report.",
        category: "database",
    },
];

export const faqCategories = [
    { id: "all", label: "All Questions" },
    { id: "program", label: "About EPIC" },
    { id: "database", label: "Using the Database" },
] as const;

export type FAQCategory = (typeof faqCategories)[number]["id"];