import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  nick: string;
  tokenHash: string;
  rawToken: string; // JAWNY TOKEN DO PODEJRZENIA
  blocked: boolean;
  company: string;
  predictedWinner?: string;
  createdAt: Date;
}

const PlayerSchema = new Schema({
  nick: { type: String, required: true },
  tokenHash: { type: String, required: true, unique: true },
  rawToken: { type: String, required: true },
  blocked: { type: Boolean, default: false },
  company: { type: String, default: 'Ogólna' },
  predictedWinner: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);
