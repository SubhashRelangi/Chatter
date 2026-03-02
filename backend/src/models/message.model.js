import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text:{
        type: String,
        trim: true,
        default: ""
    },
    image:{
        type: String,
        default: "",
    },
    isEncrypted: {
        type: Boolean,
        default: false,
    },
    encryptionIv: {
        type: String,
        default: "",
    },
    senderPublicKey: {
        type: String,
        default: "",
    }
},{
    timestamps: true
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
