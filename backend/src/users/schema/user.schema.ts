import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'user'],
      default: 'user',
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password required only if not using Google auth
      },
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    resetCode: String,
    resetCodeExpires: Date,
    resetCodeVerified: Boolean,
    passwordChangedAt: {
      type: Date,
    },
    avatar: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
  },
  { timestamps: true },
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  const user = this as any;

  // Skip password hashing if password is not modified, doesn't exist, or user is using Google auth
  if (
    !user.isModified('password') ||
    !user.password ||
    user.provider === 'google'
  ) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);

  next();
});

// Compare entered password with hashed password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if password changed after JWT was issued
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp: number) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000,
    );
    return JWTTimestamp < changedTimestamp; // true => password changed after token issued
  }

  return false;
};
