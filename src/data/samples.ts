import type { ArticleAnalysis } from '../types';

export const COMP_SAMPLES: ArticleAnalysis[] = [
  {
    id: "sample-green-hydrogen",
    url: "https://pib.gov.in/PressReleasePage.aspx?PRID=1890352",
    title: "National Green Hydrogen Mission: India's Path to Decarbonization",
    source: "Press Information Bureau",
    category: "Environment & Ecology",
    summary: [
      "The Union Cabinet approved the National Green Hydrogen Mission with an initial outlay of ₹19,744 crore to position India as a global hub for manufacturing green hydrogen.",
      "Targeting a production capacity of 5 Million Metric Tonnes (MMT) per annum by 2030, the mission aims to reduce fossil fuel imports by ₹1 lakh crore and abate 50 MMT of annual greenhouse gas emissions.",
      "The mission comprises two primary financial incentive mechanisms: SIGHT (Strategic Interventions for Green Hydrogen Transition) for domestic electrolyser manufacturing, and pilot schemes for steel and mobility industries.",
      "Grid integration, dedicated green corridors, and establishing Green Hydrogen Hubs are configured as infrastructure priorities to ease distribution constraints.",
      "Key challenges include high electrolyser acquisition costs, water availability requirements (approx 9kg pure water per 1kg hydrogen), and round-the-clock renewable sourcing."
    ],
    keywords: [
      "Strategic Interventions for Green Hydrogen Transition",
      "Electrolyser Efficiency",
      "Decarbonization Pathways",
      "Nationally Determined Contributions (NDCs)",
      "Green Hydrogen Hubs"
    ],
    mcq: {
      question: "With reference to the National Green Hydrogen Mission, consider the following statements:\n1. The SIGHT scheme is a major component focusing on financial incentives for domestic electrolyser manufacturing.\n2. The mission aims to produce at least 50 MMT of green hydrogen per annum by 2030.\nWhich of the statements given above is/are correct?",
      options: [
        "1 only",
        "2 only",
        "Both 1 and 2",
        "Neither 1 nor 2"
      ],
      correctAnswer: 0,
      explanation: "Statement 1 is correct: SIGHT (Strategic Interventions for Green Hydrogen Transition) is a core component that provides financial payouts for electrolyser manufacturing. Statement 2 is incorrect: The target is 5 MMT (Million Metric Tonnes) per annum by 2030, not 50 MMT."
    },
    revisionSheet: `### UPSC Syllabus Mapping
**GS Paper III:** Infrastructure, Energy, Science & Tech, Conservation & Climate Change.

### Core Context & Objective
Green hydrogen is produced via electrolysis of water utilizing 100% renewable energy sources. Unlike grey hydrogen (sourced from steam reforming of methane) or blue hydrogen (associated with carbon capture), green hydrogen has a zero-emission footprint. The National Green Hydrogen Mission aims to transition India's heavy manufacturing (primarily fertilizer, steel, and refineries) towards hydrogen feedstocks.

### Key Facts for Prelims
- **Electrochemical Split:** Uses Electrolysers (PEM, Alkaline, or Solid Oxide).
- **Outlay:** ₹19,744 crore divided into SIGHT incentives, pilot projects, and R&D.
- **Emission Abatement:** 50 MMT of fossil CO2 annually by 2030.

### Major Mains Arguments & Debates
- **Industrial Scale:** Swapping hydrogen feedstocks in chemical and oil refineries creates massive domestic decarbonization leverage.
- **Resource Intensity:** Electrolysis is heavily water-demanding. Producing 1 kg of fuel consumes 9 liters of high-purity water, introducing ecological pressure in drought-prone areas.
- **Renewable Capacity Squeeze:** Achieving 5 MMT targets requires adding roughly 125 GW of exclusive green power, matching India's current aggregate renewable generation base.

### Strategic Way Forward
Establish dedicated maritime Green Hydrogen Hubs near deepwater ports (such as Kandla or Tuticorin) to minimize internal transport logistics and facilitate early exports of green ammonia.`,
    createdAt: "2026-06-20T10:00:00Z",
    isBookmarked: true
  },
  {
    id: "sample-dpi-india",
    url: "https://www.g20.org/en/dpi-summit-declaration",
    title: "Digital Public Infrastructure (DPI): The India Stack Blueprint",
    source: "Ministry of Electronics & IT",
    category: "Science & Technology",
    summary: [
      "Digital Public Infrastructure (DPI) represents a fundamental shift in technological governance, combining identity (Aadhaar), data exchange (Account Aggregators), and payments (UPI) to spur inclusive growth.",
      "The architecture uses open API standards, consent-led data flows, and public-facing switch networks to allow private-market players to build competitive services on shared rails.",
      "During India's G20 presidency, the framework was formalized as a global blueprint for financial inclusion and public service delivery in Low-and-Middle-Income Countries (LMICs).",
      "The UPI interface processed over 13 billion transactions in a single month during 2024, demonstrating unmatched scalability and slashing cash handling costs.",
      "Major challenges include digital divide discrepancies, data storage safety concerns, and systemic cyber-vulnerabilities."
    ],
    keywords: [
      "India Stack",
      "Digital Public Infrastructure",
      "Consent Articulation Framework",
      "Account Aggregator Protocol",
      "Open API Architecture"
    ],
    mcq: {
      question: "Which of the following layers is commonly classified under the digital stack known as 'India Stack'?\n1. Aadhaar (Identity Layer)\n2. Unified Payments Interface (Transaction Layer)\n3. Account Aggregator framework (Data Consent Layer)\nSelect the correct answer using the codes below:",
      options: [
        "1 and 2 only",
        "2 and 3 only",
        "1 and 3 only",
        "1, 2, and 3"
      ],
      correctAnswer: 3,
      explanation: "All three are core layers of the India Stack architectural framework: Aadhaar represents the foundation identity layer, UPI represents the cashless exchange transaction layer, and the Account Aggregator represents the consent-driven data-sharing layer."
    },
    revisionSheet: `### UPSC Syllabus Mapping
**GS Paper III:** Indian Economy, Digitization, Science and Technology Developments.

### Core Context & Objective
DPI represents a 'roads-and-highways' approach to software services: instead of creating single-purpose government applications (like siloed banking apps), the state establishes standard open-source rails (like UPI protocols) that are accessible to both public administrations and commercial providers.

### Key Pillars for Prelims
- **Identity (Aadhaar):** Biometric-backed single verify client.
- **Payment (UPI):** Real-time, peer-to-peer interoperable engine.
- **Data Sharing (Account Aggregator):** Gives citizens ownership and control over their transactional receipts and credit logs.

### Major Mains Arguments & Debates
- **Financial Inclusion Catalyst:** Slashing customer verification costs (e-KYC) allowed banks to expand accounts to rural households profitably.
- **Privacy and Sovereignty Concerns:** Centralization of consumer data creates targets for state surveillance or black-hat database leaks. Robust data protection regulations (consistent with DPDP Act, 2023) are vital safeguards.
- **Monopoly Risks:** Private payment aggregators (such as PhonePe or GooglePay) command massive UPI market shares, introducing infrastructure single points of failure.

### Strategic Way Forward
Transition the DPI stack to support environmental tracking (climate-DPI) where smallholding crop farmers can trade carbon credits directly via UPI ledger connections.`,
    createdAt: "2026-06-20T12:00:00Z",
    isBookmarked: true
  }
];
