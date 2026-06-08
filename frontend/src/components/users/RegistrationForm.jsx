/**
 * RegistrationForm — Name input + register/update button with face detection preview.
 *
 * @param {string} regName - Current name input value
 * @param {function} setRegName - Name setter
 * @param {boolean} regLoading - Whether registration is in progress
 * @param {string|null} rawImage - Raw captured image (needed for new registrations)
 * @param {string|null} previewImg - Detection preview image
 * @param {object|null} editUser - User being edited (null for new registration)
 * @param {function} onRegister - Register/update callback
 * @param {function} onCancelEdit - Cancel edit mode callback
 * @param {Array} users - List of existing users for datalist autocomplete
 */
import { UserPlus, Edit2, Save, Loader2 } from "lucide-react";
import { Loader3D, Button } from "../common";
import DetectionResult from "../scanner/DetectionResult";

export default function RegistrationForm({
  regName,
  setRegName,
  regLoading,
  rawImage,
  previewImg,
  detectedFaces = [],
  editUser,
  rawVoice,
  onRegister,
  onCancelEdit,
  users,
}) {
  const showForm = rawImage || editUser;

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        {editUser ? (
          <Edit2 className="w-5 h-5 text-primary" />
        ) : (
          <UserPlus className="w-5 h-5 text-primary" />
        )}
        {editUser ? "Update User" : "Register New Face"}
      </h2>
      <p className="text-xs opacity-50 mb-5">
        {editUser
          ? "Change name, upload a new photo, or record a new voice to update the user's profile."
          : "Upload a photo or capture from camera to register a new identity"}
      </p>

      {/* Detection preview */}
      {previewImg && (
        <div className="mb-4">
          <DetectionResult rawImage={previewImg} faces={detectedFaces} />
        </div>
      )}

      {/* Loading indicator */}
      {regLoading && <Loader3D text="Processing face on backend..." />}

      {/* Name input & register */}
      {showForm && (
        <div className="flex flex-col gap-3 slide-up mt-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Name</span>
              {!editUser && (
                <span className="label-text-alt opacity-70">
                  Type new or pick existing
                </span>
              )}
            </label>
            <input
              type="text"
              list="registered-names"
              className="input input-bordered input-sm"
              placeholder="Enter person's name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onRegister()}
            />
            <datalist id="registered-names">
              {users.map((u) => (
                <option key={u.id} value={u.name} />
              ))}
            </datalist>
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="flex-1 gap-2"
              onClick={onRegister}
              disabled={(editUser ? (!regName.trim() && !rawImage && !rawVoice) : !regName.trim()) || regLoading}
            >
              {regLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editUser ? (
                <Save className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {editUser ? "Update" : "Register"}
            </Button>
            {editUser && (
              <Button variant="ghost" size="sm" onClick={onCancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
