import mongoose from 'mongoose';

const connectionRequestSchema = new mongoose.Schema( {
    fromUserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    status : {
        type: 'String',
        enum : {
            values: ["interested", "ignore", "accepted", "rejected"],
            message: 'Status must be either "interested", "ignore", "accepted", or "rejected"'
        },
        required: true
    }
},{ timestamps: true});

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });

connectionRequestSchema.pre('save', function(next) {
    const connectionRequest = this;
    if(connectionRequest.fromUserId.toString() === connectionRequest.toUserId.toString()) {
        throw new Error("You cannot send a connection request to yourself");
    }
    next();
})

const ConnectionRequestModel = mongoose.model('ConnectionRequestModel', connectionRequestSchema);
export default ConnectionRequestModel;