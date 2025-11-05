import { MajorDecision, DepartmentMetrics, DepartmentImpact, Department } from '../types/game';

// Initial metrics for all teams
export const initialMetrics: DepartmentMetrics = {
  marketing: {
    brandAwareness: 50,
    customerAcquisition: 45,
    campaignEffectiveness: 50,
    marketShare: 30,
  },
  sales: {
    revenue: 500, // $500K
    conversionRate: 15,
    customerSatisfaction: 70,
    salesGrowth: 10,
  },
  research: {
    innovation: 60,
    productQuality: 65,
    rdBudgetEfficiency: 55,
    patentsFiled: 2,
  },
  finance: {
    cashFlow: 200, // $200K
    profitMargin: 12,
    debtRatio: 40,
    investorConfidence: 60,
  },
  hr: {
    employeeMorale: 65,
    productivity: 70,
    retentionRate: 80,
    talentQuality: 60,
  },
};

// 5 Major Decisions for a 5-week business simulation
export const gameDecisions: MajorDecision[] = [
  {
    id: 'decision-1',
    week: 1,
    title: 'Product Launch Strategy',
    description: 'Your company is about to launch a revolutionary product. Define your go-to-market strategy.',
    context: `TechVenture Inc. has developed an innovative product after 18 months of R&D.
    The market is competitive, with three major players controlling 60% of market share.
    You have $150K allocated for the launch, but investor pressure is high for quick returns.`,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    subDecisions: [
      {
        id: 'sd-1-1',
        title: 'Marketing Budget Allocation',
        description: 'Allocate your marketing budget across channels',
        type: 'numeric',
        numericConfig: {
          min: 0,
          max: 150,
          unit: '$K',
          impactCalculator: (value: number): DepartmentImpact[] => {
            const impacts: DepartmentImpact[] = [];
            if (value < 50) {
              impacts.push({ department: 'marketing' as Department, metric: 'brandAwareness', change: -10, description: 'Low budget reduces brand visibility' });
              impacts.push({ department: 'sales' as Department, metric: 'revenue', change: -20, description: 'Poor awareness impacts sales' });
            } else if (value >= 50 && value <= 100) {
              impacts.push({ department: 'marketing' as Department, metric: 'brandAwareness', change: 15, description: 'Moderate budget creates good visibility' });
              impacts.push({ department: 'sales' as Department, metric: 'revenue', change: 50, description: 'Good awareness drives sales' });
              impacts.push({ department: 'finance' as Department, metric: 'cashFlow', change: -value, description: 'Marketing investment' });
            } else {
              impacts.push({ department: 'marketing' as Department, metric: 'brandAwareness', change: 25, description: 'High budget dominates market' });
              impacts.push({ department: 'sales' as Department, metric: 'revenue', change: 100, description: 'Strong awareness drives high sales' });
              impacts.push({ department: 'finance' as Department, metric: 'cashFlow', change: -value, description: 'Significant marketing investment' });
              impacts.push({ department: 'finance' as Department, metric: 'debtRatio', change: 10, description: 'High spending increases debt' });
            }
            return impacts;
          },
        },
      },
      {
        id: 'sd-1-2',
        title: 'Creative Campaign Proposal',
        description: 'Submit your creative marketing campaign strategy (PDF)',
        type: 'file-upload',
        fileConfig: {
          acceptedFormats: ['.pdf'],
          maxSize: 10,
          scoringRubric: `Creativity (25%), Market fit (25%), Feasibility (25%), Brand alignment (25%)`,
        },
      },
      {
        id: 'sd-1-3',
        title: 'Pricing Strategy',
        description: 'Choose your pricing approach for market entry',
        type: 'multiple-choice',
        options: [
          {
            label: 'Premium Pricing ($199) - Position as luxury/quality product',
            value: 'premium',
            impacts: [
              { department: 'sales', metric: 'revenue', change: 80, description: 'High price, moderate volume' },
              { department: 'marketing', metric: 'marketShare', change: -5, description: 'Limited market penetration' },
              { department: 'finance', metric: 'profitMargin', change: 8, description: 'Higher margins' },
              { department: 'research', metric: 'productQuality', change: 10, description: 'Premium expectations drive quality' },
            ],
          },
          {
            label: 'Competitive Pricing ($129) - Match market leaders',
            value: 'competitive',
            impacts: [
              { department: 'sales', metric: 'revenue', change: 60, description: 'Moderate price and volume' },
              { department: 'marketing', metric: 'marketShare', change: 5, description: 'Fair market penetration' },
              { department: 'finance', metric: 'profitMargin', change: 4, description: 'Balanced margins' },
              { department: 'sales', metric: 'customerSatisfaction', change: 8, description: 'Good value perception' },
            ],
          },
          {
            label: 'Penetration Pricing ($79) - Aggressive market capture',
            value: 'penetration',
            impacts: [
              { department: 'sales', metric: 'revenue', change: 40, description: 'Low price, high volume' },
              { department: 'marketing', metric: 'marketShare', change: 15, description: 'Rapid market penetration' },
              { department: 'finance', metric: 'profitMargin', change: -3, description: 'Thin margins' },
              { department: 'finance', metric: 'cashFlow', change: -30, description: 'Cash flow pressure' },
              { department: 'sales', metric: 'salesGrowth', change: 15, description: 'High growth rate' },
            ],
          },
        ],
      },
      {
        id: 'sd-1-4',
        title: 'Initial Hiring Plan',
        description: 'How many new employees to hire for launch (Sales + Support)',
        type: 'numeric',
        numericConfig: {
          min: 0,
          max: 20,
          unit: 'employees',
          impactCalculator: (value: number): DepartmentImpact[] => {
            const impacts: DepartmentImpact[] = [];
            const costPerEmployee = 8; // $8K per employee
            if (value < 5) {
              impacts.push({ department: 'hr' as Department, metric: 'productivity', change: -10, description: 'Understaffed teams struggle' });
              impacts.push({ department: 'sales' as Department, metric: 'customerSatisfaction', change: -8, description: 'Poor customer support' });
            } else if (value >= 5 && value <= 12) {
              impacts.push({ department: 'hr' as Department, metric: 'productivity', change: 10, description: 'Adequate staffing' });
              impacts.push({ department: 'sales' as Department, metric: 'conversionRate', change: 5, description: 'Good sales support' });
              impacts.push({ department: 'finance' as Department, metric: 'cashFlow', change: -(value * costPerEmployee), description: 'Salary costs' });
            } else {
              impacts.push({ department: 'hr' as Department, metric: 'productivity', change: 5, description: 'Potential overstaffing' });
              impacts.push({ department: 'hr' as Department, metric: 'employeeMorale', change: -5, description: 'Coordination challenges' });
              impacts.push({ department: 'finance' as Department, metric: 'cashFlow', change: -(value * costPerEmployee), description: 'High salary costs' });
            }
            return impacts;
          },
        },
      },
    ],
    minimumImpact: [
      { department: 'research', metric: 'innovation', change: 10, description: 'Product launch validates R&D efforts' },
      { department: 'finance', metric: 'investorConfidence', change: 5, description: 'Market entry shows progress' },
    ],
  },
  {
    id: 'decision-2',
    week: 2,
    title: 'Crisis Management: Supply Chain Disruption',
    description: 'A major supplier has failed. Navigate this crisis while maintaining operations.',
    context: `Week 2 brings unexpected challenges. Your primary component supplier has declared bankruptcy,
    disrupting 70% of your supply chain. Competitors are facing the same issue.
    Customer orders are piling up, and your reputation is at stake.`,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    subDecisions: [
      {
        id: 'sd-2-1',
        title: 'Supplier Strategy',
        description: 'Choose your approach to solving the supply chain crisis',
        type: 'multiple-choice',
        options: [
          {
            label: 'Emergency Premium Supplier (3x cost, immediate delivery)',
            value: 'premium',
            impacts: [
              { department: 'sales', metric: 'customerSatisfaction', change: 15, description: 'Orders fulfilled on time' },
              { department: 'finance', metric: 'cashFlow', change: -120, description: 'Expensive emergency sourcing' },
              { department: 'finance', metric: 'profitMargin', change: -8, description: 'Margin compression' },
              { department: 'marketing', metric: 'brandAwareness', change: 10, description: 'Reliable reputation' },
            ],
          },
          {
            label: 'In-house Production (High upfront, long-term savings)',
            value: 'inhouse',
            impacts: [
              { department: 'finance', metric: 'cashFlow', change: -150, description: 'Equipment and setup costs' },
              { department: 'research', metric: 'innovation', change: 15, description: 'New capabilities developed' },
              { department: 'hr', metric: 'talentQuality', change: 10, description: 'Manufacturing expertise gained' },
              { department: 'sales', metric: 'customerSatisfaction', change: -10, description: 'Delayed orders during setup' },
              { department: 'finance', metric: 'investorConfidence', change: 10, description: 'Strategic independence' },
            ],
          },
          {
            label: 'Delay & Negotiate (Wait for market stabilization)',
            value: 'delay',
            impacts: [
              { department: 'sales', metric: 'customerSatisfaction', change: -20, description: 'Significant order delays' },
              { department: 'sales', metric: 'revenue', change: -80, description: 'Lost sales' },
              { department: 'marketing', metric: 'brandAwareness', change: -15, description: 'Reputation damage' },
              { department: 'finance', metric: 'cashFlow', change: 30, description: 'Cash preserved' },
            ],
          },
        ],
      },
      {
        id: 'sd-2-2',
        title: 'Crisis Communication Plan',
        description: 'Submit your stakeholder communication strategy (PDF)',
        type: 'file-upload',
        fileConfig: {
          acceptedFormats: ['.pdf'],
          maxSize: 10,
          scoringRubric: `Transparency (30%), Stakeholder management (30%), Action plan (20%), Tone (20%)`,
        },
      },
      {
        id: 'sd-2-3',
        title: 'Customer Retention Budget',
        description: 'Allocate budget for customer retention (discounts, expedited shipping)',
        type: 'numeric',
        numericConfig: {
          min: 0,
          max: 100,
          unit: '$K',
          impactCalculator: (value: number): DepartmentImpact[] => [
            { department: 'sales' as Department, metric: 'customerSatisfaction', change: value * 0.3, description: 'Retention efforts' },
            { department: 'finance' as Department, metric: 'cashFlow', change: -value, description: 'Retention investment' },
            { department: 'marketing' as Department, metric: 'campaignEffectiveness', change: value * 0.2, description: 'Goodwill created' },
          ],
        },
      },
      {
        id: 'sd-2-4',
        title: 'Employee Overtime Authorization',
        description: 'Approve overtime hours to meet demand (hours per week per employee)',
        type: 'numeric',
        numericConfig: {
          min: 0,
          max: 20,
          unit: 'hours/week',
          impactCalculator: (value: number): DepartmentImpact[] => {
            const impacts: DepartmentImpact[] = [];
            if (value <= 5) {
              impacts.push({ department: 'hr' as Department, metric: 'employeeMorale', change: -2, description: 'Minimal overtime impact' });
              impacts.push({ department: 'sales' as Department, metric: 'revenue', change: 10, description: 'Extra production' });
            } else if (value <= 10) {
              impacts.push({ department: 'hr' as Department, metric: 'employeeMorale', change: -8, description: 'Moderate burnout' });
              impacts.push({ department: 'hr' as Department, metric: 'productivity', change: 5, description: 'Short-term boost' });
              impacts.push({ department: 'sales' as Department, metric: 'revenue', change: 30, description: 'Increased output' });
            } else {
              impacts.push({ department: 'hr' as Department, metric: 'employeeMorale', change: -20, description: 'Severe burnout' });
              impacts.push({ department: 'hr' as Department, metric: 'retentionRate', change: -10, description: 'Turnover risk' });
              impacts.push({ department: 'sales' as Department, metric: 'revenue', change: 40, description: 'Maximum output' });
              impacts.push({ department: 'research' as Department, metric: 'productQuality', change: -10, description: 'Quality issues from fatigue' });
            }
            return impacts;
          },
        },
      },
    ],
    minimumImpact: [
      { department: 'hr', metric: 'employeeMorale', change: -5, description: 'Crisis creates stress' },
    ],
  },
  {
    id: 'decision-3',
    week: 3,
    title: 'Growth Strategy: Expansion or Optimization',
    description: 'Your product has gained traction. Decide how to scale the business.',
    context: `Sales are growing steadily at 20% month-over-month. You have three options:
    expand to new markets, optimize current operations, or invest in R&D for next-gen products.
    Investor board meeting is next month - they expect a clear vision.`,
    deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    subDecisions: [
      {
        id: 'sd-3-1',
        title: 'Strategic Direction',
        description: 'Choose your primary growth strategy',
        type: 'multiple-choice',
        options: [
          {
            label: 'Market Expansion - Enter 3 new geographic markets',
            value: 'expansion',
            impacts: [
              { department: 'marketing', metric: 'marketShare', change: 20, description: 'Geographic expansion' },
              { department: 'sales', metric: 'revenue', change: 150, description: 'New market revenue' },
              { department: 'finance', metric: 'cashFlow', change: -180, description: 'Expansion costs' },
              { department: 'hr', metric: 'talentQuality', change: -10, description: 'Rapid hiring quality challenges' },
              { department: 'finance', metric: 'investorConfidence', change: 15, description: 'Growth vision' },
            ],
          },
          {
            label: 'Operational Excellence - Optimize efficiency and margins',
            value: 'optimization',
            impacts: [
              { department: 'finance', metric: 'profitMargin', change: 12, description: 'Efficiency gains' },
              { department: 'research', metric: 'rdBudgetEfficiency', change: 20, description: 'Better processes' },
              { department: 'hr', metric: 'productivity', change: 15, description: 'Streamlined operations' },
              { department: 'sales', metric: 'salesGrowth', change: -5, description: 'Focus shifts from growth' },
              { department: 'finance', metric: 'cashFlow', change: 80, description: 'Cost savings' },
            ],
          },
          {
            label: 'Innovation Focus - Invest heavily in R&D for Product 2.0',
            value: 'innovation',
            impacts: [
              { department: 'research', metric: 'innovation', change: 25, description: 'Major R&D push' },
              { department: 'research', metric: 'patentsFiled', change: 5, description: 'New IP created' },
              { department: 'finance', metric: 'cashFlow', change: -120, description: 'R&D investment' },
              { department: 'finance', metric: 'investorConfidence', change: 10, description: 'Long-term vision' },
              { department: 'marketing', metric: 'brandAwareness', change: 8, description: 'Innovation reputation' },
            ],
          },
        ],
      },
      {
        id: 'sd-3-2',
        title: 'Investment Pitch Deck',
        description: 'Submit your strategic vision presentation for investors (PDF)',
        type: 'file-upload',
        fileConfig: {
          acceptedFormats: ['.pdf'],
          maxSize: 15,
          scoringRubric: `Vision clarity (25%), Financial projections (25%), Risk mitigation (25%), Market analysis (25%)`,
        },
      },
      {
        id: 'sd-3-3',
        title: 'R&D Budget Allocation',
        description: 'Allocate quarterly R&D budget',
        type: 'numeric',
        numericConfig: {
          min: 20,
          max: 200,
          unit: '$K',
          impactCalculator: (value: number): DepartmentImpact[] => {
            const impacts: DepartmentImpact[] = [];
            impacts.push({ department: 'research' as Department, metric: 'innovation', change: value * 0.15, description: 'R&D investment' });
            impacts.push({ department: 'finance' as Department, metric: 'cashFlow', change: -value, description: 'R&D expenditure' });
            if (value > 120) {
              impacts.push({ department: 'research' as Department, metric: 'productQuality', change: 15, description: 'Significant quality improvements' });
              impacts.push({ department: 'finance' as Department, metric: 'investorConfidence', change: 8, description: 'Innovation commitment' });
            }
            return impacts;
          },
        },
      },
      {
        id: 'sd-3-4',
        title: 'Talent Acquisition Investment',
        description: 'Budget for recruiting senior talent',
        type: 'numeric',
        numericConfig: {
          min: 0,
          max: 150,
          unit: '$K',
          impactCalculator: (value: number): DepartmentImpact[] => [
            { department: 'hr' as Department, metric: 'talentQuality', change: value * 0.2, description: 'Quality hiring' },
            { department: 'hr' as Department, metric: 'productivity', change: value * 0.1, description: 'Experienced talent impact' },
            { department: 'finance' as Department, metric: 'cashFlow', change: -value, description: 'Recruitment costs' },
          ],
        },
      },
    ],
    minimumImpact: [
      { department: 'sales', metric: 'salesGrowth', change: 5, description: 'Natural market momentum' },
    ],
  },
  {
    id: 'decision-4',
    week: 4,
    title: 'Competitive Threat Response',
    description: 'A major competitor launches a product directly targeting your market.',
    context: `Intel reveals that market leader GlobalTech has launched a competing product at 30% lower price.
    Their marketing budget is 5x yours. Early reviews are mixed but their brand recognition is strong.
    You must respond decisively to protect your market position.`,
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
    subDecisions: [
      {
        id: 'sd-4-1',
        title: 'Competitive Response Strategy',
        description: 'Choose how to respond to the competitive threat',
        type: 'multiple-choice',
        options: [
          {
            label: 'Price War - Match their pricing and compete head-on',
            value: 'pricewar',
            impacts: [
              { department: 'sales', metric: 'revenue', change: -40, description: 'Revenue drop from price cuts' },
              { department: 'finance', metric: 'profitMargin', change: -10, description: 'Margin compression' },
              { department: 'marketing', metric: 'marketShare', change: 5, description: 'Defend market position' },
              { department: 'finance', metric: 'investorConfidence', change: -10, description: 'Concern about profitability' },
            ],
          },
          {
            label: 'Differentiation - Emphasize quality and unique features',
            value: 'differentiation',
            impacts: [
              { department: 'marketing', metric: 'brandAwareness', change: 12, description: 'Strong positioning' },
              { department: 'research', metric: 'productQuality', change: 10, description: 'Quality focus' },
              { department: 'sales', metric: 'customerSatisfaction', change: 15, description: 'Value-based selling' },
              { department: 'marketing', metric: 'campaignEffectiveness', change: 10, description: 'Clear messaging' },
            ],
          },
          {
            label: 'Pivot - Target different customer segment they ignore',
            value: 'pivot',
            impacts: [
              { department: 'marketing', metric: 'marketShare', change: -8, description: 'Exit contested segment' },
              { department: 'sales', metric: 'revenue', change: -20, description: 'Short-term revenue dip' },
              { department: 'marketing', metric: 'marketShare', change: 15, description: 'New segment capture' },
              { department: 'research', metric: 'innovation', change: 12, description: 'Adaptive innovation' },
              { department: 'sales', metric: 'salesGrowth', change: 20, description: 'Blue ocean opportunity' },
            ],
          },
        ],
      },
      {
        id: 'sd-4-2',
        title: 'Competitive Analysis Report',
        description: 'Submit detailed competitor analysis and response plan (PDF)',
        type: 'file-upload',
        fileConfig: {
          acceptedFormats: ['.pdf'],
          maxSize: 12,
          scoringRubric: `Competitive intelligence (30%), Strategic response (30%), Execution plan (20%), Risk assessment (20%)`,
        },
      },
      {
        id: 'sd-4-3',
        title: 'Emergency Marketing Fund',
        description: 'Allocate emergency budget for counter-marketing campaign',
        type: 'numeric',
        numericConfig: {
          min: 0,
          max: 200,
          unit: '$K',
          impactCalculator: (value: number): DepartmentImpact[] => {
            const impacts: DepartmentImpact[] = [
              { department: 'marketing' as Department, metric: 'brandAwareness', change: value * 0.15, description: 'Marketing blitz' },
              { department: 'finance' as Department, metric: 'cashFlow', change: -value, description: 'Marketing spend' },
            ];
            if (value > 100) {
              impacts.push({ department: 'marketing' as Department, metric: 'campaignEffectiveness', change: 15, description: 'Dominant presence' });
            }
            return impacts;
          },
        },
      },
      {
        id: 'sd-4-4',
        title: 'Product Enhancement Timeline',
        description: 'Fast-track product improvements (weeks to launch)',
        type: 'numeric',
        numericConfig: {
          min: 2,
          max: 12,
          unit: 'weeks',
          impactCalculator: (value: number): DepartmentImpact[] => {
            const impacts: DepartmentImpact[] = [];
            if (value <= 4) {
              impacts.push({ department: 'research' as Department, metric: 'productQuality', change: -8, description: 'Rushed development' });
              impacts.push({ department: 'hr' as Department, metric: 'employeeMorale', change: -12, description: 'Crunch time stress' });
              impacts.push({ department: 'marketing' as Department, metric: 'brandAwareness', change: 10, description: 'Quick response reputation' });
            } else if (value <= 8) {
              impacts.push({ department: 'research' as Department, metric: 'productQuality', change: 8, description: 'Balanced development' });
              impacts.push({ department: 'research' as Department, metric: 'innovation', change: 10, description: 'Focused innovation' });
            } else {
              impacts.push({ department: 'research' as Department, metric: 'productQuality', change: 15, description: 'Thorough development' });
              impacts.push({ department: 'marketing' as Department, metric: 'marketShare', change: -5, description: 'Slow response loses ground' });
            }
            return impacts;
          },
        },
      },
    ],
    minimumImpact: [
      { department: 'marketing', metric: 'marketShare', change: -10, description: 'Competitive pressure' },
      { department: 'hr', metric: 'employeeMorale', change: -8, description: 'Market anxiety' },
    ],
  },
  {
    id: 'decision-5',
    week: 5,
    title: 'Future Vision: Exit Strategy or Scale',
    description: 'You have received an acquisition offer. Decide the future of your company.',
    context: `Major corporation TechGlobal has offered to acquire TechVenture Inc. for $10M.
    Alternatively, venture capital firm wants to invest $5M for 30% equity to scale globally.
    Or you can continue bootstrapping with current trajectory. This decision will define your legacy.`,
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
    subDecisions: [
      {
        id: 'sd-5-1',
        title: 'Strategic Decision',
        description: 'Choose the future path for your company',
        type: 'multiple-choice',
        options: [
          {
            label: 'Accept Acquisition - $10M exit, team absorbed by TechGlobal',
            value: 'acquisition',
            impacts: [
              { department: 'finance', metric: 'investorConfidence', change: 30, description: 'Successful exit' },
              { department: 'finance', metric: 'cashFlow', change: 10000, description: 'Acquisition proceeds' },
              { department: 'hr', metric: 'employeeMorale', change: -15, description: 'Uncertainty about future' },
              { department: 'marketing', metric: 'brandAwareness', change: 20, description: 'Major acquisition news' },
            ],
          },
          {
            label: 'Take VC Investment - Scale aggressively with $5M injection',
            value: 'vcinvestment',
            impacts: [
              { department: 'finance', metric: 'cashFlow', change: 5000, description: 'Investment capital' },
              { department: 'finance', metric: 'investorConfidence', change: 20, description: 'VC validation' },
              { department: 'hr', metric: 'talentQuality', change: 15, description: 'Attract top talent' },
              { department: 'sales', metric: 'salesGrowth', change: 40, description: 'Funded expansion' },
              { department: 'marketing', metric: 'marketShare', change: 25, description: 'Aggressive growth' },
            ],
          },
          {
            label: 'Continue Bootstrapping - Maintain independence and organic growth',
            value: 'bootstrap',
            impacts: [
              { department: 'hr', metric: 'employeeMorale', change: 15, description: 'Startup culture preserved' },
              { department: 'finance', metric: 'profitMargin', change: 8, description: 'No dilution' },
              { department: 'research', metric: 'innovation', change: 10, description: 'Creative freedom' },
              { department: 'sales', metric: 'salesGrowth', change: -10, description: 'Slower growth rate' },
            ],
          },
        ],
      },
      {
        id: 'sd-5-2',
        title: 'Board Presentation & Recommendation',
        description: 'Submit your strategic recommendation with detailed analysis (PDF)',
        type: 'file-upload',
        fileConfig: {
          acceptedFormats: ['.pdf'],
          maxSize: 20,
          scoringRubric: `Strategic vision (25%), Financial analysis (25%), Stakeholder impact (25%), Long-term planning (25%)`,
        },
      },
      {
        id: 'sd-5-3',
        title: '12-Month Budget Plan',
        description: 'Project your budget for next year under chosen strategy',
        type: 'numeric',
        numericConfig: {
          min: 100,
          max: 5000,
          unit: '$K',
          impactCalculator: (value: number): DepartmentImpact[] => [
            { department: 'finance' as Department, metric: 'investorConfidence', change: Math.min(value * 0.01, 20), description: 'Ambitious planning' },
            { department: 'finance' as Department, metric: 'cashFlow', change: -value * 0.6, description: 'Planned expenditure' },
          ],
        },
      },
      {
        id: 'sd-5-4',
        title: 'Company Culture Investment',
        description: 'Allocate budget for employee retention and culture',
        type: 'numeric',
        numericConfig: {
          min: 0,
          max: 200,
          unit: '$K',
          impactCalculator: (value: number): DepartmentImpact[] => [
            { department: 'hr' as Department, metric: 'employeeMorale', change: value * 0.2, description: 'Culture investment' },
            { department: 'hr' as Department, metric: 'retentionRate', change: value * 0.1, description: 'Retention programs' },
            { department: 'hr' as Department, metric: 'productivity', change: value * 0.08, description: 'Engaged workforce' },
            { department: 'finance' as Department, metric: 'cashFlow', change: -value, description: 'Culture spend' },
          ],
        },
      },
    ],
    minimumImpact: [
      { department: 'finance', metric: 'investorConfidence', change: 10, description: 'Strategic milestone reached' },
    ],
  },
];
