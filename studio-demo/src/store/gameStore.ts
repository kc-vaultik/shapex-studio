/**
 * Zustand Game Store - AI Venture Studio
 * Core state management for the isometric game simulation
 * Handles: Resources, Agents, Game Loop, Portfolio, Phases
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type GamePhase =
  | 'IDLE'           // Waiting for player to select an idea
  | 'RESEARCHING'    // Blue zone active - Market analysis
  | 'VALIDATING'     // Yellow zone active - Risk assessment
  | 'STRATEGIZING'   // Purple zone active - Growth planning
  | 'DECISION'       // Player must choose: BUILD/PIVOT/PASS
  | 'BUILDING'       // Company being built
  | 'CELEBRATING'    // Success animation

export type AgentStatus =
  | 'IDLE'           // Waiting for assignment
  | 'WORKING'        // Actively processing
  | 'SUCCESS'        // Task completed successfully
  | 'FAILURE'        // Task failed
  | 'BLOCKED'        // Waiting for dependency

export type AgentRole = 'researcher' | 'validator' | 'strategist'

export interface Agent {
  id: AgentRole
  name: string
  status: AgentStatus
  progress: number        // 0-100%
  currentTask: string | null
  position: { x: number; y: number; z: number }  // 3D position in office
  zone: 'research' | 'ideation' | 'strategy'     // Current zone
  color: string          // Neon color theme
  results: AgentResult | null
}

export interface AgentResult {
  score: number          // 0-100
  insights: string[]     // Key findings
  risks: string[]        // Identified risks
  recommendations: string[]
  cost: number          // API cost for this analysis
  duration: number      // Seconds taken
}

export interface Idea {
  id: string
  title: string
  description: string
  source: 'YC_RFS' | 'A16Z' | 'PRODUCT_HUNT' | 'GOOGLE_TRENDS'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT'
  estimatedRevenue: number
  analysisCost: number  // Cost to analyze this idea
  marketSize: string
  tags: string[]
}

export interface Company {
  id: string
  ideaId: string
  name: string
  stage: 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH' | 'FAILED'
  monthlyRevenue: number
  totalRevenue: number
  totalCost: number
  foundedAt: number      // Timestamp
  employees: number
  valuation: number
}

export interface Resources {
  money: number          // Starting capital
  reputation: number     // Earned through successes (0-100)
  level: number          // Player level (unlocks features)
  experience: number     // XP for leveling up
}

export interface GameStats {
  companiesLaunched: number
  companiesFailed: number
  totalRevenue: number
  totalSpent: number
  ideasAnalyzed: number
  agentTasksCompleted: number
  timePlayedSeconds: number
}

// ============================================================================
// STORE INTERFACE
// ============================================================================

interface GameState {
  // Core Resources
  resources: Resources

  // Game State
  currentPhase: GamePhase
  isPlaying: boolean
  isPaused: boolean
  gameSpeed: 1 | 2 | 4  // Time multiplier

  // Agents (State Machines)
  agents: Record<AgentRole, Agent>

  // Ideas & Portfolio
  currentIdea: Idea | null
  availableIdeas: Idea[]
  portfolio: Company[]

  // Analysis Results
  currentAnalysis: {
    ideaId: string
    startedAt: number
    research: AgentResult | null
    validation: AgentResult | null
    strategy: AgentResult | null
    overallScore: number | null
  } | null

  // Stats & Achievements
  stats: GameStats
  achievements: string[]

  // UI State
  showIdeaBoard: boolean
  showDecisionModal: boolean
  showPortfolio: boolean
  selectedZone: 'research' | 'ideation' | 'strategy' | null

  // ========================================================================
  // ACTIONS - Game Flow
  // ========================================================================

  /** Initialize/Reset the game */
  initGame: () => void

  /** Start analyzing an idea */
  selectIdea: (idea: Idea) => void

  /** Progress through analysis phases */
  startResearchPhase: () => void
  startValidationPhase: () => void
  startStrategyPhase: () => void
  completeAnalysis: () => void

  /** Agent updates */
  updateAgent: (role: AgentRole, updates: Partial<Agent>) => void
  setAgentResult: (role: AgentRole, result: AgentResult) => void
  moveAgentToZone: (role: AgentRole, zone: Agent['zone']) => void

  /** Decision actions */
  buildCompany: () => void
  pivotIdea: () => void
  passIdea: () => void

  /** Resource management */
  addMoney: (amount: number) => void
  spendMoney: (amount: number) => boolean  // Returns false if insufficient funds
  addReputation: (amount: number) => void
  addExperience: (amount: number) => void

  /** Portfolio management */
  addCompany: (company: Company) => void
  updateCompany: (id: string, updates: Partial<Company>) => void

  /** UI Controls */
  toggleIdeaBoard: () => void
  toggleDecisionModal: () => void
  togglePortfolio: () => void
  selectZone: (zone: Agent['zone'] | null) => void
  setGameSpeed: (speed: 1 | 2 | 4) => void

  /** Game loop */
  tick: () => void  // Called every frame for animations/updates
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialResources: Resources = {
  money: 100000,         // Start with $100k
  reputation: 0,
  level: 1,
  experience: 0
}

const initialAgents: Record<AgentRole, Agent> = {
  researcher: {
    id: 'researcher',
    name: 'Research Agent',
    status: 'IDLE',
    progress: 0,
    currentTask: null,
    position: { x: -5, y: 0, z: 0 },  // Left zone
    zone: 'research',
    color: '#00F0FF',  // Neon Cyan
    results: null
  },
  validator: {
    id: 'validator',
    name: 'Validation Agent',
    status: 'IDLE',
    progress: 0,
    currentTask: null,
    position: { x: 0, y: 0, z: 0 },   // Center zone
    zone: 'ideation',
    color: '#FFD600',  // Safety Yellow
    results: null
  },
  strategist: {
    id: 'strategist',
    name: 'Strategy Agent',
    status: 'IDLE',
    progress: 0,
    currentTask: null,
    position: { x: 5, y: 0, z: 0 },   // Right zone
    zone: 'strategy',
    color: '#BD00FF',  // Deep Purple
    results: null
  }
}

const initialStats: GameStats = {
  companiesLaunched: 0,
  companiesFailed: 0,
  totalRevenue: 0,
  totalSpent: 0,
  ideasAnalyzed: 0,
  agentTasksCompleted: 0,
  timePlayedSeconds: 0
}

// Sample ideas for the game
const SAMPLE_IDEAS: Idea[] = [
  {
    id: '1',
    title: 'AI-Powered Meal Planning for Families',
    description: 'Help busy families save time and money with personalized meal plans and grocery lists generated by AI.',
    source: 'YC_RFS',
    difficulty: 'MEDIUM',
    estimatedRevenue: 50000,
    analysisCost: 5000,
    marketSize: '$2.5B',
    tags: ['Consumer', 'AI', 'Food Tech']
  },
  {
    id: '2',
    title: 'Code Review Automation for Startups',
    description: 'Automated code quality checks and review suggestions powered by Claude to help small teams ship faster.',
    source: 'PRODUCT_HUNT',
    difficulty: 'HARD',
    estimatedRevenue: 100000,
    analysisCost: 7500,
    marketSize: '$5B+',
    tags: ['Developer Tools', 'AI', 'B2B SaaS']
  },
  {
    id: '3',
    title: 'Local Business Podcast Generator',
    description: 'Turn local business blogs and news into AI-generated podcasts to reach customers on-the-go.',
    source: 'YC_RFS',
    difficulty: 'EASY',
    estimatedRevenue: 30000,
    analysisCost: 3000,
    marketSize: '$800M',
    tags: ['B2B SaaS', 'AI', 'Content']
  },
  {
    id: '4',
    title: 'Solar Panel ROI Calculator',
    description: 'Help homeowners make informed decisions about solar installations with accurate financial projections.',
    source: 'GOOGLE_TRENDS',
    difficulty: 'MEDIUM',
    estimatedRevenue: 40000,
    analysisCost: 4000,
    marketSize: '$1.2B',
    tags: ['Climate Tech', 'FinTech', 'Consumer']
  },
  {
    id: '5',
    title: 'Freelancer Contract Management',
    description: 'Simple contract generation, e-signatures, and payment tracking for freelancers and agencies.',
    source: 'YC_RFS',
    difficulty: 'MEDIUM',
    estimatedRevenue: 60000,
    analysisCost: 5000,
    marketSize: '$3.5B',
    tags: ['Productivity', 'Legal Tech', 'B2B SaaS']
  }
]

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        resources: initialResources,
        currentPhase: 'IDLE',
        isPlaying: false,
        isPaused: false,
        gameSpeed: 1,
        agents: initialAgents,
        currentIdea: null,
        availableIdeas: SAMPLE_IDEAS,
        portfolio: [],
        currentAnalysis: null,
        stats: initialStats,
        achievements: [],
        showIdeaBoard: false,
        showDecisionModal: false,
        showPortfolio: false,
        selectedZone: null,

        // ====================================================================
        // GAME FLOW ACTIONS
        // ====================================================================

        initGame: () => {
          set({
            resources: initialResources,
            currentPhase: 'IDLE',
            isPlaying: true,
            isPaused: false,
            agents: initialAgents,
            currentIdea: null,
            currentAnalysis: null,
            showIdeaBoard: true,  // Show idea board on start
            stats: { ...initialStats }
          })
        },

        selectIdea: (idea: Idea) => {
          const { resources, spendMoney } = get()

          // Check if player can afford analysis
          if (!spendMoney(idea.analysisCost)) {
            console.warn('Insufficient funds to analyze idea')
            return
          }

          set({
            currentIdea: idea,
            currentAnalysis: {
              ideaId: idea.id,
              startedAt: Date.now(),
              research: null,
              validation: null,
              strategy: null,
              overallScore: null
            },
            showIdeaBoard: false,
            currentPhase: 'RESEARCHING'
          })

          // Auto-start research phase
          get().startResearchPhase()
        },

        startResearchPhase: () => {
          set((state) => ({
            currentPhase: 'RESEARCHING',
            agents: {
              ...state.agents,
              researcher: {
                ...state.agents.researcher,
                status: 'WORKING',
                progress: 0,
                currentTask: 'Analyzing market trends and competition...'
              }
            }
          }))

          // Move researcher to research zone
          get().moveAgentToZone('researcher', 'research')
        },

        startValidationPhase: () => {
          set((state) => ({
            currentPhase: 'VALIDATING',
            agents: {
              ...state.agents,
              researcher: {
                ...state.agents.researcher,
                status: 'SUCCESS',
                progress: 100
              },
              validator: {
                ...state.agents.validator,
                status: 'WORKING',
                progress: 0,
                currentTask: 'Validating feasibility and risks...'
              }
            }
          }))

          get().moveAgentToZone('validator', 'ideation')
        },

        startStrategyPhase: () => {
          set((state) => ({
            currentPhase: 'STRATEGIZING',
            agents: {
              ...state.agents,
              validator: {
                ...state.agents.validator,
                status: 'SUCCESS',
                progress: 100
              },
              strategist: {
                ...state.agents.strategist,
                status: 'WORKING',
                progress: 0,
                currentTask: 'Planning growth strategy...'
              }
            }
          }))

          get().moveAgentToZone('strategist', 'strategy')
        },

        completeAnalysis: () => {
          const { currentAnalysis, stats } = get()

          if (!currentAnalysis) return

          // Calculate overall score
          const scores = [
            currentAnalysis.research?.score || 0,
            currentAnalysis.validation?.score || 0,
            currentAnalysis.strategy?.score || 0
          ]
          const overallScore = Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          )

          set((state) => ({
            currentPhase: 'DECISION',
            currentAnalysis: currentAnalysis ? {
              ...currentAnalysis,
              overallScore
            } : null,
            agents: {
              ...state.agents,
              strategist: {
                ...state.agents.strategist,
                status: 'SUCCESS',
                progress: 100
              }
            },
            showDecisionModal: true,
            stats: {
              ...stats,
              ideasAnalyzed: stats.ideasAnalyzed + 1,
              agentTasksCompleted: stats.agentTasksCompleted + 3
            }
          }))
        },

        // ====================================================================
        // AGENT ACTIONS
        // ====================================================================

        updateAgent: (role: AgentRole, updates: Partial<Agent>) => {
          set((state) => ({
            agents: {
              ...state.agents,
              [role]: {
                ...state.agents[role],
                ...updates
              }
            }
          }))
        },

        setAgentResult: (role: AgentRole, result: AgentResult) => {
          set((state) => ({
            agents: {
              ...state.agents,
              [role]: {
                ...state.agents[role],
                results: result,
                status: 'SUCCESS'
              }
            },
            currentAnalysis: state.currentAnalysis ? {
              ...state.currentAnalysis,
              [role === 'researcher' ? 'research' :
               role === 'validator' ? 'validation' : 'strategy']: result
            } : null
          }))

          // Progress to next phase
          const { currentPhase, startValidationPhase, startStrategyPhase, completeAnalysis } = get()

          if (currentPhase === 'RESEARCHING') {
            startValidationPhase()
          } else if (currentPhase === 'VALIDATING') {
            startStrategyPhase()
          } else if (currentPhase === 'STRATEGIZING') {
            completeAnalysis()
          }
        },

        moveAgentToZone: (role: AgentRole, zone: Agent['zone']) => {
          const positions = {
            research: { x: -5, y: 0, z: 0 },
            ideation: { x: 0, y: 0, z: 0 },
            strategy: { x: 5, y: 0, z: 0 }
          }

          set((state) => ({
            agents: {
              ...state.agents,
              [role]: {
                ...state.agents[role],
                zone,
                position: positions[zone]
              }
            }
          }))
        },

        // ====================================================================
        // DECISION ACTIONS
        // ====================================================================

        buildCompany: () => {
          const { currentIdea, currentAnalysis, addCompany, addExperience } = get()

          if (!currentIdea || !currentAnalysis) return

          const buildCost = 50000  // $50k to build
          if (!get().spendMoney(buildCost)) {
            console.warn('Insufficient funds to build company')
            return
          }

          const company: Company = {
            id: `company-${Date.now()}`,
            ideaId: currentIdea.id,
            name: currentIdea.title,
            stage: 'PRE_SEED',
            monthlyRevenue: 0,
            totalRevenue: 0,
            totalCost: buildCost,
            foundedAt: Date.now(),
            employees: 1,
            valuation: 0
          }

          addCompany(company)
          addExperience(100)  // Big XP reward

          set({
            currentPhase: 'CELEBRATING',
            showDecisionModal: false
          })

          // Reset after celebration
          setTimeout(() => {
            set({
              currentPhase: 'IDLE',
              currentIdea: null,
              currentAnalysis: null,
              agents: initialAgents,
              showIdeaBoard: true
            })
          }, 3000)
        },

        pivotIdea: () => {
          const pivotCost = 25000
          if (!get().spendMoney(pivotCost)) {
            console.warn('Insufficient funds to pivot')
            return
          }

          get().addExperience(50)

          set({
            currentPhase: 'IDLE',
            currentIdea: null,
            currentAnalysis: null,
            agents: initialAgents,
            showDecisionModal: false,
            showIdeaBoard: true
          })
        },

        passIdea: () => {
          get().addExperience(10)

          set({
            currentPhase: 'IDLE',
            currentIdea: null,
            currentAnalysis: null,
            agents: initialAgents,
            showDecisionModal: false,
            showIdeaBoard: true
          })
        },

        // ====================================================================
        // RESOURCE MANAGEMENT
        // ====================================================================

        addMoney: (amount: number) => {
          set((state) => ({
            resources: {
              ...state.resources,
              money: state.resources.money + amount
            },
            stats: {
              ...state.stats,
              totalRevenue: state.stats.totalRevenue + amount
            }
          }))
        },

        spendMoney: (amount: number) => {
          const { resources } = get()

          if (resources.money < amount) {
            return false
          }

          set((state) => ({
            resources: {
              ...state.resources,
              money: state.resources.money - amount
            },
            stats: {
              ...state.stats,
              totalSpent: state.stats.totalSpent + amount
            }
          }))

          return true
        },

        addReputation: (amount: number) => {
          set((state) => ({
            resources: {
              ...state.resources,
              reputation: Math.min(100, state.resources.reputation + amount)
            }
          }))
        },

        addExperience: (amount: number) => {
          set((state) => {
            const newXP = state.resources.experience + amount
            const xpForNextLevel = state.resources.level * 1000

            // Level up if enough XP
            if (newXP >= xpForNextLevel) {
              return {
                resources: {
                  ...state.resources,
                  level: state.resources.level + 1,
                  experience: newXP - xpForNextLevel
                }
              }
            }

            return {
              resources: {
                ...state.resources,
                experience: newXP
              }
            }
          })
        },

        // ====================================================================
        // PORTFOLIO MANAGEMENT
        // ====================================================================

        addCompany: (company: Company) => {
          set((state) => ({
            portfolio: [...state.portfolio, company],
            stats: {
              ...state.stats,
              companiesLaunched: state.stats.companiesLaunched + 1
            }
          }))

          get().addReputation(10)
        },

        updateCompany: (id: string, updates: Partial<Company>) => {
          set((state) => ({
            portfolio: state.portfolio.map(company =>
              company.id === id ? { ...company, ...updates } : company
            )
          }))
        },

        // ====================================================================
        // UI CONTROLS
        // ====================================================================

        toggleIdeaBoard: () => {
          set((state) => ({ showIdeaBoard: !state.showIdeaBoard }))
        },

        toggleDecisionModal: () => {
          set((state) => ({ showDecisionModal: !state.showDecisionModal }))
        },

        togglePortfolio: () => {
          set((state) => ({ showPortfolio: !state.showPortfolio }))
        },

        selectZone: (zone: Agent['zone'] | null) => {
          set({ selectedZone: zone })
        },

        setGameSpeed: (speed: 1 | 2 | 4) => {
          set({ gameSpeed: speed })
        },

        // ====================================================================
        // GAME LOOP
        // ====================================================================

        tick: () => {
          const { currentPhase, agents, gameSpeed, stats } = get()

          // Update playtime
          set((state) => ({
            stats: {
              ...state.stats,
              timePlayedSeconds: state.stats.timePlayedSeconds + (1 / 60) * gameSpeed
            }
          }))

          // Simulate agent progress during work phases
          if (currentPhase === 'RESEARCHING' && agents.researcher.status === 'WORKING') {
            const newProgress = Math.min(100, agents.researcher.progress + (0.5 * gameSpeed))
            get().updateAgent('researcher', { progress: newProgress })
          }

          if (currentPhase === 'VALIDATING' && agents.validator.status === 'WORKING') {
            const newProgress = Math.min(100, agents.validator.progress + (0.5 * gameSpeed))
            get().updateAgent('validator', { progress: newProgress })
          }

          if (currentPhase === 'STRATEGIZING' && agents.strategist.status === 'WORKING') {
            const newProgress = Math.min(100, agents.strategist.progress + (0.5 * gameSpeed))
            get().updateAgent('strategist', { progress: newProgress })
          }
        }
      }),
      {
        name: 'ai-venture-studio-game',
        partialize: (state) => ({
          resources: state.resources,
          portfolio: state.portfolio,
          stats: state.stats,
          achievements: state.achievements
        })
      }
    ),
    { name: 'GameStore' }
  )
)

// ============================================================================
// SELECTORS (Optimized access patterns)
// ============================================================================

export const selectResources = (state: GameState) => state.resources
export const selectAgents = (state: GameState) => state.agents
export const selectCurrentPhase = (state: GameState) => state.currentPhase
export const selectPortfolio = (state: GameState) => state.portfolio
export const selectStats = (state: GameState) => state.stats
export const selectIsAnalyzing = (state: GameState) =>
  ['RESEARCHING', 'VALIDATING', 'STRATEGIZING'].includes(state.currentPhase)
