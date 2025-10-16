import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { RESERVATION_STATUS } from '../utils/constants.js';

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  table_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tables',
      key: 'id'
    }
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStart(value) {
        if (value <= this.start_time) {
          throw new Error('La date de fin doit être après la date de début');
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM(
      RESERVATION_STATUS.ACTIVE,
      RESERVATION_STATUS.CANCELLED,
      RESERVATION_STATUS.COMPLETED
    ),
    defaultValue: RESERVATION_STATUS.ACTIVE,
    allowNull: false
  }
}, {
  tableName: 'reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Reservation;

