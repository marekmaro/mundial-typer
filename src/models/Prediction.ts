import mongoose, { Schema, Document } from 'mongoose';

export interface IPrediction extends Document {
  playerId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  home: number;
  away: number;
  points: number | null;
  isJoker: boolean; // NOWE POLE
  updatedAt: Date;
}

const PredictionSchema: Schema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  home: { type: Number, required: true },
  away: { type: Number, required: true },
  points: { type: Number, default: null },
  isJoker: { type: Boolean, default: false },
}, { timestamps: true });

PredictionSchema.index({ playerId: 1, matchId: 1 }, { unique: true });
export default mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema);
