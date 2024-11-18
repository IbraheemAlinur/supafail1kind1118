export interface PostTemplate {
  id: string;
  type: 'ask' | 'offer';
  title: string;
  description: string;
  suggestedKiPoints: number;
  suggestedTags: string[];
  category: 'mentorship' | 'feedback' | 'networking' | 'expertise' | 'resources';
  icon?: string;
}

export const POST_TEMPLATES: PostTemplate[] = [
  // Previous templates remain unchanged...

  // Adding new entrepreneurship templates
  {
    id: 'pitch-deck-review',
    type: 'ask',
    title: 'Seeking Pitch Deck Review',
    description: `Looking for experienced founders/investors to review my startup pitch deck.

Current Stage:
- [Seed/Series A/etc.]
- [Industry/vertical]
- [Traction metrics if any]

Specific Areas for Feedback:
- Story flow and narrative
- Market size and opportunity
- Business model validation
- Financial projections
- Competition analysis
- [Other specific areas]

Deck Details:
- [Number] slides
- [Target audience]
- [Purpose: fundraising/competition/etc.]

Please include in your response:
- Your startup/investment experience
- Areas of expertise
- Review timeline
- Preferred feedback format`,
    suggestedKiPoints: 500,
    suggestedTags: ['Startup', 'Pitch Deck', 'Feedback', 'Investment'],
    category: 'feedback'
  },
  {
    id: 'user-interviews',
    type: 'ask',
    title: 'Seeking Participants for User Research',
    description: `Looking for [target persona] to participate in user research interviews for [product/service].

Research Goals:
- Understand [specific pain points]
- Validate [assumptions/hypotheses]
- Gather feedback on [features/concepts]

Ideal Participant Profile:
- Role: [job title/position]
- Industry: [specific sectors]
- Experience with: [relevant tools/processes]
- Pain points around: [specific challenges]

Interview Details:
- Duration: [length] minutes
- Format: [Video call/In-person]
- Schedule: [Timeframe]
- Compensation: [Incentive if any]

What's Involved:
- Brief background discussion
- Task-based scenarios
- Feedback session
- Follow-up questions

Please share:
- Your relevant experience
- Current role/industry
- Key challenges you face
- Availability for interview`,
    suggestedKiPoints: 300,
    suggestedTags: ['Research', 'User Interviews', 'Product', 'Feedback'],
    category: 'feedback'
  },
  {
    id: 'community-strategy',
    type: 'ask',
    title: 'Community Strategy Consultation',
    description: `Seeking experienced community builder for strategic guidance on [community type/focus].

Current Community Status:
- Size: [member count]
- Stage: [Launch/Growth/Mature]
- Platform: [Community platform]
- Focus: [Main purpose/theme]

Key Challenges:
- [Challenge 1]
- [Challenge 2]
- [Challenge 3]

Areas Needing Input:
- Member engagement strategies
- Content programming
- Moderation framework
- Growth tactics
- Monetization options
- [Other specific areas]

Deliverables Needed:
- Strategic recommendations
- Action plan outline
- Resource requirements
- Success metrics

Please share:
- Community building experience
- Success stories
- Approach to strategy
- Availability for consultation`,
    suggestedKiPoints: 700,
    suggestedTags: ['Community', 'Strategy', 'Growth', 'Engagement'],
    category: 'expertise'
  },
  {
    id: 'investor-intro',
    type: 'ask',
    title: 'Seeking Investor Introductions',
    description: `Looking for warm introductions to investors interested in [industry/vertical].

Company Overview:
- Product: [Brief description]
- Stage: [Development stage]
- Traction: [Key metrics]
- Team: [Key members/background]

Investment Details:
- Round Size: [Target amount]
- Stage: [Seed/Series A/etc.]
- Use of Funds: [Primary purposes]
- Current Commitments: [If any]

Ideal Investor Profile:
- Focus: [Industry/vertical]
- Stage: [Investment stage]
- Value-Add: [Strategic benefits]
- Check Size: [Range]

Materials Ready:
- Pitch deck
- Financial model
- Product demo
- Team bios
- [Other materials]

Please include:
- Your investor network
- Previous introduction success
- Preferred intro process
- Timeline expectations`,
    suggestedKiPoints: 800,
    suggestedTags: ['Investment', 'Networking', 'Startup', 'Introductions'],
    category: 'networking'
  },
  {
    id: 'mentor-matching',
    type: 'ask',
    title: 'Seeking Startup Mentor',
    description: `Looking for an experienced mentor to provide guidance on [specific areas].

Startup Details:
- Industry: [Sector/vertical]
- Stage: [Development phase]
- Team Size: [Number]
- Current Challenges: [Key issues]

Mentorship Needs:
- [Area 1]: [Specific guidance needed]
- [Area 2]: [Specific guidance needed]
- [Area 3]: [Specific guidance needed]

Commitment Desired:
- Frequency: [Meeting cadence]
- Duration: [Length of engagement]
- Format: [In-person/Virtual]
- Structure: [Formal/Informal]

What We Offer:
- Regular updates
- Clear goals/metrics
- Committed team
- [Other value props]

Please share:
- Relevant experience
- Mentoring style
- Success stories
- Availability/preferences`,
    suggestedKiPoints: 600,
    suggestedTags: ['Mentorship', 'Startup', 'Guidance', 'Growth'],
    category: 'mentorship'
  },
  {
    id: 'offer-founder-coaching',
    type: 'offer',
    title: 'Startup Founder Coaching Available',
    description: `Experienced founder offering coaching sessions for early-stage entrepreneurs.

Areas of Expertise:
- Product Strategy
- Go-to-Market Planning
- Team Building
- Fundraising
- [Other areas]

Coaching Format:
- 1:1 Sessions
- Goal Setting
- Action Planning
- Progress Reviews
- Resource Sharing

What You'll Get:
- Structured guidance
- Practical frameworks
- Network access
- Resource recommendations
- Accountability support

Previous Experience:
- Founded [number] companies
- Raised [amount] in funding
- Exits: [If applicable]
- Industries: [Sectors]

Ideal for founders who:
- Are at [stage]
- Need help with [areas]
- Committed to [goals]
- Value [attributes]

Available Formats:
- Single sessions
- Monthly retainer
- Custom programs
- Group workshops`,
    suggestedKiPoints: 1000,
    suggestedTags: ['Coaching', 'Startup', 'Founder', 'Mentorship'],
    category: 'mentorship'
  }
];

export const getTemplatesByType = (type: 'ask' | 'offer'): PostTemplate[] => {
  return POST_TEMPLATES.filter(template => template.type === type);
};

export const getTemplatesByCategory = (category: PostTemplate['category']): PostTemplate[] => {
  return POST_TEMPLATES.filter(template => template.category === category);
};

export const getTemplateById = (id: string): PostTemplate | undefined => {
  return POST_TEMPLATES.find(template => template.id === id);
};