import User from './user.model.js';
import Transaction from './transaction.model.js';

// Define Associations
User.hasMany(Transaction, { as: 'sentTransactions', foreignKey: 'fromUserId' });
User.hasMany(Transaction, { as: 'receivedTransactions', foreignKey: 'toUserId' });

Transaction.belongsTo(User, { as: 'sender', foreignKey: 'fromUserId' });
Transaction.belongsTo(User, { as: 'receiver', foreignKey: 'toUserId' });

export { User, Transaction };
