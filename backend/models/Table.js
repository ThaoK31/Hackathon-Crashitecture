import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { TABLE_CONDITIONS } from '../utils/constants.js';

const Table = sequelize.define('Table', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100]
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Souk Ynov Toulouse'
  },
  condition: {
    type: DataTypes.ENUM(
      TABLE_CONDITIONS.EXCELLENT,
      TABLE_CONDITIONS.GOOD,
      TABLE_CONDITIONS.WORN,
      TABLE_CONDITIONS.NEEDS_MAINTENANCE
    ),
    defaultValue: TABLE_CONDITIONS.GOOD,
    allowNull: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'tables',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Table;

