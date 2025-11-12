import { Request, Response } from 'express';
import { GameModel } from '../models/Game.model';
import { TeamModel } from '../models/Team.model';
import * as podService from '../services/pod.service';
import * as categoryService from '../services/category.service';

/**
 * Assign pods to teams in a game
 * Uses the game's configured pod_size and pod_assignment_method
 */
export const assignPods = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const gameMasterId = req.user!.userId;

    // Verify game exists and user is the GM
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.game_master_id !== gameMasterId) {
      return res.status(403).json({
        success: false,
        message: 'Only the game master can assign pods'
      });
    }

    if (!game.enable_pods) {
      return res.status(400).json({
        success: false,
        message: 'Pod competition is not enabled for this game'
      });
    }

    // Check if there are enough teams
    const canAssign = await podService.canAssignPods(gameId, game.pod_size);

    if (!canAssign) {
      return res.status(400).json({
        success: false,
        message: `Not enough teams. Minimum ${game.pod_size} teams required for pod assignment`
      });
    }

    // Assign pods based on configured method
    let pods;
    switch (game.pod_assignment_method) {
      case 'random':
        pods = await podService.assignPodsRandomly(gameId, game.pod_size);
        break;
      case 'balanced':
        pods = await podService.assignPodsBalanced(gameId, game.pod_size);
        break;
      case 'manual':
        return res.status(400).json({
          success: false,
          message: 'Manual pod assignment requires individual team assignments'
        });
      default:
        pods = await podService.assignPodsRandomly(gameId, game.pod_size);
    }

    res.json({
      success: true,
      message: `Successfully assigned ${pods.length} pods`,
      pods
    });
  } catch (error) {
    console.error('Error assigning pods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign pods'
    });
  }
};

/**
 * Get all pods for a game with team details
 */
export const getGamePods = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;

    // Verify game exists
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const pods = await podService.getGamePods(gameId);

    res.json({
      success: true,
      enable_pods: game.enable_pods,
      pod_size: game.pod_size,
      pod_assignment_method: game.pod_assignment_method,
      pods
    });
  } catch (error) {
    console.error('Error fetching game pods:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch game pods'
    });
  }
};

/**
 * Get leaderboard for a specific pod
 */
export const getPodLeaderboard = async (req: Request, res: Response) => {
  try {
    const { gameId, podId } = req.params;

    // Verify game exists
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const teams = await podService.getPodLeaderboard(gameId, podId);

    res.json({
      success: true,
      pod_id: podId,
      team_count: teams.length,
      teams
    });
  } catch (error) {
    console.error('Error fetching pod leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pod leaderboard'
    });
  }
};

/**
 * Manually assign a team to a specific pod
 * Used for manual pod assignment mode
 */
export const assignTeamToPod = async (req: Request, res: Response) => {
  try {
    const { gameId, teamId } = req.params;
    const { pod_id, pod_name } = req.body;
    const gameMasterId = req.user!.userId;

    // Verify game exists and user is the GM
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.game_master_id !== gameMasterId) {
      return res.status(403).json({
        success: false,
        message: 'Only the game master can assign teams to pods'
      });
    }

    if (!game.enable_pods) {
      return res.status(400).json({
        success: false,
        message: 'Pod competition is not enabled for this game'
      });
    }

    // Verify team exists and belongs to this game
    const team = await TeamModel.findById(teamId);

    if (!team || team.game_id !== gameId) {
      return res.status(404).json({
        success: false,
        message: 'Team not found in this game'
      });
    }

    // Assign team to pod
    const updatedTeam = await podService.assignTeamToPod(teamId, pod_id, pod_name);

    res.json({
      success: true,
      message: `Team ${team.name} assigned to ${pod_name}`,
      team: updatedTeam
    });
  } catch (error) {
    console.error('Error assigning team to pod:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign team to pod'
    });
  }
};

/**
 * Get category rankings for a game
 * Returns leaders in each category (both pod and global scopes)
 */
export const getCategoryRankings = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { session_id } = req.query;

    // Verify game exists
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (!game.enable_category_awards) {
      return res.status(400).json({
        success: false,
        message: 'Category awards are not enabled for this game'
      });
    }

    const sessionId = session_id ? session_id as string : null;
    const summary = await categoryService.getCategoryAwardsSummary(gameId, sessionId);

    res.json({
      success: true,
      global_awards: summary.global_awards,
      pod_awards: Object.fromEntries(summary.pod_awards)
    });
  } catch (error) {
    console.error('Error fetching category rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category rankings'
    });
  }
};

/**
 * Get leaderboard for a specific category
 */
export const getCategoryLeaderboard = async (req: Request, res: Response) => {
  try {
    const { gameId, category } = req.params;
    const { scope, pod_id, session_id } = req.query;

    // Verify game exists
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (!game.enable_category_awards) {
      return res.status(400).json({
        success: false,
        message: 'Category awards are not enabled for this game'
      });
    }

    // Validate category
    const validCategories = ['financial', 'operations', 'marketing', 'hr', 'customer_satisfaction', 'overall'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      });
    }

    // Validate scope
    const scopeValue = (scope as string) || 'global';
    if (!['pod', 'global'].includes(scopeValue)) {
      return res.status(400).json({
        success: false,
        message: 'Scope must be either "pod" or "global"'
      });
    }

    const podId = scopeValue === 'pod' ? (pod_id as string) : null;
    const sessionId = session_id ? session_id as string : null;

    const rankings = await categoryService.getCategoryLeaderboard(
      gameId,
      category as categoryService.CategoryType,
      scopeValue as categoryService.ScopeType,
      podId,
      sessionId
    );

    res.json({
      success: true,
      category,
      scope: scopeValue,
      pod_id: podId,
      rankings
    });
  } catch (error) {
    console.error('Error fetching category leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category leaderboard'
    });
  }
};

/**
 * Get all category rankings for a specific team
 */
export const getTeamCategoryRankings = async (req: Request, res: Response) => {
  try {
    const { gameId, teamId } = req.params;
    const { session_id } = req.query;

    // Verify game exists
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const sessionId = session_id ? session_id as string : null;
    const rankings = await categoryService.getTeamCategoryRankings(gameId, teamId, sessionId);

    if (!rankings) {
      return res.status(404).json({
        success: false,
        message: 'Team not found in this game'
      });
    }

    // Get team awards
    const awards = await categoryService.getTeamAwards(gameId, teamId, sessionId);

    res.json({
      success: true,
      ...rankings,
      awards
    });
  } catch (error) {
    console.error('Error fetching team category rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team category rankings'
    });
  }
};

/**
 * Snapshot category rankings at session end
 * Persists current rankings to category_rankings table
 */
export const snapshotCategoryRankings = async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { session_id } = req.body;
    const gameMasterId = req.user!.userId;

    // Verify game exists and user is the GM
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    if (game.game_master_id !== gameMasterId) {
      return res.status(403).json({
        success: false,
        message: 'Only the game master can snapshot rankings'
      });
    }

    if (!game.enable_category_awards) {
      return res.status(400).json({
        success: false,
        message: 'Category awards are not enabled for this game'
      });
    }

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const count = await categoryService.snapshotCategoryRankings(gameId, session_id);

    res.json({
      success: true,
      message: `Successfully snapshotted ${count} category rankings`,
      count
    });
  } catch (error) {
    console.error('Error snapshotting category rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to snapshot category rankings'
    });
  }
};

/**
 * Get historical category rankings for a session
 */
export const getHistoricalCategoryRankings = async (req: Request, res: Response) => {
  try {
    const { gameId, sessionId } = req.params;
    const { category, scope, pod_id } = req.query;

    // Verify game exists
    const game = await GameModel.findById(gameId);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Game not found'
      });
    }

    const rankings = await categoryService.getHistoricalCategoryRankings(
      gameId,
      sessionId,
      category as categoryService.CategoryType | undefined,
      scope as categoryService.ScopeType | undefined,
      pod_id as string | undefined
    );

    res.json({
      success: true,
      session_id: sessionId,
      rankings
    });
  } catch (error) {
    console.error('Error fetching historical category rankings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical category rankings'
    });
  }
};
