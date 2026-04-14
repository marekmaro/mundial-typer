import mongoose, { Schema, Document } from 'mongoose';

export interface IMatch extends Document {
  providerMatchId: string;
  stage: string;
  group?: string; // NOWE POLE
  homeTeam: string;
  awayTeam: string;
  kickoffUtc: Date;
  status: 'SCHEDULED' | 'LIVE' | 'FINISHED';
  score: { home: number | null; away: number | null };
  scoreOverride: { home: number; away: number; updatedAt: Date } | null;
}

const MatchSchema: Schema = new Schema({
  providerMatchId: { type: String, required: true, unique: true },
  stage: { type: String, required: true },
  group: { type: String, required: false },
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  kickoffUtc: { type: Date, required: true },
  status: { type: String, enum: ['SCHEDULED', 'LIVE', 'FINISHED'], default: 'SCHEDULED' },
  score: {
    home: { type: Number, default: null },
    away: { type: Number, default: null },
  },
  scoreOverride: {
    home: { type: Number },
    away: { type: Number },
    updatedAt: { type: Date },
  },
});

MatchSchema.index({ kickoffUtc: 1 });
export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
