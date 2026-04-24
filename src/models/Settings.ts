import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  maintenanceMode: boolean;
  globalMessage: string;
  tournamentWinner: string;
}

const SettingsSchema = new Schema({
  maintenanceMode: { type: Boolean, default: false },
  globalMessage: { type: String, default: "" },
  tournamentWinner: { type: String, default: "" }
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
