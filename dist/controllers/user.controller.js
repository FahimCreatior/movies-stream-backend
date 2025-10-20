import { createUser, deactivateUser, validatePassword, } from '../services/user.service.js';
import { UserModel } from '../models/user.model.js';
import { signJWT } from '../utils/jwt.utils.js';
import _ from 'lodash';
import bcrypt from 'bcrypt';
const signUpHandler = async (req, res) => {
    try {
        console.log('SignUp Debug:', {
            bodyKeys: Object.keys(req.body),
            hasPassword: !!req.body.password,
            hasPasswordConfirmation: !!req.body.passwordConfirmation
        });
        const user = await UserModel.findOne({ email: req.body.email });
        if (user) {
            console.log('SignUp: User already exists:', req.body.email);
            return res.status(409).send(`User with email ${user.email} already exists`);
        }
        // Create user
        console.log('SignUp: Creating new user');
        const newUser = await createUser(req.body);
        console.log('SignUp: User created, generating tokens');
        // base64 encoded image data is too big to be put in jwt header --> separate query for profile avatar
        const accessToken = signJWT({ ...newUser, avatar: _ }, { expiresIn: '15m' }); // 15mins
        const refreshToken = signJWT({ ...newUser, avatar: _ }, { expiresIn: '1y' }); //1 year
        console.log('SignUp: Tokens generated successfully', {
            accessTokenLength: accessToken?.length,
            refreshTokenLength: refreshToken?.length
        });
        return res.status(201).json({
            user: newUser,
            accessToken,
            refreshToken,
        });
    }
    catch (e) {
        console.error('SignUp Error:', e.message);
        return res.status(400).send(e.message);
    }
};
const signInHandler = async (req, res) => {
    try {
        console.log('🔑 SignIn endpoint called');
        console.log('🔑 Request body keys:', Object.keys(req.body));
        console.log('🔑 Has email:', !!req.body.email);
        console.log('🔑 Has password:', !!req.body.password);
        const user = await validatePassword(req.body);
        if (!user) {
            console.log('❌ SignIn: Invalid credentials for:', req.body.email);
            return res.status(403).send('Invalid email or password.');
        }
        console.log('✅ SignIn: User found, generating tokens');
        // base64 encoded image data is too big to be put in jwt header --> separate query for profile avatar
        const accessToken = signJWT({ ...user, avatar: _ }, { expiresIn: '15m' }); // 15mins
        const refreshToken = signJWT({ ...user, avatar: _ }, { expiresIn: '1y' }); //1 year
        console.log('✅ SignIn: Tokens generated successfully', {
            accessTokenLength: accessToken?.length,
            refreshTokenLength: refreshToken?.length,
            userId: user._id
        });
        return res.status(200).json({
            user,
            accessToken,
            refreshToken,
        });
    }
    catch (e) {
        console.error('❌ SignIn Error:', e.message);
        console.error('❌ SignIn Error Stack:', e.stack);
        return res.status(400).send(e.message);
    }
};
const signOutHandler = async (req, res) => {
    try {
        // For token-based auth, signout is handled on the client side by removing tokens
        return res.status(200).json({ message: 'Sign out successfully.' });
    }
    catch (e) {
        return res.status(400).send(e.message);
    }
};
const userDeactivateHandler = async (req, res) => {
    try {
        const success = await deactivateUser({
            _id: res.locals.user._id,
            password: req.body.password,
        });
        if (!success)
            return res.status(401).send('Wrong confirmation password.');
        return res.status(200).json({ message: 'Deactivate user successfully.' });
    }
    catch (e) {
        return res.status(400).send(e.message);
    }
};
// const avatarUploadHandler = async (req: Request<{}, {}, UserUpdateType>, res: Response) => {
//   try {
//     const user = await UserModel.findOne({ email: res.locals.user.email });
//     if (!user) return res.status(404).send('User not found.');
//   } catch (e: any) {
//     res.status(409).send(e.message);
//   }
// };
const userUpdateHandler = async (req, res) => {
    try {
        console.log('🔧 [USER UPDATE] Handler called with:', {
            queryType: req.query.type,
            bodyKeys: Object.keys(req.body),
            body: req.body
        });
        let user = await UserModel.findOne({ _id: res.locals.user._id });
        if (!user)
            return res.status(404).send('User not found.');
        console.log('User found:', {
            id: user._id,
            email: user.email,
            hasPassword: !!user.password,
            passwordLength: user.password?.length || 0
        });
        if (req.query.type === 'password') {
            const currentPassword = req.body.currentPassword;
            const newPassword = req.body.newPassword;
            console.log('🔐 [PASSWORD UPDATE] Step 1: Request received');
            console.log('🔐 [PASSWORD UPDATE] Request body:', {
                hasCurrent: !!currentPassword,
                hasNew: !!newPassword,
                currentLength: currentPassword?.length || 0,
                newLength: newPassword?.length || 0,
                currentPasswordValue: currentPassword,
                newPasswordValue: newPassword
            });
            console.log('🔐 [PASSWORD UPDATE] Step 2: Current user password hash');
            console.log('🔐 [PASSWORD UPDATE] User password hash:', {
                hash: user.password,
                hashLength: user.password?.length || 0
            });
            if (!currentPassword || !newPassword) {
                console.error('❌ [PASSWORD UPDATE] Missing password data');
                return res.status(400).send('Missing password data');
            }
            console.log('🔐 [PASSWORD UPDATE] Step 3: Verifying current password with bcrypt.compare');
            const isValid = await bcrypt.compare(currentPassword, user.password);
            console.log('🔐 [PASSWORD UPDATE] bcrypt.compare result:', isValid);
            if (!isValid) {
                console.error('❌ [PASSWORD UPDATE] Current password verification FAILED');
                return res.status(401).send('Current password is incorrect');
            }
            console.log('✅ [PASSWORD UPDATE] Current password verified successfully');
            console.log('🔐 [PASSWORD UPDATE] Step 4: Setting new password');
            console.log('🔐 [PASSWORD UPDATE] Password BEFORE update:', user.password);
            user.password = newPassword;
            user.markModified('password');
            console.log('🔐 [PASSWORD UPDATE] Password AFTER setting (before save):', user.password);
            console.log('🔐 [PASSWORD UPDATE] isModified("password"):', user.isModified('password'));
            console.log('🔐 [PASSWORD UPDATE] Step 5: Saving user to database');
            await user.save();
            console.log('✅ [PASSWORD UPDATE] User saved to database');
            console.log('🔐 [PASSWORD UPDATE] Step 6: Verifying password was saved correctly');
            const savedUser = await UserModel.findOne({ _id: user._id });
            console.log('🔐 [PASSWORD UPDATE] Saved user password hash:', {
                hash: savedUser?.password,
                hashLength: savedUser?.password?.length || 0,
                isHashed: savedUser?.password?.startsWith('$2') || false
            });
            console.log('🔐 [PASSWORD UPDATE] Step 7: Testing if new password works');
            const testNewPassword = await bcrypt.compare(newPassword, savedUser.password);
            console.log('🔐 [PASSWORD UPDATE] New password test result:', testNewPassword);
            console.log('🔐 [PASSWORD UPDATE] Step 8: Testing if old password still works');
            const testOldPassword = await bcrypt.compare(currentPassword, savedUser.password);
            console.log('🔐 [PASSWORD UPDATE] Old password test result:', testOldPassword);
            if (!testNewPassword) {
                console.error('❌ [PASSWORD UPDATE] CRITICAL: New password does NOT work after save!');
                console.error('❌ [PASSWORD UPDATE] This indicates the pre-save hook did not hash the password');
            }
            if (testOldPassword) {
                console.error('❌ [PASSWORD UPDATE] CRITICAL: Old password STILL works after save!');
                console.error('❌ [PASSWORD UPDATE] This indicates the password was NOT actually updated in the database');
            }
            console.log('✅ [PASSWORD UPDATE] Returning updated user object');
            return res.status(200).send(savedUser);
        }
        else if (req.query.type === 'avatar') {
            //From base64 data to store buffer data in mongodb --> avatar: {data, contentType}
            // const dataStart = base64Data.indexOf(',') + 1;
            // const contentTypeStart = base64Data.indexOf(':') + 1;
            // const contentTypeEnd = base64Data.indexOf(';');
            // const data = Buffer.from(base64Data.slice(dataStart), 'base64');
            // const contentType = base64Data.slice(contentTypeStart, contentTypeEnd);
            const base64Data = req.body.avatar_url;
            user.avatar = base64Data;
        }
        else {
            user.name = req.body.name ?? user.name;
            user.email = req.body.email ?? user.email;
        }
        await user.save();
        return res.status(201).send(user);
    }
    catch (e) {
        res.status(409).send(e.message);
    }
};
const userQueryHandler = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: res.locals.user._id });
        if (!user)
            return res.status(404).send('User not found.');
        return res.send(user);
    }
    catch (e) {
        res.status(400).send(e.message);
    }
};
export { signUpHandler, signInHandler, signOutHandler, userDeactivateHandler, userQueryHandler, userUpdateHandler, };
//# sourceMappingURL=user.controller.js.map