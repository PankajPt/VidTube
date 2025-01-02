import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "userId"
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: "video"
        },

    },{timestamps: true}
)

const Like = mongoose.model("Like", likeSchema)

export default Like