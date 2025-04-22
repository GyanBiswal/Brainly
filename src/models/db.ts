import mongoose, {model, Schema} from "mongoose";

const UserSchema = new Schema({
    username: {type: String, unique:true},
    password: String
})

const ContentSchema = new Schema({
    title: String,
    link: String,
    tags: [String],
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
})

export const UserModel = model("User", UserSchema);
export const ContentModel = model("Content", ContentSchema);