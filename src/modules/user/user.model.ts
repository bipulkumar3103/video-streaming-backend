import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface IUser extends Document {
    _id: Types.ObjectId;

    // Identity
    name: string;
    email: string;
    passwordHash: string;

    // Access control
    role: UserRole;
    status: UserStatus;

    // Account lifecycle
    emailVerified: boolean;
    lastLoginAt?: Date;

    // Future scalability
    permissions: string[];
    subscriptionId?: Types.ObjectId;

    // Security
    loginAttempts: number;
    lockUntil?: Date;

    // Audit
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            index: true,
        },

        passwordHash: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["USER", "ADMIN", "SUPER_ADMIN"],
            default: "USER",
        },

        status: {
            type: String,
            enum: ["ACTIVE", "SUSPENDED", "DELETED"],
            default: "ACTIVE",
            index: true,
        },

        emailVerified: {
            type: Boolean,
            default: false,
        },

        lastLoginAt: Date,

        permissions: {
            type: [String],
            default: [],
        },

        subscriptionId: {
            type: Schema.Types.ObjectId,
            ref: "Subscription",
        },

        loginAttempts: {
            type: Number,
            default: 0,
        },

        lockUntil: {
            type: Date,
            index: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret: any) {
                ret.passwordHash = undefined;
                ret.loginAttempts = undefined;
                ret.lockUntil = undefined;
                return ret;
            },
        },
    }
);

// Performance index
UserSchema.index({ email: 1, status: 1 });

export const User = model<IUser>("User", UserSchema);
