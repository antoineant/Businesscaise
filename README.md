# BusinessCase

**An Interactive Business Strategy Simulation Game for Students**

BusinessCase is a comprehensive, choose-your-adventure style business game designed for business students to experience the complexity of running a company. Teams make strategic decisions across 5 weeks, with each choice impacting all departments: Marketing, Sales, Research & Development, Finance, and Human Resources.

## Features

### Multi-Department Business Simulation
- **5 Core Departments**: Every decision affects Marketing, Sales, R&D, Finance, and HR
- **Cross-Department Impact**: Realistic business scenarios where choices have ripple effects
- **Real-Time Metrics**: Visual dashboards showing company performance across all areas

### Rich Decision-Making System
- **5 Major Decisions**: Strategic challenges spread across 5 weeks
- **Multiple Sub-Decisions**: Each major decision has 3-4 tactical choices
- **Varied Input Types**:
  - Numeric inputs (budget allocation, hiring numbers, etc.)
  - PDF uploads for creative work (marketing campaigns, strategic plans)
  - Multiple choice strategic decisions

### Competitive Team Environment
- **Team-Based Gameplay**: Multiple teams compete simultaneously
- **Live Leaderboard**: Real-time rankings based on multi-dimensional scoring
- **Score Calculation**: Balanced scoring across all 5 departments
- **Progress Tracking**: Save/load game state with localStorage

### Educational Value
- **Realistic Scenarios**: Based on actual business challenges
  - Product launches
  - Supply chain disruptions
  - Growth strategy decisions
  - Competitive threats
  - Exit strategy planning

- **Consequence System**: Decisions have lasting impacts on business metrics
- **Strategic Thinking**: Requires balancing short-term and long-term goals
- **Creative Problem Solving**: PDF submissions allow for innovative solutions

## Game Structure

### Week 1: Product Launch Strategy
- Marketing budget allocation
- Creative campaign development (PDF submission)
- Pricing strategy selection
- Initial hiring decisions

### Week 2: Crisis Management - Supply Chain Disruption
- Emergency supplier decisions
- Crisis communication plan (PDF submission)
- Customer retention budget
- Employee overtime authorization

### Week 3: Growth Strategy - Expansion or Optimization
- Strategic direction selection
- Investment pitch deck (PDF submission)
- R&D budget allocation
- Talent acquisition investment

### Week 4: Competitive Threat Response
- Competitive response strategy
- Competitor analysis report (PDF submission)
- Emergency marketing fund
- Product enhancement timeline

### Week 5: Future Vision - Exit Strategy or Scale
- Strategic decision (acquisition vs. VC vs. bootstrap)
- Board presentation (PDF submission)
- 12-month budget planning
- Company culture investment

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React hooks with localStorage persistence
- **Charts**: Recharts (for future data visualization)
- **Icons**: Lucide React

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### For Students/Teams

1. **Create Your Team**
   - Enter team name
   - Add team member names
   - Select your team color (auto-assigned)

2. **View Your Dashboard**
   - Monitor 5 department metrics in real-time
   - Track your overall score
   - View your position on the leaderboard

3. **Make Decisions**
   - Read the weekly scenario carefully
   - Consider impacts across all departments
   - Submit numeric values using sliders
   - Upload PDF documents for creative decisions
   - Choose from strategic options

4. **Compete and Learn**
   - Advance through 5 weeks
   - See how your decisions impact the business
   - Compare performance with other teams

### For Instructors

1. **Review Creative Submissions**
   - Access uploaded PDFs through browser localStorage
   - Score submissions using provided rubrics
   - Provide feedback to teams

2. **Monitor Progress**
   - View leaderboard to track team performance
   - Use metrics dashboard to assess decision quality
   - Reset game for new cohorts

## Scoring System

Teams are scored across all 5 departments with weighted contributions:

- **Marketing (20%)**: Brand awareness, customer acquisition, market share, campaign effectiveness
- **Sales (25%)**: Revenue, conversion rate, customer satisfaction, sales growth
- **Research & Development (20%)**: Innovation, product quality, R&D efficiency, patents
- **Finance (20%)**: Cash flow, profit margin, debt ratio (inverse), investor confidence
- **Human Resources (15%)**: Employee morale, productivity, retention rate, talent quality

## File Structure

```
businesscase/
├── src/
│   ├── components/
│   │   ├── DepartmentDashboard.tsx    # Metrics visualization
│   │   ├── DecisionView.tsx           # Decision interface
│   │   ├── FileUpload.tsx             # PDF upload component
│   │   ├── Leaderboard.tsx            # Team rankings
│   │   └── TeamSetup.tsx              # Team management
│   ├── data/
│   │   └── gameData.ts                # Game scenarios and decisions
│   ├── types/
│   │   └── game.ts                    # TypeScript interfaces
│   ├── utils/
│   │   └── gameEngine.ts              # Core game logic
│   ├── App.tsx                        # Main application
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Customization

### Adding New Scenarios

Edit `src/data/gameData.ts` to add or modify decisions:

```typescript
{
  id: 'decision-6',
  week: 6,
  title: 'Your Decision Title',
  description: 'Brief description',
  context: 'Detailed scenario context...',
  deadline: '...',
  subDecisions: [
    // Your sub-decisions
  ],
  minimumImpact: [
    // Base impacts
  ]
}
```

### Modifying Department Metrics

Edit `initialMetrics` in `src/data/gameData.ts` to change starting values.

### Adjusting Scoring Weights

Modify `calculateTeamScore()` in `src/utils/gameEngine.ts`.

## Future Enhancements

- [ ] Admin dashboard for reviewing PDF submissions
- [ ] Export game results to CSV/Excel
- [ ] Advanced data visualization with charts
- [ ] Multi-session support (instructor-led games)
- [ ] AI-powered feedback on creative submissions
- [ ] Mobile-responsive improvements
- [ ] Real-time multiplayer with WebSockets
- [ ] Historical decision playback
- [ ] Customizable scenarios per instructor

## Educational Applications

- **MBA Programs**: Strategic management courses
- **Undergraduate Business**: Intro to business, entrepreneurship
- **Executive Education**: Leadership and decision-making workshops
- **Corporate Training**: Management development programs
- **High School Business**: Introduction to business concepts

## License

MIT License - Feel free to use and modify for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for business education
