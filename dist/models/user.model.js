import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const UserMongoSchema = new mongoose.Schema({
    email: { type: String, require: true, unique: true },
    name: { type: String, require: true },
    password: { type: String, require: true },
    avatar: String,
}, {
    timestamps: true,
});
UserMongoSchema.pre("save", async function (next) {
    let user = this;
    console.log(' [PRE-SAVE HOOK] Triggered');
    console.log(' [PRE-SAVE HOOK] isModified("password"):', user.isModified("password"));
    console.log(' [PRE-SAVE HOOK] Current password value:', user.password);
    console.log(' [PRE-SAVE HOOK] Password length:', user.password?.length || 0);
    if (!user.isModified("password")) {
        console.log(' [PRE-SAVE HOOK] Password not modified, skipping hash');
        return next();
    }
    console.log(' [PRE-SAVE HOOK] Password was modified, generating hash');
    const salt = await bcrypt.genSalt(10);
    console.log(' [PRE-SAVE HOOK] Salt generated');
    const hash = await bcrypt.hashSync(user.password, salt);
    console.log(' [PRE-SAVE HOOK] Hash generated:', {
        hashLength: hash?.length || 0,
        hashPreview: hash?.substring(0, 20) + '...',
        startsWithBcrypt: hash?.startsWith('$2') || false
    });
    user.password = hash;
    console.log(' [PRE-SAVE HOOK] Password hashed and set');
    return next();
});
UserMongoSchema.methods.comparePassword = async function (candidatePassword) {
    const user = this;
    return await bcrypt.compare(candidatePassword, user.password).catch((e) => { return false; });
};
const UserModel = mongoose.model("User", UserMongoSchema);
export { UserModel };
//# sourceMappingURL=user.model.js.map