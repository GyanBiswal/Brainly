import mongoose, {model, Schema} from "mongoose";

const UserSchema = new Schema({
    username: {type: String, unique:true},
    password: String
})

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [String],
    type: { type: String, enum: ['youtube', 'twitter', 'documents', 'links'], required: true },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
})


const LinkSchema = new Schema({
    hash: { type: String, required: true, unique: true },
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    contentId: { type: mongoose.Types.ObjectId, ref: 'Content', required: true },
    createdAt: { type: Date, default: Date.now }
});  

export const UserModel = model("User", UserSchema);
export const ContentModel = model("Content", ContentSchema);
export const LinkModel = model("Links", LinkSchema);