import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  nick: string;
  tokenHash: string;
  blocked: boolean;
  company: string;
  predictedWinner?: string; // Wytypowany mistrz
  badges: string[]; // Lista odznak (np. 'fire', 'shield')
  createdAt: Date;
}

const PlayerSchema: Schema = new Schema({
  nick: { type: String, required: true },
  tokenHash: { type: String, required: true, unique: true },
  blocked: { type: Boolean, default: false },
  company: { type: String, default: 'Ogólna' },
  predictedWinner: { type: String },
  badges: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
