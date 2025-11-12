import { TeamModel, Team } from '../models/Team.model';
import { GameModel } from '../models/Game.model';

/**
 * Pod Assignment Service
 * Handles assigning teams to pods for large class scalability
 */

export interface PodInfo {
  pod_id: string;
  pod_name: string;
  teams: Team[];
  team_count: number;
  avg_score: number;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate pod ID and name
 */
function generatePodInfo(index: number): { pod_id: string; pod_name: string } {
  // Generate pod_A, pod_B, etc.
  const letter = String.fromCharCode(65 + index); // 65 = 'A'
  return {
    pod_id: `pod_${letter}`,
    pod_name: `Pod ${letter}`
  };
}

/**
 * Assign teams to pods randomly
 * This is the default assignment method
 */
export async function assignPodsRandomly(gameId: string, podSize: number): Promise<PodInfo[]> {
  // Get all teams for the game
  const teams = await TeamModel.findByGame(gameId);

  if (teams.length === 0) {
    throw new Error('No teams found for this game');
  }

  // Shuffle teams for random assignment
  const shuffledTeams = shuffleArray(teams);

  // Calculate number of pods needed
  const podCount = Math.ceil(teams.length / podSize);
  const pods: PodInfo[] = [];

  // Assign teams to pods
  for (let i = 0; i < podCount; i++) {
    const { pod_id, pod_name } = generatePodInfo(i);
    const startIndex = i * podSize;
    const endIndex = Math.min(startIndex + podSize, shuffledTeams.length);
    const podTeams = shuffledTeams.slice(startIndex, endIndex);

    // Update each team with pod assignment
    for (const team of podTeams) {
      await TeamModel.updatePod(team.id, pod_id, pod_name);
    }

    // Refresh team data to get updated pod info
    const updatedTeams = await TeamModel.findByPod(gameId, pod_id);

    pods.push({
      pod_id,
      pod_name,
      teams: updatedTeams,
      team_count: updatedTeams.length,
      avg_score: updatedTeams.reduce((sum, t) => sum + t.overall_score, 0) / updatedTeams.length || 0
    });
  }

  return pods;
}

/**
 * Assign a single team to a specific pod
 * Used for manual pod assignment
 */
export async function assignTeamToPod(
  teamId: string,
  podId: string,
  podName: string
): Promise<Team> {
  const team = await TeamModel.updatePod(teamId, podId, podName);

  if (!team) {
    throw new Error('Team not found');
  }

  return team;
}

/**
 * Get all pods for a game with team details
 */
export async function getGamePods(gameId: string): Promise<PodInfo[]> {
  const teams = await TeamModel.findByGame(gameId);

  // Group teams by pod
  const podMap = new Map<string, Team[]>();

  for (const team of teams) {
    if (team.pod_id) {
      if (!podMap.has(team.pod_id)) {
        podMap.set(team.pod_id, []);
      }
      podMap.get(team.pod_id)!.push(team);
    }
  }

  // Convert to PodInfo array
  const pods: PodInfo[] = [];

  for (const [pod_id, podTeams] of podMap.entries()) {
    const pod_name = podTeams[0]?.pod_name || pod_id;
    pods.push({
      pod_id,
      pod_name,
      teams: podTeams,
      team_count: podTeams.length,
      avg_score: podTeams.reduce((sum, t) => sum + t.overall_score, 0) / podTeams.length || 0
    });
  }

  // Sort pods by ID
  pods.sort((a, b) => a.pod_id.localeCompare(b.pod_id));

  return pods;
}

/**
 * Get pod leaderboard (teams in a specific pod)
 */
export async function getPodLeaderboard(gameId: string, podId: string): Promise<Team[]> {
  return await TeamModel.findByPod(gameId, podId);
}

/**
 * Check if a game can have pods assigned
 * (needs at least 4 teams for meaningful pod competition)
 */
export async function canAssignPods(gameId: string, minPodSize: number = 3): Promise<boolean> {
  const teams = await TeamModel.findByGame(gameId);
  return teams.length >= minPodSize;
}

/**
 * Balanced pod assignment (future implementation)
 * Distributes teams across pods to balance skill levels
 */
export async function assignPodsBalanced(gameId: string, podSize: number): Promise<PodInfo[]> {
  // For now, use random assignment
  // TODO: Implement skill-based balancing using historical data or pre-assessment scores
  return await assignPodsRandomly(gameId, podSize);
}
