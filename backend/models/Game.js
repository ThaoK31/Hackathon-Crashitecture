import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { GAME_STATUS } from '../utils/constants.js';

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tables',
      key: 'id'
    }
  },
  team_red_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  team_blue_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM(GAME_STATUS.ONGOING, GAME_STATUS.FINISHED),
    defaultValue: GAME_STATUS.ONGOING,
    allowNull: false
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ended_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'games',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Game;

