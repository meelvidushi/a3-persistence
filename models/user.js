import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    modelData: [{ model: String, year: Number, mpg: Number }], // Example user data
});

const User = mongoose.model('User', userSchema);

export default User;
