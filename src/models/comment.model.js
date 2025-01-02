import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "video"
        },
        content: {
            type: String,
            required: true
        },
        commentBy: {
            type: Schema.Types.ObjectId,
            ref: "userId"
        }
    },{timestamps: true}
)

const Comment = mongoose.model("Comment", commentSchema)

export default Comment