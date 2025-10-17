import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { TEAM_COLORS, PLAYER_ROLES } from '../utils/constants.js';

const GamePlayer = sequelize.define('GamePlayer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  game_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  team_color: {
    type: DataTypes.ENUM(TEAM_COLORS.RED, TEAM_COLORS.BLUE),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM(PLAYER_ROLES.ATTACK, PLAYER_ROLES.DEFENSE),
    allowNull: false
  },
  goals: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  assists: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  saves: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'game_players',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default GamePlayer;

