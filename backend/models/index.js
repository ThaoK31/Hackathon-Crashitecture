import sequelize from '../config/database.js';
import User from './User.js';
import Table from './Table.js';
import Reservation from './Reservation.js';
import Game from './Game.js';
import GamePlayer from './GamePlayer.js';

// Relations User - Reservation
User.hasMany(Reservation, { foreignKey: 'user_id', as: 'reservations' });
Reservation.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relations Table - Reservation
Table.hasMany(Reservation, { foreignKey: 'table_id', as: 'reservations' });
Reservation.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

// Relations Table - Game
Table.hasMany(Game, { foreignKey: 'table_id', as: 'games' });
Game.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });

// Relations Game - GamePlayer
Game.hasMany(GamePlayer, { foreignKey: 'game_id', as: 'players' });
GamePlayer.belongsTo(Game, { foreignKey: 'game_id', as: 'game' });

// Relations User - GamePlayer
User.hasMany(GamePlayer, { foreignKey: 'user_id', as: 'game_participations' });
GamePlayer.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  sequelize,
  User,
  Table,
  Reservation,
  Game,
  GamePlayer
};

