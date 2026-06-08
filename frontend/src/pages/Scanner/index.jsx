/**
 * Scanner Page — Face detection and attendance scanning.
 * Composes: useCamera, useToast hooks + CameraPreview, CameraControls,
 * DetectionResult, FaceGrid, Loader3D, ToastContainer components.
 */
import { useState, useEffect, useCallback } from "react";
import {
  ScanLine,
  Upload,
  Mic,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "../../hooks";
import {
  scanAttendance,
  submitAttendance,
  listUsers,
} from "../../services/api";
import { Loader3D, ToastContainer, BiometricCapture, Button } from "../../components/common";
import ConfidenceBar from "../../components/common/ConfidenceBar";
import { DetectionResult } from "../../components/scanner";

export default function Scanner() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [autoScan, setAutoScan] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [capturedVoice, setCapturedVoice] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [scanMode, setScanMode] = useState("both"); // "face", "voice", "both", "stepwise"

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [corrections, setCorrections] = useState({});
  const [voiceCorrection, setVoiceCorrection] = useState(null);

  // Fetch registered users for the correction dropdown
  useEffect(() => {
    listUsers()
      .then((r) => setRegisteredUsers(r.data || []))
      .catch(() => {});
  }, []);

  // ── Scan ──
  // Note: toast.clearToast/setError are stable refs (useState setters + useCallback),
  // so they don't need to be in the dependency array.
  const scan = useCallback(
    async ({ image, voiceBlob }) => {
      setLoading(true);
      toast.clearToast();
      setCorrections({});
      setVoiceCorrection(null);
      setCapturedVoice(voiceBlob || null);
      setCapturedImage(image || null);
      try {
        const res = await scanAttendance(image, voiceBlob);
        setResult(res.data);
      } catch (e) {
        toast.setError(e.message);
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  // ── Corrections ──
  const handleCorrection = (idx, field, value) => {
    setCorrections((prev) => ({
      ...prev,
      [idx]: { ...prev[idx], [field]: value },
    }));
  };

  // ── Submit ──
  const handleSubmit = async () => {
    let entries = [];

    if (scanMode === "face" || scanMode === "both" || scanMode === "stepwise") {
      if (!result?.faces?.length) {
        toast.setError("No faces detected to submit.");
        return;
      }
    }

    const currentVoiceName = voiceCorrection || result?.voice_match?.name;

    if (
      scanMode === "voice" ||
      scanMode === "both" ||
      scanMode === "stepwise"
    ) {
      if (!currentVoiceName) {
        toast.setError(
          scanMode === "both"
            ? "Authentication Failed: Voice not recognized. Both Face and Voice must match!"
            : "Authentication Failed: Voice not recognized.",
        );
        return;
      }
    }

    setSubmitting(true);
    toast.clearToast();
    try {
      if (
        scanMode === "face" ||
        scanMode === "both" ||
        scanMode === "stepwise"
      ) {
        entries = result.faces.map((face, i) => {
          const correction = corrections[i];
          const corrected =
            correction?.user_id && correction.user_id !== (face.user_id || "");
          const selectedUser = registeredUsers.find(
            (u) => u.id === correction?.user_id,
          );
          return {
            user_id: correction?.user_id || face.user_id || null,
            final_name: corrected
              ? selectedUser?.name || face.name || "Unknown"
              : face.name || "Unknown",
            original_prediction: face.name || null,
            confidence: face.confidence || 0,
            was_corrected: corrected,
            face_box: face.box || null,
          };
        });

        if (scanMode === "both" || scanMode === "stepwise") {
          const isValid2FA = entries.some(
            (entry) => entry.final_name === currentVoiceName,
          );
          if (!isValid2FA) {
            toast.setError(
              `Authentication Failed: Face does not match the voice (${currentVoiceName}).`,
            );
            setSubmitting(false);
            return;
          }
        }
      } else if (scanMode === "voice") {
        entries = [
          {
            user_id: currentVoiceName,
            final_name: currentVoiceName,
            original_prediction: result?.voice_match?.name || currentVoiceName,
            confidence: result.voice_match.confidence || 0,
            was_corrected:
              !!voiceCorrection &&
              voiceCorrection !== result?.voice_match?.name,
            face_box: null,
          },
        ];
      }

      const res = await submitAttendance(entries);
      toast.setMsg(
        res.message ||
          `Attendance submitted successfully via ${scanMode === "both" || scanMode === "stepwise" ? "Face + Voice 2FA" : scanMode === "face" ? "Face Recognition" : "Voice Recognition"}!`,
      );
    } catch (e) {
      toast.setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="space-y-6 fade-in">
      {/* Controls */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" />
            Scanner
          </h2>
          <select
            className="select select-primary select-sm max-w-xs w-full sm:w-auto font-semibold"
            value={scanMode}
            onChange={(e) => {
              setScanMode(e.target.value);
              setResult(null);
            }}
          >
            <option value="both">2-in-1 (Simultaneous)</option>
            <option value="stepwise">2-in-1 (Step-wise)</option>
            <option value="face">Face Only</option>
            <option value="voice">Voice Only</option>
          </select>
        </div>

        <p className="text-xs opacity-50 mb-5 border-l-2 border-primary pl-2">
          {scanMode === "both" &&
            "Click 'Start 2-in-1 Scan' to automatically begin recording your voice and capture your face at the same time."}
          {scanMode === "stepwise" &&
            "Step-wise: First capture your face, then record your voice, and finally verify both."}
          {scanMode === "face" &&
            "Scan your face or upload an image to mark attendance."}
          {scanMode === "voice" && "Record your voice to mark attendance."}
        </p>

        <BiometricCapture
          mode={scanMode}
          onCapture={scan}
          loading={loading}
          autoScan={autoScan}
          onAutoScanChange={setAutoScan}
          toast={toast}
        />

        {loading && (
          <Loader3D text={`Analyzing ${scanMode === "both" ? "Face & Voice" : scanMode === "face" ? "Face" : "Voice"}...`} />
        )}
        {loading && scanMode === "stepwise" && (
          <Loader3D text="Verifying Face & Voice..." />
        )}
      </div>

      {/* 2FA Authentication Report / Match Report */}
      {result && (
        <div
          className={`glass-card p-6 mt-6 border-2 ${
            scanMode === "both" || scanMode === "stepwise"
              ? result.faces?.length > 0 &&
                result.faces.some((f) => {
                  const faceName = corrections[0]?.user_id
                    ? registeredUsers.find(
                        (u) => u.id === corrections[0].user_id,
                      )?.name
                    : f.name;
                  return (
                    faceName === (voiceCorrection || result.voice_match?.name)
                  );
                })
                ? "border-success/50 bg-success/5"
                : "border-error/50 bg-error/5"
              : scanMode === "face"
                ? result.faces?.length > 0 && result.faces[0]?.name
                  ? "border-success/50 bg-success/5"
                  : "border-warning/50 bg-warning/5"
                : voiceCorrection || result.voice_match?.name
                  ? "border-success/50 bg-success/5"
                  : "border-error/50 bg-error/5"
          }`}
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <ScanLine className="w-5 h-5" />
            {scanMode === "both" || scanMode === "stepwise"
              ? "2FA Authentication Report"
              : `${scanMode === "face" ? "Face" : "Voice"} Match Report`}
          </h3>
          <div
            className={`grid ${scanMode === "both" || scanMode === "stepwise" ? "sm:grid-cols-2" : "grid-cols-1"} gap-6`}
          >
            {(scanMode === "voice" ||
              scanMode === "both" ||
              scanMode === "stepwise") &&
              result?.voice_match && (
                <div className="flex flex-col gap-2 p-4 bg-base-100/50 rounded-xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm opacity-70 flex items-center gap-2">
                      <Mic className="w-4 h-4" /> Voice Match
                    </span>
                    <select
                      className="select select-bordered select-xs w-full max-w-[140px]"
                      value={voiceCorrection || result.voice_match.name || ""}
                      onChange={(e) => setVoiceCorrection(e.target.value)}
                    >
                      <option value="" disabled>
                        Correct Match...
                      </option>
                      {registeredUsers.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="font-bold text-lg text-primary flex items-center gap-2">
                    {voiceCorrection || result.voice_match.name || "Unknown"}
                    {voiceCorrection &&
                      voiceCorrection !== result.voice_match.name && (
                        <span className="text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                          Corrected
                        </span>
                      )}
                  </div>
                  <ConfidenceBar
                    value={(result.voice_match.confidence || 0) * 100}
                    width="w-full"
                  />
                  {capturedVoice && (
                    <div className="mt-2">
                      <span className="text-xs opacity-50 block mb-1">
                        Played Voice:
                      </span>
                      <audio
                        src={URL.createObjectURL(capturedVoice)}
                        controls
                        className="h-8 w-full"
                      />
                    </div>
                  )}
                </div>
              )}

            {(scanMode === "face" ||
              scanMode === "both" ||
              scanMode === "stepwise") &&
              result?.faces && result.faces.length > 0 ? (
                <div className="mt-4 overflow-x-auto bg-base-100/50 rounded-xl border border-base-content/5">
                  <table className="table table-zebra table-sm md:table-md w-full">
                    <thead>
                      <tr>
                        <th>Face</th>
                        <th>Name</th>
                        <th className="w-1/3">Confidence</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.faces.map((face, index) => {
                        const correction = corrections[index];
                        const isCorrected = !!correction?.user_id;
                        let finalName = face.name || "Unknown";
                        if (isCorrected) {
                          const user = registeredUsers.find(
                            (u) => u.id === correction.user_id,
                          );
                          if (user) finalName = user.name;
                        }

                        return (
                          <tr key={index}>
                            <td className="font-semibold opacity-70 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <ScanLine className="w-4 h-4" /> Face {index + 1}
                              </div>
                            </td>
                            <td className="whitespace-nowrap">
                              <div className="font-bold text-secondary flex items-center gap-2">
                                {finalName}
                                {isCorrected && (
                                  <span className="text-[10px] text-warning bg-warning/10 px-2 py-0.5 rounded-full">
                                    Corrected
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <ConfidenceBar
                                value={(face.confidence || 0) * 100}
                                width="w-full"
                              />
                            </td>
                            <td>
                              <select
                                className="select select-bordered select-xs w-full max-w-[140px]"
                                value={correction?.user_id || ""}
                                onChange={(e) =>
                                  handleCorrection(index, "user_id", e.target.value)
                                }
                              >
                                <option value="" disabled>
                                  Correct Match...
                                </option>
                                {registeredUsers.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                (scanMode === "face" || scanMode === "both" || scanMode === "stepwise") && result?.faces && (
                  <div className="p-4 bg-base-100/50 rounded-xl text-center text-sm opacity-50">
                    No face detected
                  </div>
                )
              )}
          </div>

          <div className="mt-6 pt-4 border-t border-base-content/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-semibold">Verification Status:</span>
            {scanMode === "both" || scanMode === "stepwise" ? (
              result.faces?.some((f) => {
                const faceName = corrections[0]?.user_id
                  ? registeredUsers.find((u) => u.id === corrections[0].user_id)
                      ?.name
                  : f.name;
                return (
                  faceName === (voiceCorrection || result.voice_match?.name)
                );
              }) ? (
                <span className="badge badge-success gap-2 px-4 py-3 font-bold">
                  Verified Match
                </span>
              ) : (
                <span className="badge badge-error gap-2 px-4 py-3 font-bold">
                  Mismatch / Unknown
                </span>
              )
            ) : scanMode === "face" ? (
              result.faces?.length > 0 && result.faces[0]?.name ? (
                <span className="badge badge-success gap-2 px-4 py-3 font-bold">
                  Verified
                </span>
              ) : (
                <span className="badge badge-warning gap-2 px-4 py-3 font-bold">
                  Unknown
                </span>
              )
            ) : voiceCorrection || result.voice_match?.name ? (
              <span className="badge badge-success gap-2 px-4 py-3 font-bold">
                Verified
              </span>
            ) : (
              <span className="badge badge-error gap-2 px-4 py-3 font-bold">
                Unknown
              </span>
            )}

            <div className="flex flex-wrap items-center gap-3 sm:ml-auto">

              <Button
                variant="ghost"
                onClick={() => {
                  setResult(null);
                  setCorrections({});
                  setVoiceCorrection(null);
                  toast.clearToast();
                }}
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Annotated image */}
      {(scanMode === "face" ||
        scanMode === "both" ||
        scanMode === "stepwise") &&
        result?.faces && (
          <DetectionResult rawImage={capturedImage} faces={result.faces} corrections={corrections} registeredUsers={registeredUsers} />
        )}

      {/* Toasts */}
      <ToastContainer
        error={toast.error}
        msg={toast.msg}
        onClearError={() => toast.setError("")}
        onClearMsg={() => toast.setMsg("")}
      />
    </div>
  );
}
