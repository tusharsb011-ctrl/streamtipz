const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, default: 'alert-box' }, // alert-box, goal-bar, etc.
    settings: {
        minAmount: { type: Number, default: 1 },
        duration: { type: Number, default: 5000 },
        image: { type: String, default: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHJqZ3R6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6Z2J6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9pZCZjdD1n/3o7TKMGpxPvkO2i9fG/giphy.gif' },
        sound: { type: String, default: 'https://www.myinstants.com/media/sounds/notification.mp3' },
        messageTemplate: { type: String, default: '{name} donated {amount}!' },
        fontColor: { type: String, default: '#ffffff' },
        backgroundColor: { type: String, default: 'rgba(0,0,0,0)' }
    }
});

module.exports = mongoose.model('Widget', widgetSchema);
